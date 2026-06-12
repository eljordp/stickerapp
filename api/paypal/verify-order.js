import {
  getCompletedCapture,
  paypalFetch,
  readBody,
  requirePayPalEnv,
  sendJson,
} from '../../server/paypal-api.js'

function getOrderIdFromRequest(req, body) {
  if (req.method === 'GET') {
    const url = new URL(req.url || '/', `https://${req.headers.host || 'tssprint.com'}`)
    return String(url.searchParams.get('orderID') || url.searchParams.get('id') || '').trim()
  }
  return String(body?.orderID || body?.id || '').trim()
}

function isPayPalNotFound(error) {
  const issue = error.paypal?.details?.[0]?.issue
  return error.status === 404 || issue === 'RESOURCE_NOT_FOUND'
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requirePayPalEnv(res)) return

  let orderID = ''

  try {
    const body = req.method === 'POST' ? await readBody(req) : null
    orderID = getOrderIdFromRequest(req, body)
    if (!orderID) return sendJson(res, 400, { error: 'Missing PayPal order ID.' })

    const paypalOrder = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderID)}`)
    const capture = getCompletedCapture(paypalOrder)

    sendJson(res, 200, {
      id: paypalOrder?.id || orderID,
      orderID: paypalOrder?.id || orderID,
      paypalStatus: paypalOrder?.status || 'UNKNOWN',
      paymentStatus: capture ? 'captured' : 'not_captured',
      captured: Boolean(capture),
      captureId: capture?.id,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (isPayPalNotFound(error)) {
      return sendJson(res, 200, {
        id: orderID,
        orderID,
        paypalStatus: 'NOT_FOUND',
        paymentStatus: 'not_found',
        captured: false,
        verifiedAt: new Date().toISOString(),
        error: 'No live PayPal order/payment was found for this ID.',
      })
    }

    sendJson(res, error.status || 400, {
      error: error.message || 'Could not verify PayPal order.',
      details: error.paypal?.details,
    })
  }
}
