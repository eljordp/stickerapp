import { createArtworkUpload } from '../../server/supabase-storage.js'
import { readBody, sendJson } from '../../server/paypal-api.js'
import { consumeRateLimit, requireTrustedBrowserRequest } from '../../server/request-guards.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    requireTrustedBrowserRequest(req)
    const limit = consumeRateLimit(req, {
      key: 'artwork-upload',
      limit: 8,
      windowMs: 15 * 60 * 1000,
    })
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retryAfter))
      return sendJson(res, 429, { error: 'Too many artwork upload attempts. Please wait a few minutes and try again.' })
    }

    const body = await readBody(req)
    const upload = await createArtworkUpload({
      fileName: body?.fileName,
      contentType: body?.contentType,
      size: body?.size,
    })

    sendJson(res, 200, upload)
  } catch (error) {
    sendJson(res, error.status || 400, { error: error.message || 'Could not prepare artwork upload.' })
  }
}
