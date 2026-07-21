const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined
const scriptId = 'tss-ga4-script'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

// Bootstrap GA before React mounts. Route events still come from analytics.ts,
// but the queue and Google script are ready before the first page_view fires.
if (measurementId && typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
    document.head.appendChild(script)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
}

export {}
