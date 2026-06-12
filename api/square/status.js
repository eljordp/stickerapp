import { getSquareConnection, missingServerEnv, redirectUri, requireAdmin, sendJson } from '../../server/square-api.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const missing = missingServerEnv()
    if (missing.includes('SUPABASE_URL or VITE_SUPABASE_URL') || missing.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return sendJson(res, 200, {
        connected: false,
        connection: null,
        missing,
        redirectUri: redirectUri(),
      })
    }

    await requireAdmin(req)
    const connection = missing.length === 0 ? await getSquareConnection() : null
    sendJson(res, 200, {
      connected: !!connection,
      connection,
      missing,
      redirectUri: redirectUri(),
    })
  } catch (error) {
    sendJson(res, 401, { error: error.message || 'Could not load Square status.' })
  }
}
