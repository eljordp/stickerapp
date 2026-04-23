import { useState, useEffect } from 'react'
import { X, Tag, Copy, Check } from 'lucide-react'
import { getPromoCodes } from '@/lib/promoCodes'
import { isReferralCode } from '@/lib/referralRewards'

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('tss-promo-dismissed') === 'true')
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (dismissed) return

    let timerDone = false
    let scrollDone = false

    const tryShow = () => {
      if (timerDone && scrollDone) setVisible(true)
    }

    const timer = setTimeout(() => {
      timerDone = true
      tryShow()
    }, 10000)

    const onScroll = () => {
      if (window.scrollY > 100) {
        scrollDone = true
        tryShow()
        window.removeEventListener('scroll', onScroll)
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [dismissed])

  if (dismissed || !visible) return null

  // Only show general promos — no personal referral codes or reward codes
  const codes = getPromoCodes().filter(c =>
    c.active &&
    (!c.expiresAt || new Date(c.expiresAt) > new Date()) &&
    !isReferralCode(c.code) &&
    !c.code.startsWith('THANKS')
  )
  // Prioritize: first_time > event > custom
  const priority = ['first_time', 'event', 'friends_family', 'custom'] as const
  const featured = priority.reduce<typeof codes[0] | null>((best, cat) => {
    if (best) return best
    return codes.find(c => c.category === cat) || null
  }, null)

  if (!featured) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(featured.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('tss-promo-dismissed', 'true')
  }

  const discountText = featured.type === 'percent'
    ? `${featured.value}% OFF`
    : `$${featured.value} OFF`

  return (
    <div className="bg-primary text-primary-foreground relative z-[60]">
      <div className="section-container flex items-center justify-center gap-3 py-2 text-sm">
        <Tag size={14} className="shrink-0" />
        <span className="font-bold">{discountText}</span>
        <span className="hidden sm:inline">—</span>
        <span className="hidden sm:inline">{featured.label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1 font-black tracking-widest text-xs"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'COPIED!' : featured.code}
        </button>
        {featured.minOrder ? (
          <span className="hidden md:inline text-xs opacity-80">min ${featured.minOrder} order</span>
        ) : null}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
