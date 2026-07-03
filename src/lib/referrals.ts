import { trackEvent } from './analytics'
import { trackReferralClick } from './referralRewards'

const REF_KEY = 'tss-ref-code'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

async function getSupabaseClient() {
  return (await import('./supabase')).supabase
}

// Check URL for referral code on page load and store it
export function captureReferralCode() {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (ref) {
    localStorage.setItem(REF_KEY, ref)
    trackReferralClick(ref) // track the visit for the referrer
    const campaign = Object.fromEntries(
      UTM_KEYS
        .map((key) => [key, params.get(key)] as const)
        .filter(([, value]) => Boolean(value)),
    )
    trackEvent('referral_link_click', {
      referral_code: ref,
      ...campaign,
    })
    // Clean the URL without reload
    const url = new URL(window.location.href)
    url.searchParams.delete('ref')
    window.history.replaceState({}, '', url.toString())
  }
}

export function getStoredReferralCode(): string | null {
  return localStorage.getItem(REF_KEY)
}

// When a customer is created, link the referral
export async function linkReferral(referredCustomerId: string) {
  const code = getStoredReferralCode()
  if (!code) return

  try {
    const supabase = await getSupabaseClient()
    // Find the referrer by their code
    const { data: referrer } = await supabase
      .from('customers')
      .select('id')
      .eq('referral_code', code)
      .single()

    if (!referrer) return

    await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: referredCustomerId,
      referral_code: code,
      status: 'signed_up',
    })

    // Clear the stored code after linking
    localStorage.removeItem(REF_KEY)
  } catch {
    // Silent fail
  }
}

// Generate a shareable referral URL
export function getReferralUrl(code: string): string {
  const base = window.location.origin
  return `${base}?ref=${code}`
}
