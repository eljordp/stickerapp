import { disconnectSquare, requireAdmin, requireEnv, sendJson } from '../../server/square-api.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requireEnv(res)) return

  try {
    await requireAdmin(req)
    await disconnectSquare()
    sendJson(res, 200, { success: true })
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Could not disconnect Square.' })
  }
}
