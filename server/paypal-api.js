function envValue(name) {
  const raw = process.env[name]
  if (!raw) return ''
  const trimmed = raw.trim()
  const quoted = trimmed.match(/^(['"])(.*)\1$/)
  return quoted ? quoted[2] : trimmed
}

const PAYPAL_CLIENT_ID = envValue('PAYPAL_CLIENT_ID') || envValue('VITE_PAYPAL_CLIENT_ID')
const PAYPAL_CLIENT_SECRET = envValue('PAYPAL_CLIENT_SECRET')
const PAYPAL_ENV = (envValue('PAYPAL_ENV') || envValue('PAYPAL_MODE') || 'live').toLowerCase()
const SUPABASE_URL = envValue('SUPABASE_URL') || envValue('VITE_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = envValue('SUPABASE_SERVICE_ROLE_KEY') || envValue('SUPABASE_SECRET_KEY') || envValue('SUPABASE_SERVICE_KEY')

const CURRENCY = 'USD'
const DEFAULT_PROMOS = {
  AUTO10: { type: 'percent', value: 10, minOrder: 35 },
  WELCOME15: { type: 'percent', value: 15, minOrder: 50 },
  FIRST10: { type: 'fixed', value: 10, minOrder: 50 },
}

export function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function missingPayPalEnv() {
  return [
    ['PAYPAL_CLIENT_ID or VITE_PAYPAL_CLIENT_ID', PAYPAL_CLIENT_ID],
    ['PAYPAL_CLIENT_SECRET', PAYPAL_CLIENT_SECRET],
  ].filter(([, value]) => !value).map(([name]) => name)
}

export function requirePayPalEnv(res) {
  const missing = missingPayPalEnv()
  if (missing.length === 0) return true
  sendJson(res, 500, { error: 'PayPal server environment is not configured.', missing })
  return false
}

function paypalBaseUrl() {
  return PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

function toMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

function moneyString(value) {
  return toMoney(value).toFixed(2)
}

function sanitizeText(value, fallback = '') {
  return String(value || fallback).trim()
}

function truncate(value, length) {
  return sanitizeText(value).slice(0, length)
}

function parseJson(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function normalizeItem(item) {
  const name = truncate(item?.name, 127)
  const option = truncate(item?.option, 80)
  const size = truncate(item?.size, 80)
  const quantity = Math.floor(Number(item?.quantity))
  const price = toMoney(item?.price)

  if (!name || !option || !size) throw new Error('Every checkout item needs a name, option, and size.')
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10000) throw new Error('Invalid item quantity.')
  if (!Number.isFinite(price) || price < 0 || price > 50000) throw new Error('Invalid item price.')

  const addOns = Array.isArray(item?.addOns)
    ? item.addOns.map((addOn) => {
      const addOnName = truncate(addOn?.name, 80)
      const addOnPrice = toMoney(addOn?.price)
      if (!addOnName || !Number.isFinite(addOnPrice) || addOnPrice < 0 || addOnPrice > 50000) {
        throw new Error('Invalid item add-on.')
      }
      return { name: addOnName, price: addOnPrice }
    })
    : []

  const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
  const unitPrice = toMoney(price + addOnTotal)
  const lineTotal = toMoney(unitPrice * quantity)
  const artwork = normalizeArtwork(item?.artwork)

  return {
    id: sanitizeText(item?.id),
    name,
    option,
    size,
    material: truncate(item?.material, 80) || undefined,
    shape: truncate(item?.shape, 80) || undefined,
    dimensions: truncate(item?.dimensions, 80) || undefined,
    artworkIntent: ['uploaded', 'send_later', 'design_help'].includes(item?.artworkIntent)
      ? item.artworkIntent
      : undefined,
    price,
    quantity,
    addOns,
    artwork,
    unitPrice,
    lineTotal,
  }
}

function normalizeArtwork(artwork) {
  if (!artwork?.path) return undefined

  return {
    bucket: truncate(artwork.bucket, 80) || 'order-artwork',
    path: truncate(artwork.path, 500),
    fileName: truncate(artwork.fileName, 160) || 'artwork-file',
    contentType: truncate(artwork.contentType, 120) || 'application/octet-stream',
    size: Math.max(0, Math.floor(Number(artwork.size) || 0)),
    uploadedAt: truncate(artwork.uploadedAt, 40) || new Date().toISOString(),
  }
}

function promoDiscountFor(code, subtotal, requestedDiscount) {
  if (!code) return 0
  const normalized = sanitizeText(code).toUpperCase()
  const promo = DEFAULT_PROMOS[normalized]

  if (promo) {
    if (subtotal < promo.minOrder) return 0
    return promo.type === 'percent'
      ? toMoney(subtotal * (promo.value / 100))
      : Math.min(promo.value, subtotal)
  }

  // Legacy/referral promo codes currently live in the client app. Keep them working,
  // but cap them so the browser cannot send a ridiculous discount to PayPal.
  const requested = Math.max(0, toMoney(requestedDiscount))
  const maxDiscount = toMoney(subtotal * 0.3)
  return Math.min(requested, maxDiscount)
}

function normalizeCustomer(customerInfo = {}) {
  const deliveryMethod = customerInfo.deliveryMethod === 'pickup' ? 'pickup' : 'shipping'
  const firstName = truncate(customerInfo.firstName, 80)
  const lastName = truncate(customerInfo.lastName, 80)
  const email = truncate(customerInfo.email, 160).toLowerCase()
  const phone = truncate(customerInfo.phone, 40)
  const address = truncate(customerInfo.address, 300)
  const city = truncate(customerInfo.city, 120)
  const state = truncate(customerInfo.state, 20).toUpperCase()
  const zip = truncate(customerInfo.zip, 20)

  if (!firstName || !lastName || !email) {
    throw new Error('Customer name and email are required before payment.')
  }
  if (deliveryMethod === 'shipping' && (!address || !city || !state || !zip)) {
    throw new Error('A complete shipping address is required for delivery.')
  }

  return { deliveryMethod, firstName, lastName, email, phone, address, city, state, zip }
}

function normalizeTouch(touch = {}) {
  return {
    capturedAt: truncate(touch?.capturedAt, 40) || null,
    landingPage: truncate(touch?.landingPage, 500) || null,
    referrer: truncate(touch?.referrer, 1000) || null,
    source: truncate(touch?.source, 120) || 'direct',
    medium: truncate(touch?.medium, 120) || '(none)',
    campaign: truncate(touch?.campaign, 200) || null,
    content: truncate(touch?.content, 200) || null,
    term: truncate(touch?.term, 200) || null,
    gclid: truncate(touch?.gclid, 300) || null,
    msclkid: truncate(touch?.msclkid, 300) || null,
    fbclid: truncate(touch?.fbclid, 300) || null,
  }
}

function normalizeAttribution(attribution) {
  if (!attribution || typeof attribution !== 'object') return null
  return {
    firstTouch: normalizeTouch(attribution.firstTouch),
    lastTouch: normalizeTouch(attribution.lastTouch),
  }
}

export function normalizeCheckout(body) {
  const items = Array.isArray(body?.items) ? body.items.map(normalizeItem) : []
  if (items.length === 0) throw new Error('Cart is empty.')

  const customer = normalizeCustomer(body?.customerInfo)
  const subtotal = toMoney(items.reduce((sum, item) => sum + item.lineTotal, 0))
  const discount = promoDiscountFor(body?.promoCode, subtotal, body?.promoDiscount)
  const total = toMoney(Math.max(0, subtotal - discount))
  const clientTotal = body?.total == null ? total : toMoney(body.total)

  if (Math.abs(clientTotal - total) > 0.01) {
    throw new Error('Checkout total changed. Please refresh your cart and try again.')
  }

  return {
    items,
    customer,
    subtotal,
    discount,
    total,
    promoCode: sanitizeText(body?.promoCode).toUpperCase() || null,
    description: truncate(
      body?.orderDescription || items.map((item) => `${item.name} (${item.option}, ${item.size}) x${item.quantity}`).join(', '),
      127
    ),
    visitorId: truncate(body?.visitorId, 120) || null,
    sessionId: truncate(body?.sessionId, 120) || null,
    attribution: normalizeAttribution(body?.attribution),
  }
}

async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const text = await response.text()
  const data = parseJson(text)
  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || text || `PayPal OAuth ${response.status}`)
  }
  if (!data?.access_token) throw new Error('PayPal did not return an access token.')
  return data.access_token
}

export async function paypalFetch(path, options = {}) {
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${paypalBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  const data = parseJson(text)
  if (!response.ok) {
    const message = data?.details?.[0]?.description || data?.message || data?.error_description || data?.error || text || `PayPal ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.paypal = data
    throw error
  }
  return data
}

export function getCompletedCapture(paypalOrder) {
  const captures = paypalOrder?.purchase_units?.flatMap((unit) => unit?.payments?.captures || []) || []
  return captures.find((capture) => capture?.status === 'COMPLETED') || null
}

export function buildPayPalOrderPayload(checkout) {
  const amount = {
    currency_code: CURRENCY,
    value: moneyString(checkout.total),
    breakdown: {
      item_total: { currency_code: CURRENCY, value: moneyString(checkout.subtotal) },
    },
  }

  if (checkout.discount > 0) {
    amount.breakdown.discount = { currency_code: CURRENCY, value: moneyString(checkout.discount) }
  }

  const purchaseUnit = {
    description: checkout.description,
    amount,
    items: checkout.items.map((item) => ({
      name: item.name,
      unit_amount: { currency_code: CURRENCY, value: moneyString(item.unitPrice) },
      quantity: String(item.quantity),
      description: truncate(`${item.option} · ${item.size}`, 127),
      category: 'PHYSICAL_GOODS',
    })),
  }

  if (checkout.customer.deliveryMethod === 'shipping') {
    purchaseUnit.shipping = {
      name: { full_name: `${checkout.customer.firstName} ${checkout.customer.lastName}` },
      address: {
        address_line_1: checkout.customer.address,
        admin_area_2: checkout.customer.city,
        admin_area_1: checkout.customer.state,
        postal_code: checkout.customer.zip,
        country_code: 'US',
      },
    }
  }

  return {
    intent: 'CAPTURE',
    application_context: {
      shipping_preference: checkout.customer.deliveryMethod === 'pickup' ? 'NO_SHIPPING' : 'SET_PROVIDED_ADDRESS',
    },
    purchase_units: [purchaseUnit],
  }
}

async function upsertSupabaseOrder(payload) {
  return fetch(`${SUPABASE_URL}/rest/v1/orders?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  })
}

function responseLooksLikeMissingColumn(status, data, text) {
  const message = `${data?.message || ''} ${data?.error || ''} ${data?.hint || ''} ${text || ''}`.toLowerCase()
  return status === 400 && (
    message.includes('payment_status') ||
    message.includes('payment_provider') ||
    message.includes('payment_reference') ||
    message.includes('paypal_capture_id') ||
    message.includes('payment_verified_at') ||
    message.includes('payment_amount') ||
    message.includes('payment_currency') ||
    message.includes('schema cache') ||
    message.includes('column')
  )
}

export async function saveCapturedOrder(orderID, checkout, paypalOrder) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { saved: false, reason: 'Supabase service role environment is not configured.' }
  }

  const completedCapture = getCompletedCapture(paypalOrder)
  const basePayload = {
    id: orderID,
    customer_first_name: checkout.customer.firstName,
    customer_last_name: checkout.customer.lastName,
    customer_email: checkout.customer.email,
    customer_phone: checkout.customer.phone,
    customer_address: checkout.customer.deliveryMethod === 'pickup' ? 'Local pickup' : checkout.customer.address,
    customer_city: checkout.customer.deliveryMethod === 'pickup' ? 'Hayward' : checkout.customer.city,
    customer_state: checkout.customer.deliveryMethod === 'pickup' ? 'CA' : checkout.customer.state,
    customer_zip: checkout.customer.deliveryMethod === 'pickup' ? '94545' : checkout.customer.zip,
    items: checkout.items.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      option: item.option,
      price: item.price,
      quantity: item.quantity,
      addOns: item.addOns,
      material: item.material,
      shape: item.shape,
      dimensions: item.dimensions,
      artwork: item.artwork,
      artworkIntent: item.artworkIntent,
    })),
    total: checkout.total,
    status: 'processing',
    visitor_id: checkout.visitorId,
    session_id: checkout.sessionId,
    attribution: checkout.attribution,
  }

  const extendedPayload = {
    ...basePayload,
    payment_status: 'captured',
    payment_provider: 'paypal',
    payment_reference: orderID,
    paypal_capture_id: completedCapture?.id || null,
    payment_verified_at: new Date().toISOString(),
    payment_amount: completedCapture?.amount?.value || checkout.total,
    payment_currency: completedCapture?.amount?.currency_code || 'USD',
  }

  let response = await upsertSupabaseOrder(extendedPayload)
  let text = response.ok ? '' : await response.text()
  let data = parseJson(text)

  if (!response.ok && responseLooksLikeMissingColumn(response.status, data, text)) {
    response = await upsertSupabaseOrder(basePayload)
    text = response.ok ? '' : await response.text()
    data = parseJson(text)
  }

  if (!response.ok) {
    return { saved: false, reason: data?.message || data?.error || text || `Supabase ${response.status}` }
  }

  return { saved: true }
}
