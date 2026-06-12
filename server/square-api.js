import crypto from 'node:crypto'

function envValue(name) {
  const raw = process.env[name]
  if (!raw) return ''
  const trimmed = raw.trim()
  const quoted = trimmed.match(/^(['"])(.*)\1$/)
  const value = quoted ? quoted[2].trim() : trimmed
  return value.replace(/^(?:\\r|\\n)+|(?:\\r|\\n)+$/g, '').trim()
}

const SUPABASE_URL = envValue('SUPABASE_URL') || envValue('VITE_SUPABASE_URL')
const SUPABASE_ANON_KEY = envValue('SUPABASE_ANON_KEY') || envValue('VITE_SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = envValue('SUPABASE_SERVICE_ROLE_KEY') || envValue('SUPABASE_SECRET_KEY') || envValue('SUPABASE_SERVICE_KEY')
const SQUARE_APPLICATION_ID = envValue('SQUARE_APPLICATION_ID') || envValue('SQUARE_APP_ID')
const SQUARE_APPLICATION_SECRET = envValue('SQUARE_APPLICATION_SECRET') || envValue('SQUARE_APP_SECRET')
const SQUARE_VERSION = envValue('SQUARE_VERSION') || '2026-05-20'
const SITE_URL = (envValue('SITE_URL') || envValue('VERCEL_PROJECT_PRODUCTION_URL') || 'https://tssprint.com').replace(/\/$/, '')

export const SQUARE_SCOPES = [
  'MERCHANT_PROFILE_READ',
  'CUSTOMERS_READ',
  'CUSTOMERS_WRITE',
  'ORDERS_READ',
  'ORDERS_WRITE',
  'INVOICES_READ',
  'INVOICES_WRITE',
  'PAYMENTS_READ',
]

export function missingServerEnv() {
  return [
    ['SUPABASE_URL or VITE_SUPABASE_URL', SUPABASE_URL],
    ['SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
    ['SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY],
    ['SQUARE_APPLICATION_ID', SQUARE_APPLICATION_ID],
    ['SQUARE_APPLICATION_SECRET', SQUARE_APPLICATION_SECRET],
  ].filter(([, value]) => !value).map(([name]) => name)
}

export function redirectUri() {
  return `${SITE_URL}/api/square/callback`
}

export function squareApplicationId() {
  return SQUARE_APPLICATION_ID
}

export function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export function requireEnv(res) {
  const missing = missingServerEnv()
  if (missing.length === 0) return true
  sendJson(res, 500, { error: 'Square server environment is not configured.', missing })
  return false
}

export function randomState() {
  return crypto.randomBytes(32).toString('hex')
}

export function idempotencyKey() {
  return crypto.randomUUID()
}

export async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function supabaseErrorMessage(data, text) {
  return [data?.msg, data?.message, data?.error_description, data?.error, text]
    .filter(Boolean)
    .join(' ')
}

function isInvalidSupabaseApiKey(data, text) {
  return supabaseErrorMessage(data, text).toLowerCase().includes('invalid api key')
}

function parseJson(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server environment is not configured.')
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const data = parseJson(text)
  if (!response.ok) {
    if (isInvalidSupabaseApiKey(data, text)) {
      throw new Error('Supabase service role key was rejected. Re-add SUPABASE_SERVICE_ROLE_KEY in Vercel from the same Supabase project as VITE_SUPABASE_URL.')
    }
    throw new Error(data?.message || data?.error_description || data?.error || text || `Supabase ${response.status}`)
  }
  return data
}

async function getUserFromJwt(token) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase auth environment is not configured.')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.id) {
    if (isInvalidSupabaseApiKey(data, JSON.stringify(data || {}))) {
      throw new Error('Supabase anon key was rejected. Re-add VITE_SUPABASE_ANON_KEY in Vercel from the same Supabase project as VITE_SUPABASE_URL.')
    }
    throw new Error(data?.msg || data?.message || data?.error_description || 'Not authenticated.')
  }
  return data
}

export async function requireAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('Missing admin session.')

  const user = await getUserFromJwt(token)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ _user_id: user.id, _role: 'admin' }),
  })
  const allowed = await response.json().catch(() => false)
  if (!response.ok) {
    if (isInvalidSupabaseApiKey(allowed, JSON.stringify(allowed || {}))) {
      throw new Error('Supabase anon key was rejected while checking admin role. Re-add VITE_SUPABASE_ANON_KEY in Vercel from the same Supabase project as VITE_SUPABASE_URL.')
    }
    throw new Error(allowed?.message || allowed?.error || 'Could not verify admin role.')
  }
  if (!allowed) throw new Error('Admin access required.')
  return user
}

export async function createOauthState(userId) {
  const state = randomState()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await supabaseFetch('/rest/v1/square_oauth_states', {
    method: 'POST',
    body: JSON.stringify({ state, user_id: userId, expires_at: expiresAt }),
  })
  return state
}

export async function consumeOauthState(state) {
  const rows = await supabaseFetch(`/rest/v1/square_oauth_states?state=eq.${encodeURIComponent(state)}&select=*`)
  const row = rows?.[0]
  if (!row) throw new Error('Invalid Square connection state.')
  if (row.used_at) throw new Error('Square connection state was already used.')
  if (new Date(row.expires_at).getTime() < Date.now()) throw new Error('Square connection state expired.')

  await supabaseFetch(`/rest/v1/square_oauth_states?state=eq.${encodeURIComponent(state)}`, {
    method: 'PATCH',
    body: JSON.stringify({ used_at: new Date().toISOString() }),
  })
  return row
}

export async function squareFetch(path, accessToken, options = {}) {
  const response = await fetch(`https://connect.squareup.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  const data = parseJson(text)
  if (!response.ok) {
    const detail = data?.errors?.[0]?.detail || data?.errors?.[0]?.code || data?.message || text
    throw new Error(detail || `Square ${response.status}`)
  }
  return data
}

function squareErrorMessage(data, fallback) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((error) => [error.category, error.code, error.detail].filter(Boolean).join(': '))
      .filter(Boolean)
      .join('; ')
  }
  return data?.message || fallback
}

export async function exchangeSquareCode(code) {
  const response = await fetch('https://connect.squareup.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SQUARE_APPLICATION_ID,
      client_secret: SQUARE_APPLICATION_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(),
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = squareErrorMessage(data, 'Could not connect Square.')
    if (message === 'Not Authorized') {
      throw new Error('Not Authorized - recheck the Square Production Application ID, OAuth Application Secret, and registered callback URL.')
    }
    throw new Error(message)
  }
  return data
}

async function refreshSquareToken(connection) {
  if (!connection.refresh_token) throw new Error('Square refresh token is missing.')
  const response = await fetch('https://connect.squareup.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: SQUARE_APPLICATION_ID,
      client_secret: SQUARE_APPLICATION_SECRET,
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(squareErrorMessage(data, 'Could not refresh Square token.'))
  }

  const updated = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || connection.refresh_token,
    token_expires_at: data.expires_at || null,
    updated_at: new Date().toISOString(),
    status: 'connected',
  }
  const rows = await supabaseFetch('/rest/v1/square_connections?id=eq.primary', {
    method: 'PATCH',
    body: JSON.stringify(updated),
  })
  return { ...connection, ...updated, ...(rows?.[0] || {}) }
}

export async function getSquareConnection({ includeToken = false } = {}) {
  const rows = await supabaseFetch('/rest/v1/square_connections?id=eq.primary&select=*')
  const connection = rows?.[0]
  if (!connection || connection.status !== 'connected' || !connection.access_token) return null

  let active = connection
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0
  if (expiresAt && expiresAt < Date.now() + 5 * 60 * 1000) {
    active = await refreshSquareToken(connection)
  }

  if (includeToken) return active
  const { access_token, refresh_token, ...safe } = active
  void access_token
  void refresh_token
  return safe
}

function normalizeScopes(scopes) {
  if (Array.isArray(scopes)) return scopes
  if (typeof scopes === 'string') return scopes.split(/\s+/).filter(Boolean)
  return SQUARE_SCOPES
}

export async function saveSquareConnection(tokenData, userId) {
  const locationsData = await squareFetch('/v2/locations', tokenData.access_token)
  const location = (locationsData.locations || []).find((loc) => loc.status === 'ACTIVE') || locationsData.locations?.[0]

  const payload = {
    id: 'primary',
    merchant_id: tokenData.merchant_id || null,
    location_id: location?.id || null,
    location_name: location?.name || null,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    token_expires_at: tokenData.expires_at || null,
    scopes: normalizeScopes(tokenData.scopes),
    status: 'connected',
    connected_by: userId,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await supabaseFetch('/rest/v1/square_connections?on_conflict=id', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  })

  const { access_token, refresh_token, ...safe } = payload
  void access_token
  void refresh_token
  return safe
}

export async function disconnectSquare() {
  await supabaseFetch('/rest/v1/square_connections?id=eq.primary', {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'disconnected',
      access_token: null,
      refresh_token: null,
      updated_at: new Date().toISOString(),
    }),
  })
}

export async function logSquareInvoice(payload) {
  const rows = await supabaseFetch('/rest/v1/square_invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return rows?.[0] || null
}
