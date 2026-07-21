import {
  getSquareConnection,
  missingServerEnv,
  sendJson,
  squareApplicationId,
  squareConnectionHasScope,
  squareEnvironment,
} from '../square-api.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'no-store')

  try {
    const missing = missingServerEnv()
    if (missing.length > 0) {
      return sendJson(res, 200, { available: false, reason: 'not_configured' })
    }

    const connection = await getSquareConnection()
    if (!connection?.location_id) {
      return sendJson(res, 200, { available: false, reason: 'not_connected' })
    }

    if (!squareConnectionHasScope(connection, 'PAYMENTS_WRITE')) {
      return sendJson(res, 200, { available: false, reason: 'reconnect_required' })
    }

    return sendJson(res, 200, {
      available: true,
      applicationId: squareApplicationId(),
      locationId: connection.location_id,
      environment: squareEnvironment(),
    })
  } catch (error) {
    return sendJson(res, 200, { available: false, reason: 'temporarily_unavailable' })
  }
}
