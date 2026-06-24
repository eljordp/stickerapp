const rateLimitBuckets = globalThis.__tssRequestRateLimits || new Map()
globalThis.__tssRequestRateLimits = rateLimitBuckets

function header(req, name) {
  return req.headers?.[name] || req.headers?.[name.toLowerCase()] || ''
}

function clientIp(req) {
  return String(header(req, 'x-forwarded-for') || header(req, 'x-real-ip') || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
}

function cleanHost(value) {
  return String(value || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

function hostFromUrl(value) {
  try {
    return new URL(value).host.toLowerCase()
  } catch {
    return ''
  }
}

export function consumeRateLimit(req, { key, limit, windowMs }) {
  const now = Date.now()
  const bucketKey = `${key}:${clientIp(req)}`
  const bucket = rateLimitBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs }

  if (bucket.resetAt <= now) {
    bucket.count = 0
    bucket.resetAt = now + windowMs
  }

  bucket.count += 1
  rateLimitBuckets.set(bucketKey, bucket)

  return {
    allowed: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

export function requireTrustedBrowserRequest(req, trustedHosts = []) {
  const requestHost = cleanHost(header(req, 'x-forwarded-host') || header(req, 'host'))
  const allowedHosts = new Set([
    requestHost,
    'tssprint.com',
    'www.tssprint.com',
    ...trustedHosts.map(cleanHost),
  ].filter(Boolean))

  const fetchSite = String(header(req, 'sec-fetch-site')).toLowerCase()
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    const error = new Error('Artwork uploads must be started from tssprint.com.')
    error.status = 403
    throw error
  }

  const originHost = hostFromUrl(header(req, 'origin'))
  const refererHost = hostFromUrl(header(req, 'referer'))
  const presentedHost = originHost || refererHost

  if (!presentedHost || !allowedHosts.has(presentedHost)) {
    const error = new Error('Artwork uploads must be started from tssprint.com.')
    error.status = 403
    throw error
  }
}
