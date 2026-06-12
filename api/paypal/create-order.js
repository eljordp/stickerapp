import {
  buildPayPalOrderPayload,
  normalizeCheckout,
  paypalFetch,
  readBody,
  requirePayPalEnv,
  sendJson,
} from '../../server/paypal-api.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requirePayPalEnv(res)) return

  try {
    const body = await readBody(req)
    const checkout = normalizeCheckout(body)
    const order = await paypalFetch('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify(buildPayPalOrderPayload(checkout)),
    })

    sendJson(res, 200, {
      id: order.id,
      status: order.status,
      amount: checkout.total.toFixed(2),
    })
  } catch (error) {
    sendJson(res, error.status || 400, {
      error: error.message || 'Could not create PayPal order.',
      details: error.paypal?.details,
    })
  }
}
