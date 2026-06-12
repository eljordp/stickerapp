import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean | null | undefined
type AnalyticsProperties = Record<string, AnalyticsValue>
type Ga4Params = Record<string, unknown>

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined
const GA4_SCRIPT_ID = 'tss-ga4-script'

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
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function cleanProperties(properties: AnalyticsProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null),
  )
}

function initGa4() {
  if (typeof window === 'undefined' || !GA4_MEASUREMENT_ID) return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() {
    window.dataLayer?.push(arguments)
  }

  if (!document.getElementById(GA4_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = GA4_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`
    document.head.appendChild(script)

    window.gtag('js', new Date())
    window.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false })
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
  // Vercel Analytics auto-tracks page views via route changes.
  sendGa4Event('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function trackEvent(name: string, properties: AnalyticsProperties = {}) {
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

export function trackPayPalCapture({
  orderId,
  items,
  value,
  subtotal,
  promoCode,
  promoDiscount,
}: {
  orderId: string
  items: AnalyticsCartItem[]
  value: number
  subtotal: number
  promoCode?: string | null
  promoDiscount?: number
}) {
  const gaItems = toGa4Items(items)
  trackEvent('paypal_capture', {
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
    const link = target?.closest('a[href]')
    if (!(link instanceof HTMLAnchorElement)) return

    const href = link.getAttribute('href') || ''
    const label = link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) || href
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
