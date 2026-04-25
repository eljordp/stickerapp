// Analytics moved to Vercel Analytics — see <Analytics /> in App.tsx.
// These are kept as no-ops so legacy callers don't need to change.
// Vercel Analytics auto-tracks page views via route changes.

export function trackPageView(_path: string) {
  // no-op — Vercel Analytics handles this automatically
}

export function trackClick(_path: string, _element: string, _x: number, _y: number) {
  // no-op
}

export function setupClickTracking() {
  // no-op
}
