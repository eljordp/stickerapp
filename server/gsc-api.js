// Google Search Console Data API helper.
// Auth uses a service-account JWT (RS256) exchanged for an access token —
// no external dependency. Configure via env:
//   GSC_SERVICE_ACCOUNT_JSON  full service-account key JSON (one line)
//   GSC_SITE_URL              property, e.g. "sc-domain:tssprint.com" or "https://tssprint.com/"
import crypto from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

export function gscConfig() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON
  const siteUrl = process.env.GSC_SITE_URL
  if (!raw || !siteUrl) return null
  let sa
  try {
    sa = JSON.parse(raw)
  } catch {
    return null
  }
  if (!sa.client_email || !sa.private_key) return null
  return { clientEmail: sa.client_email, privateKey: sa.private_key, siteUrl }
}

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

export async function getAccessToken({ clientEmail, privateKey }) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }))
  const signingInput = `${header}.${claim}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signingInput)
  signer.end()
  const signature = signer.sign(privateKey).toString('base64url')
  const assertion = `${signingInput}.${signature}`

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(data.error_description || data.error || 'Google token exchange failed')
  return data.access_token
}

export async function querySearchAnalytics(token, siteUrl, body) {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await resp.json()
  if (!resp.ok) {
    const msg = data?.error?.message || 'Search Console query failed'
    const err = new Error(msg)
    err.status = resp.status
    throw err
  }
  return data
}

// YYYY-MM-DD for `daysAgo` days before today (UTC).
export function isoDate(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400000)
  return d.toISOString().slice(0, 10)
}
