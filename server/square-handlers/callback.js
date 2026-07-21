import { consumeOauthState, exchangeSquareCode, saveSquareConnection } from '../square-api.js'

function envValue(name) {
  const raw = process.env[name]
  if (!raw) return ''
  const trimmed = raw.trim()
  const quoted = trimmed.match(/^(['"])(.*)\1$/)
  return quoted ? quoted[2].trim() : trimmed
}

const SITE_URL = (envValue('SITE_URL') || 'https://tssprint.com').replace(/\/$/, '')

function redirect(res, params) {
  const url = new URL('/admin', SITE_URL)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value || '').replace(/[\r\n]/g, ' '))
  })
  res.statusCode = 302
  res.setHeader('Location', url.toString())
  res.end()
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method not allowed')
    return
  }

  const url = new URL(req.url, SITE_URL)
  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (error) return redirect(res, { square: 'error', message: error })
  if (!code || !state) return redirect(res, { square: 'error', message: 'missing_code_or_state' })

  try {
    let stateRow
    try {
      stateRow = await consumeOauthState(state)
    } catch (stateError) {
      throw new Error(`state: ${stateError.message || 'invalid_state'}`)
    }

    let tokenData
    try {
      tokenData = await exchangeSquareCode(code)
    } catch (tokenError) {
      throw new Error(`token_exchange: ${tokenError.message || 'token_exchange_failed'}`)
    }

    try {
      await saveSquareConnection(tokenData, stateRow.user_id)
    } catch (saveError) {
      throw new Error(`save_connection: ${saveError.message || 'save_failed'}`)
    }

    redirect(res, { square: 'connected' })
  } catch (callbackError) {
    const message = callbackError.message || 'connect_failed'
    console.error('[square/callback] connection failed', { message })
    redirect(res, { square: 'error', message })
  }
}
