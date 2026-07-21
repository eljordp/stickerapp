import callback from '../../server/square-handlers/callback.js'
import checkoutConfig from '../../server/square-handlers/checkout-config.js'
import connect from '../../server/square-handlers/connect.js'
import createInvoice from '../../server/square-handlers/create-invoice.js'
import createPayment from '../../server/square-handlers/create-payment.js'
import disconnect from '../../server/square-handlers/disconnect.js'
import status from '../../server/square-handlers/status.js'
import verifyPayment from '../../server/square-handlers/verify-payment.js'
import { sendJson } from '../../server/square-api.js'

const handlers = {
  callback,
  'checkout-config': checkoutConfig,
  connect,
  'create-invoice': createInvoice,
  'create-payment': createPayment,
  disconnect,
  status,
  'verify-payment': verifyPayment,
}

export default async function handler(req, res) {
  const requestUrl = new URL(req.url, 'https://tssprint.com')
  const action = String(req.query?.action || requestUrl.pathname.split('/').filter(Boolean).at(-1) || '')
  const actionHandler = handlers[action]
  if (!actionHandler) return sendJson(res, 404, { error: 'Square route not found.' })
  return actionHandler(req, res)
}
