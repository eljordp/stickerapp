import { requireAdmin, sendJson, supabaseFetch } from '../../server/square-api.js'

function header(req, name) {
  const value = req.headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value || ''
}

function decodeHeaderValue(value) {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function clientIp(req) {
  const forwarded = header(req, 'x-forwarded-for')
  const vercelForwarded = header(req, 'x-vercel-forwarded-for')
  const realIp = header(req, 'x-real-ip')
  const raw = forwarded || vercelForwarded || realIp
  const ip = raw.split(',')[0]?.trim()
  return ip || null
}

function truncate(value, max) {
  if (!value) return null
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

async function hasSeenIp(userId, ipAddress) {
  if (!userId || !ipAddress) return false
  const rows = await supabaseFetch(
    `/rest/v1/admin_audit_events?user_id=eq.${encodeURIComponent(userId)}&ip_address=eq.${encodeURIComponent(ipAddress)}&select=id&limit=1`,
    { method: 'GET' },
  )
  return Array.isArray(rows) && rows.length > 0
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'no-store')

  try {
    const user = await requireAdmin(req)
    const ipAddress = clientIp(req)
    const knownIp = await hasSeenIp(user.id, ipAddress)
    const userAgent = truncate(header(req, 'user-agent'), 1000)
    const country = decodeHeaderValue(header(req, 'x-vercel-ip-country'))
    const region = decodeHeaderValue(header(req, 'x-vercel-ip-country-region'))
    const city = decodeHeaderValue(header(req, 'x-vercel-ip-city'))

    const payload = {
      user_id: user.id,
      email: user.email || null,
      event_type: 'admin_login_success',
      outcome: 'success',
      ip_address: ipAddress,
      country,
      region,
      city,
      user_agent: userAgent,
      path: '/admin',
      referrer: truncate(header(req, 'referer'), 1000),
      metadata: {
        is_new_ip_for_user: Boolean(ipAddress && !knownIp),
        vercel_id: header(req, 'x-vercel-id') || null,
      },
    }

    const rows = await supabaseFetch('/rest/v1/admin_audit_events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return sendJson(res, 200, { ok: true, event: Array.isArray(rows) ? rows[0] : null })
  } catch (error) {
    const status = error.message === 'Missing admin session.' ? 401 : 403
    return sendJson(res, status, { error: error.message || 'Could not record admin login.' })
  }
}
