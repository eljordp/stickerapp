import { createArtworkUpload } from '../../server/supabase-storage.js'
import { readBody, sendJson } from '../../server/paypal-api.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const body = await readBody(req)
    const upload = await createArtworkUpload({
      fileName: body?.fileName,
      contentType: body?.contentType,
      size: body?.size,
    })

    sendJson(res, 200, upload)
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Could not prepare artwork upload.' })
  }
}
