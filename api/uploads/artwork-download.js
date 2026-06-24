import { createArtworkDownloadUrl } from '../../server/supabase-storage.js'
import { sendJson } from '../../server/paypal-api.js'
import { requireAdmin } from '../../server/square-api.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    await requireAdmin(req)
    const url = new URL(req.url || '/', `https://${req.headers.host || 'tssprint.com'}`)
    const signedUrl = await createArtworkDownloadUrl(
      url.searchParams.get('path'),
      url.searchParams.get('name') || 'artwork-file'
    )

    sendJson(res, 200, { url: signedUrl })
  } catch (error) {
    const status = error.message === 'Missing admin session.' ? 401 : 403
    sendJson(res, status, { error: error.message || 'Could not download artwork.' })
  }
}
