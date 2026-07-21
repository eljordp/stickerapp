import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean | null | undefined
type AnalyticsProperties = Record<string, AnalyticsValue>
type Ga4Params = Record<string, unknown>

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined
const GA4_SCRIPT_ID = 'tss-ga4-script'
const INTERNAL_VERIFICATION_SOURCE = 'codex'
const INTERNAL_VERIFICATION_MEDIUM = 'verification'

type AnalyticsCartItem = {
  name: string
  size?: string
  option?: string
  price: number
  quantity: number
  material?: string
  shape?: string
  addOns?: { name: string; price: number }[]
}

declare global {
  interface Window {
    __tssClickTracking?: boolean
    __tssGa4Configured?: boolean
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

// ─── Visitor / session identity (for the in-app Admin Analytics tab) ──────────
const VISITOR_KEY = 'tss_visitor_id'
const SESSION_KEY = 'tss_session_id'
const ATTRIBUTION_KEY = 'tss_marketing_attribution'

export type MarketingTouch = {
  capturedAt: string
  landingPage: string
  referrer: string | null
  source: string
  medium: string
  campaign: string | null
  content: string | null
  term: string | null
  gclid: string | null
  msclkid: string | null
  fbclid: string | null
}

export type MarketingAttribution = {
  firstTouch: MarketingTouch
  lastTouch: MarketingTouch
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server'
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) { id = randomId(); localStorage.setItem(VISITOR_KEY, id) }
    return id
  } catch {
    return 'anon'
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) { id = randomId(); sessionStorage.setItem(SESSION_KEY, id) }
    return id
  } catch {
    return 'anon'
  }
}

// Lets lead submissions carry the same identity as page_views/click_events,
// so the admin can link a contact form back to that shopper's cart activity.
export function getAnalyticsIdentity() {
  return {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    attribution: getMarketingAttribution(),
  }
}

function organicSource(hostname: string) {
  if (hostname.includes('google.')) return 'google'
  if (hostname.includes('bing.')) return 'bing'
  if (hostname.includes('yahoo.')) return 'yahoo'
  if (hostname.includes('duckduckgo.')) return 'duckduckgo'
  return null
}

function currentMarketingTouch(): MarketingTouch {
  const params = new URLSearchParams(window.location.search)
  const referrer = document.referrer || null
  let source = params.get('utm_source')?.trim().toLowerCase() || ''
  let medium = params.get('utm_medium')?.trim().toLowerCase() || ''

  if (!source && params.get('gclid')) { source = 'google'; medium = 'cpc' }
  if (!source && params.get('msclkid')) { source = 'microsoft'; medium = 'cpc' }
  if (!source && params.get('fbclid')) { source = 'meta'; medium = 'paid-social' }

  if (!source && referrer) {
    try {
      const hostname = new URL(referrer).hostname.toLowerCase()
      if (!hostname.includes('tssprint.com')) {
        const organic = organicSource(hostname)
        source = organic || hostname.replace(/^www\./, '')
        medium = organic ? 'organic' : 'referral'
      }
    } catch { /* malformed referrer; treat as direct */ }
  }

  return {
    capturedAt: new Date().toISOString(),
    landingPage: `${window.location.pathname}${window.location.search}`,
    referrer,
    source: source || 'direct',
    medium: medium || '(none)',
    campaign: params.get('utm_campaign'),
    content: params.get('utm_content'),
    term: params.get('utm_term'),
    gclid: params.get('gclid'),
    msclkid: params.get('msclkid'),
    fbclid: params.get('fbclid'),
  }
}

function hasNewMarketingSignal(touch: MarketingTouch) {
  return touch.source !== 'direct'
    || !!touch.campaign
    || !!touch.gclid
    || !!touch.msclkid
    || !!touch.fbclid
}

export function captureMarketingAttribution(): MarketingAttribution | null {
  if (typeof window === 'undefined') return null
  const touch = currentMarketingTouch()
  try {
    const saved = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || 'null') as MarketingAttribution | null
    const attribution = saved?.firstTouch
      ? { firstTouch: saved.firstTouch, lastTouch: hasNewMarketingSignal(touch) ? touch : saved.lastTouch || saved.firstTouch }
      : { firstTouch: touch, lastTouch: touch }
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
    return attribution
  } catch {
    return { firstTouch: touch, lastTouch: touch }
  }
}

export function getMarketingAttribution(): MarketingAttribution | null {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || 'null') as MarketingAttribution | null
      || captureMarketingAttribution()
  } catch {
    return captureMarketingAttribution()
  }
}

// Fire-and-forget insert. Must NEVER block or throw into a UI action.
function logToSupabase(table: 'page_views' | 'click_events' | 'nav_events', row: Record<string, unknown>) {
  if (typeof window === 'undefined' || shouldSuppressAnalytics()) return
  void import('./supabase')
    .then(({ supabase }) => supabase.from(table).insert(row))
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn(`[analytics] ${table} insert failed:`, error.message)
    })
    .catch((error) => {
      if (import.meta.env.DEV) console.warn(`[analytics] ${table} insert failed:`, error)
    })
}

// Track time-on-page + navigation funnel between route changes.
let lastPath: string | null = null
let lastPathEnteredAt = 0

function cleanProperties(properties: AnalyticsProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null),
  )
}

const STAFF_OPTOUT_KEY = 'tss_analytics_optout'

function shouldSuppressAnalytics() {
  if (typeof window === 'undefined') return false

  // Never record internal/staff areas — keeps owner-facing stats to real customers.
  if (window.location.pathname.startsWith('/admin')) return true
  try {
    if (localStorage.getItem(STAFF_OPTOUT_KEY) === '1') return true
  } catch { /* localStorage unavailable — fall through */ }

  const params = new URLSearchParams(window.location.search)
  const source = params.get('utm_source')?.toLowerCase()
  const medium = params.get('utm_medium')?.toLowerCase()

  return source === INTERNAL_VERIFICATION_SOURCE && medium === INTERNAL_VERIFICATION_MEDIUM
}

// Mark this browser as staff so the owner's own browsing never pollutes customer stats.
// Called when someone reaches the admin dashboard.
export function markStaffDevice() {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STAFF_OPTOUT_KEY, '1') } catch { /* ignore */ }
}

function initGa4() {
  if (typeof window === 'undefined' || !GA4_MEASUREMENT_ID || shouldSuppressAnalytics()) return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  if (!document.getElementById(GA4_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = GA4_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`
    document.head.appendChild(script)
  }

  // Prerendering can serialize the script element into the HTML without
  // preserving the dataLayer or gtag configuration that created it. Configure
  // GA4 independently of script insertion so hydrated pages still send events.
  if (!window.__tssGa4Configured) {
    window.gtag('js', new Date())
    window.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false })
    window.__tssGa4Configured = true
  }
}

function sendGa4Event(name: string, params: Ga4Params = {}) {
  initGa4()
  if (!window.gtag || !GA4_MEASUREMENT_ID) return
  window.gtag('event', name, {
    ...params,
    send_to: GA4_MEASUREMENT_ID,
  })
}

function toGa4Items(items: AnalyticsCartItem[]) {
  return items.map((item, index) => {
    const addOnTotal = item.addOns?.reduce((sum, addOn) => sum + addOn.price, 0) || 0
    return {
      item_id: `${item.name}-${item.size || item.option || index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      item_name: item.name,
      item_category: item.shape || item.material || 'print-product',
      item_variant: [item.option, item.size, item.material].filter(Boolean).join(' | '),
      price: +(item.price + addOnTotal).toFixed(2),
      quantity: item.quantity,
      index,
    }
  })
}

export function trackPageView(path: string) {
  if (shouldSuppressAnalytics()) return
  captureMarketingAttribution()
  // Vercel Analytics auto-tracks page views via route changes.
  sendGa4Event('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })

  // Persist to Supabase so the in-app Admin > Analytics tab has data to read.
  const now = Date.now()
  logToSupabase('page_views', {
    path,
    referrer: document.referrer || null,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
  })

  // Navigation funnel: record the previous page + how long they spent on it.
  if (lastPath && lastPath !== path) {
    logToSupabase('nav_events', {
      from_path: lastPath,
      to_path: path,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      duration_ms: lastPathEnteredAt ? now - lastPathEnteredAt : null,
    })
  }
  lastPath = path
  lastPathEnteredAt = now
}

export function trackEvent(name: string, properties: AnalyticsProperties = {}) {
  if (shouldSuppressAnalytics()) return
  const clean = cleanProperties(properties)
  try {
    track(name, clean)
  } catch {
    // Analytics should never block a lead, checkout, or navigation action.
  }
  sendGa4Event(name, clean)
}

export function trackLeadSubmission({
  source,
  service,
  subscribed,
  tags,
}: {
  source?: string
  service?: string | null
  subscribed?: boolean
  tags?: string[]
}) {
  trackEvent('quote_submit', {
    source: source || 'unknown',
    service: service || 'unspecified',
    subscribed: !!subscribed,
    tags: tags?.join(',') || undefined,
  })
}

export function trackClick(path: string, element: string, x: number, y: number) {
  trackEvent('tracked_click', { path, element, x, y })
  logToSupabase('click_events', {
    path,
    element,
    x_percent: x,
    y_percent: y,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    attribution: getMarketingAttribution(),
    event_type: 'tracked_click',
  })
}

export function trackCheckoutStarted({
  items,
  value,
  subtotal,
  promoCode,
  promoDiscount,
}: {
  items: AnalyticsCartItem[]
  value: number
  subtotal: number
  promoCode?: string | null
  promoDiscount?: number
}) {
  const gaItems = toGa4Items(items)
  trackEvent('checkout_started', {
    value,
    subtotal,
    currency: 'USD',
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    promo_code: promoCode || undefined,
    promo_discount: promoDiscount || undefined,
  })
  sendGa4Event('begin_checkout', {
    currency: 'USD',
    value,
    coupon: promoCode || undefined,
    items: gaItems,
  })
}

export function trackAddToCart({
  item,
  value,
  category,
  source,
}: {
  item: AnalyticsCartItem
  value: number
  category?: string
  source?: string
}) {
  const [gaItem] = toGa4Items([item])
  trackEvent('add_to_cart_click', {
    source: source || 'product_order',
    product_name: item.name,
    product_size: item.size,
    product_option: item.option,
    category: category || item.shape || item.material || 'print-product',
    value,
    currency: 'USD',
  })
  sendGa4Event('add_to_cart', {
    currency: 'USD',
    value,
    items: [gaItem],
  })
}

export function trackPaymentCapture({
  provider,
  orderId,
  items,
  value,
  subtotal,
  promoCode,
  promoDiscount,
}: {
  provider: 'paypal' | 'square'
  orderId: string
  items: AnalyticsCartItem[]
  value: number
  subtotal: number
  promoCode?: string | null
  promoDiscount?: number
}) {
  const gaItems = toGa4Items(items)
  trackEvent(`${provider}_capture`, {
    payment_provider: provider,
    order_id: orderId,
    value,
    subtotal,
    currency: 'USD',
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    promo_code: promoCode || undefined,
    promo_discount: promoDiscount || undefined,
  })
  sendGa4Event('purchase', {
    transaction_id: orderId,
    currency: 'USD',
    value,
    coupon: promoCode || undefined,
    items: gaItems,
  })
}

export function setupClickTracking() {
  if (typeof window === 'undefined' || window.__tssClickTracking) return
  window.__tssClickTracking = true

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null
    const clickable = target?.closest('a[href], button')
    if (!clickable) return

    const label = clickable.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80)
      || clickable.getAttribute('aria-label')
      || clickable.tagName.toLowerCase()

    // Log every meaningful click to Supabase for the Admin > Analytics heatmap/top-clicks.
    logToSupabase('click_events', {
      path: window.location.pathname,
      element: label,
      x_percent: window.innerWidth ? +((event.clientX / window.innerWidth) * 100).toFixed(2) : null,
      y_percent: window.innerHeight ? +((event.clientY / window.innerHeight) * 100).toFixed(2) : null,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      attribution: getMarketingAttribution(),
      event_type: clickable instanceof HTMLAnchorElement && clickable.getAttribute('href')?.startsWith('tel:')
        ? 'phone_click'
        : 'click',
    })

    // Vercel/GA4 conversion events for the high-intent link types.
    if (!(clickable instanceof HTMLAnchorElement)) return
    const href = clickable.getAttribute('href') || ''
    const properties = {
      path: window.location.pathname,
      label,
      href,
    }

    if (href.startsWith('tel:')) {
      trackEvent('phone_click', properties)
    } else if (href.startsWith('sms:')) {
      trackEvent('sms_click', properties)
    } else if (href.startsWith('mailto:')) {
      trackEvent('email_click', properties)
    } else if (href.includes('/contact') || href.includes('/quote')) {
      trackEvent('quote_cta_click', properties)
    }
  })
}
