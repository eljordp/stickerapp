import {
  getSquareConnection,
  requireAdmin,
  requireEnv,
  sendJson,
  squareFetch,
  updateSquarePaymentVerification,
} from '../square-api.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requireEnv(res)) return

  try {
    await requireAdmin(req)
    const requestUrl = new URL(req.url, 'https://tssprint.com')
    const paymentId = String(requestUrl.searchParams.get('paymentID') || '').trim()
    if (!paymentId) return sendJson(res, 400, { error: 'Missing Square payment ID.' })

    const connection = await getSquareConnection({ includeToken: true })
    if (!connection?.access_token) return sendJson(res, 503, { error: 'Square is not connected.' })

    const result = await squareFetch(`/v2/payments/${encodeURIComponent(paymentId)}`, connection.access_token)
    const payment = result?.payment
    if (!payment?.id) return sendJson(res, 404, { error: 'Square payment not found.' })

    await updateSquarePaymentVerification(payment)
    return sendJson(res, 200, {
      paymentStatus: payment.status === 'COMPLETED' ? 'captured' : 'not_captured',
      verifiedAt: new Date().toISOString(),
      paymentId: payment.id,
      amount: Number(payment?.amount_money?.amount || 0) / 100,
      currency: payment?.amount_money?.currency || 'USD',
      status: payment.status,
    })
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Could not verify the Square payment.' })
  }
}
