import { useState, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Check, Loader2 } from 'lucide-react'
import { submitContactRequest } from '@/lib/contactSubmit'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'

const DISMISSED_KEY = 'tss_exit_modal_dismissed'
const SUBMITTED_KEY = 'tss_exit_modal_submitted'

export default function ExitIntentModal() {
  const { items, lookupSavedCart, restoreCart } = useCart()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Skip if already seen, submitted, or completed an order
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    if (localStorage.getItem(SUBMITTED_KEY)) return
    if (localStorage.getItem('tss_order_completed') === 'true') return

    // Only trigger on desktop (mouseleave to top) — mobile doesn't have this gesture cleanly
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return

    // Wait until user has been on the site for 15s before arming the trigger
    let armed = false
    const arm = setTimeout(() => { armed = true }, 15000)

    const onMouseLeave = (e: MouseEvent) => {
      if (!armed) return
      if (e.clientY > 0) return // only fire when exiting toward the top
      setShow(true)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
    document.addEventListener('mouseleave', onMouseLeave)
    return () => {
      clearTimeout(arm)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  const close = () => {
    setShow(false)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    const message = "Exit-intent signup — interested in first-order discount. Please send the code + any Bay Area print intro info."
    try {
      await submitContactRequest({
        name: 'Exit signup',
        email,
        service: 'Email Signup',
        message,
        subject: 'New email signup from exit intent',
        source: 'exit-intent',
        subscribe: true,
        tags: ['exit-intent', 'first-order-discount'],
      })
      localStorage.setItem(SUBMITTED_KEY, '1')
      setStatus('sent')

      // If the visitor has no local cart, try to restore one from their email.
      // Quiet by design — toast confirms success, silent if nothing to restore.
      if (items.length === 0) {
        const saved = await lookupSavedCart(email)
        if (saved) {
          restoreCart(saved, email)
          toast.success(`We found your saved cart — ${saved.items.length} ${saved.items.length === 1 ? 'item' : 'items'}, ready when you are.`)
        }
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card border border-border rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {status === 'sent' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                  <Check size={28} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-black mb-3">Check your inbox.</h2>
                <p className="text-muted-foreground">
                  We sent your first-order details to <strong className="text-foreground">{email}</strong>. Your 10% off is waiting whenever you're ready to order.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Gift size={22} className="text-primary" />
                  </div>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest">First Order Perk</p>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
                  Before you go — <span className="text-gradient">10% off.</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Drop your email and we'll send your first-order discount + a quick note when we have a deal that fits your project.
                </p>
                <form onSubmit={onSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="input-base"
                    placeholder="you@company.com"
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending' || !email}
                    className="btn-primary w-full justify-center disabled:opacity-50"
                  >
                    {status === 'sending' ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending…</>
                    ) : (
                      <>Get my 10% off</>
                    )}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    No spam. One email, you decide what's next.
                  </p>
                  {status === 'error' && (
                    <p className="text-xs text-destructive text-center">
                      Couldn't send — try again or email thestickersmith@gmail.com.
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
