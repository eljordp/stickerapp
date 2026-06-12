import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean | null | undefined
type AnalyticsProperties = Record<string, AnalyticsValue>

declare global {
  interface Window {
    __tssClickTracking?: boolean
  }
}

export function trackPageView(_path: string) {
  void _path
  // Vercel Analytics auto-tracks page views via route changes.
}

export function trackEvent(name: string, properties: AnalyticsProperties = {}) {
  try {
    track(name, properties)
  } catch {
    // Analytics should never block a lead, checkout, or navigation action.
  }
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
  trackEvent('Lead Submitted', {
    source: source || 'unknown',
    service: service || 'unspecified',
    subscribed: !!subscribed,
    tags: tags?.join(',') || undefined,
  })
}

export function trackClick(path: string, element: string, x: number, y: number) {
  trackEvent('Tracked Click', { path, element, x, y })
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
      trackEvent('Phone Click', properties)
    } else if (href.startsWith('sms:')) {
      trackEvent('SMS Click', properties)
    } else if (href.startsWith('mailto:')) {
      trackEvent('Email Click', properties)
    } else if (href.includes('/contact') || href.includes('/quote')) {
      trackEvent('Quote CTA Click', properties)
    }
  })
}
