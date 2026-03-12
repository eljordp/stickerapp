import { getPromoCodes, savePromoCodes, type PromoCode } from './promoCodes'

const REFERRERS_KEY = 'tss-referrers'
const REFERRAL_LOG_KEY = 'tss-referral-log'

// --- Reward config ---
const BUYER_DISCOUNT_PERCENT = 10 // Person using a referral code gets 10% off
const BASE_COMMISSION_RATE = 0.05 // Regular referrers earn 5% of the order
const PARTNER_COMMISSION_RATE = 0.10 // Official partners earn 10%
const REFERRER_REWARD_MIN_ORDER = 25

export type ReferrerTier = 'standard' | 'partner'

export interface Referrer {
  id: string
  name: string
  email: string
  phone: string
  code: string // unique personal referral code (works at checkout)
  tier: ReferrerTier // 'standard' = 5%, 'partner' = 10%
  clicks: number // how many times the link was visited
  conversions: number // how many purchases used this code
  totalEarned: number // total reward value earned (based on % of referred orders)
  rewardCodes: string[] // promo codes generated as rewards for them
  createdAt: string
}

export interface ReferralLog {
  id: string
  referrerCode: string
  referrerName: string
  buyerEmail: string
  buyerName: string
  orderId: string
  orderTotal: number
  rewardCodeGenerated: string
  date: string
}

// --- Referrer CRUD ---

export function getReferrers(): Referrer[] {
  return JSON.parse(localStorage.getItem(REFERRERS_KEY) || '[]')
}

export function saveReferrers(referrers: Referrer[]) {
  localStorage.setItem(REFERRERS_KEY, JSON.stringify(referrers))
}

export function getReferralLog(): ReferralLog[] {
  return JSON.parse(localStorage.getItem(REFERRAL_LOG_KEY) || '[]')
}

function saveReferralLog(logs: ReferralLog[]) {
  localStorage.setItem(REFERRAL_LOG_KEY, JSON.stringify(logs))
}

export function findReferrerByCode(code: string): Referrer | undefined {
  return getReferrers().find(r => r.code.toUpperCase() === code.toUpperCase())
}

export function findReferrerByEmail(email: string): Referrer | undefined {
  return getReferrers().find(r => r.email.toLowerCase() === email.toLowerCase())
}

// Generate a clean unique code: first 4 chars of name + 3 random
function generateCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4)
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${clean || 'REF'}${suffix}`
}

// Register a new referrer — returns existing if email already registered
export function registerReferrer(name: string, email: string, phone: string, tier: ReferrerTier = 'standard'): Referrer {
  const existing = findReferrerByEmail(email)
  if (existing) return existing

  const all = getReferrers()

  const referrer: Referrer = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    code: generateCode(name),
    tier,
    clicks: 0,
    conversions: 0,
    totalEarned: 0,
    rewardCodes: [],
    createdAt: new Date().toISOString(),
  }

  // Ensure code uniqueness (also check promo codes)
  const promoCodes = getPromoCodes()
  while (
    all.some(r => r.code === referrer.code) ||
    promoCodes.some(p => p.code === referrer.code)
  ) {
    referrer.code = generateCode(name)
  }

  // Also create a promo code entry so the referral code works at checkout
  const promoEntry: PromoCode = {
    code: referrer.code,
    type: 'percent',
    value: BUYER_DISCOUNT_PERCENT,
    label: `${referrer.name}'s Referral — ${BUYER_DISCOUNT_PERCENT}% Off`,
    category: 'friends_family',
    minOrder: 0,
    maxUses: 0, // unlimited
    uses: 0,
    active: true,
    createdAt: new Date().toISOString(),
  }
  promoCodes.push(promoEntry)
  savePromoCodes(promoCodes)

  all.push(referrer)
  saveReferrers(all)
  return referrer
}

// Track a click/visit from ?ref=CODE
export function trackReferralClick(code: string) {
  const all = getReferrers()
  const idx = all.findIndex(r => r.code.toUpperCase() === code.toUpperCase())
  if (idx >= 0) {
    all[idx].clicks++
    saveReferrers(all)
  }
}

// Called after a successful purchase that used a referral code
// Rewards the referrer with a unique promo code
export function processReferralConversion(
  referralCode: string,
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  orderTotal: number
): PromoCode | null {
  const all = getReferrers()
  const idx = all.findIndex(r => r.code.toUpperCase() === referralCode.toUpperCase())
  if (idx < 0) return null

  const referrer = all[idx]
  referrer.conversions++

  // Calculate commission based on tier
  const commissionRate = referrer.tier === 'partner' ? PARTNER_COMMISSION_RATE : BASE_COMMISSION_RATE
  const rewardValue = Math.round(orderTotal * commissionRate * 100) / 100 // e.g. $100 order × 5% = $5

  // Generate a unique reward code for the REFERRER
  const rewardCode = `THANKS${referrer.code}${referrer.conversions}`
  const reward: PromoCode = {
    code: rewardCode,
    type: 'fixed',
    value: rewardValue,
    label: `Referral Reward — $${rewardValue.toFixed(2)} from a $${orderTotal.toFixed(2)} order`,
    category: 'friends_family',
    minOrder: REFERRER_REWARD_MIN_ORDER,
    maxUses: 1,
    uses: 0,
    active: true,
    createdAt: new Date().toISOString(),
  }

  // Save reward promo code
  const codes = getPromoCodes()
  codes.push(reward)
  savePromoCodes(codes)

  // Update referrer
  referrer.totalEarned += rewardValue
  referrer.rewardCodes.push(rewardCode)
  all[idx] = referrer
  saveReferrers(all)

  // Log the conversion
  const logs = getReferralLog()
  logs.push({
    id: crypto.randomUUID(),
    referrerCode: referrer.code,
    referrerName: referrer.name,
    buyerEmail,
    buyerName,
    orderId,
    orderTotal,
    rewardCodeGenerated: rewardCode,
    date: new Date().toISOString(),
  })
  saveReferralLog(logs)

  return reward
}

// Check if a promo code is actually a referral code
export function isReferralCode(code: string): boolean {
  return !!findReferrerByCode(code)
}

// Get referral share URL
export function getReferralShareUrl(code: string): string {
  return `${window.location.origin}?ref=${code}`
}
