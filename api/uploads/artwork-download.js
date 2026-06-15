import { createArtworkDownloadUrl } from '../../server/supabase-storage.js'
import { sendJson } from '../../server/paypal-api.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const url = new URL(req.url || '/', `https://${req.headers.host || 'tssprint.com'}`)
    const signedUrl = await createArtworkDownloadUrl(
      url.searchParams.get('path'),
      url.searchParams.get('name') || 'artwork-file'
    )

    res.statusCode = 302
    res.setHeader('Location', signedUrl)
    res.end()
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Could not download artwork.' })
  }
}
