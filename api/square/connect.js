import { SQUARE_SCOPES, createOauthState, redirectUri, requireAdmin, requireEnv, sendJson, squareApplicationId } from '../../server/square-api.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requireEnv(res)) return

  try {
    const user = await requireAdmin(req)
    const state = await createOauthState(user.id)
    const params = new URLSearchParams({
      client_id: squareApplicationId(),
      redirect_uri: redirectUri(),
      scope: SQUARE_SCOPES.join(' '),
      session: 'false',
      state,
    })

    sendJson(res, 200, {
      authorizationUrl: `https://connect.squareup.com/oauth2/authorize?${params.toString()}`,
      redirectUri: redirectUri(),
    })
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Could not start Square connection.' })
  }
}
