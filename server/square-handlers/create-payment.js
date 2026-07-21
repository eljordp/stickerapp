import { normalizeCheckout } from '../paypal-api.js'
import {
  getSquareConnection,
  readBody,
  requireEnv,
  saveSquareCapturedOrder,
  sendJson,
  squareConnectionHasScope,
  squareFetch,
} from '../square-api.js'

function validAttemptId(value) {
  const attemptId = String(value || '').trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId)
    ? attemptId
    : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requireEnv(res)) return

  try {
    const body = await readBody(req)
    const sourceId = String(body?.sourceId || '').trim()
    const attemptId = validAttemptId(body?.attemptId)
    if (!sourceId || !attemptId) {
      return sendJson(res, 400, { error: 'The card payment session is invalid. Please refresh and try again.' })
    }

    const checkout = normalizeCheckout(body)
    if (!Number.isFinite(checkout.total) || checkout.total <= 0) {
      return sendJson(res, 400, { error: 'The checkout total must be greater than zero.' })
    }

    const connection = await getSquareConnection({ includeToken: true })
    if (!connection?.access_token || !connection.location_id) {
      return sendJson(res, 503, { error: 'Card checkout is temporarily unavailable. Please use PayPal.' })
    }
    if (!squareConnectionHasScope(connection, 'PAYMENTS_WRITE')) {
      return sendJson(res, 503, { error: 'Card checkout needs the store to reconnect Square. Please use PayPal.' })
    }

    const shippingAddress = checkout.customer.deliveryMethod === 'shipping'
      ? {
          address_line_1: checkout.customer.address,
          locality: checkout.customer.city,
          administrative_district_level_1: checkout.customer.state,
          postal_code: checkout.customer.zip,
          country: 'US',
        }
      : undefined

    const result = await squareFetch('/v2/payments', connection.access_token, {
      method: 'POST',
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: `checkout-${attemptId}`,
        amount_money: {
          amount: Math.round(checkout.total * 100),
          currency: 'USD',
        },
        location_id: connection.location_id,
        autocomplete: true,
        buyer_email_address: checkout.customer.email,
        shipping_address: shippingAddress,
        reference_id: `web-${attemptId}`,
        note: checkout.description,
      }),
    })

    const payment = result?.payment
    if (!payment?.id || payment.status !== 'COMPLETED') {
      return sendJson(res, 400, {
        error: 'Square did not confirm a completed card payment.',
        paymentId: payment?.id || null,
        status: payment?.status || null,
      })
    }

    let orderSaved = false
    let orderSaveIssue = ''
    try {
      await saveSquareCapturedOrder(checkout, payment)
      orderSaved = true
    } catch (saveError) {
      orderSaveIssue = saveError instanceof Error ? saveError.message : 'Could not save the captured Square order.'
      console.error('[square/create-payment] captured payment order save failed', { paymentId: payment.id, orderSaveIssue })
    }

    return sendJson(res, 200, {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      receiptUrl: payment.receipt_url || null,
      orderSaved,
      orderSaveIssue: orderSaveIssue || undefined,
    })
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Could not process the card payment.' })
  }
}
