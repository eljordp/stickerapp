import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, AlertCircle, Mail, Check, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { submitContactRequest } from '@/lib/contactSubmit'
import RestoreCartWidget from '@/components/cart/RestoreCartWidget'
import emptyCartImage from '@/assets/pages/cart-empty-stickers.jpg'

const MIN_ORDER = 35

export default function Cart() {
  const { items, removeItem, updateQuantity, total, promoCode, promoDiscount, promoLabel } = useCart()
  type CartLineItem = (typeof items)[number]

  const getItemAddOnTotal = (item: CartLineItem) =>
    item.addOns?.reduce((sum, addOn) => sum + addOn.price, 0) ?? 0
  const getItemLineTotal = (item: CartLineItem) =>
    +((item.price + getItemAddOnTotal(item)) * item.quantity).toFixed(2)

  const belowMin = total > 0 && total < MIN_ORDER
  const shortfall = +(MIN_ORDER - total).toFixed(2)
  const isAutoApplied = promoCode === 'AUTO10'
  const discountedTotal = +(total - promoDiscount).toFixed(2)

  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteEmail, setQuoteEmail] = useState('')
  const [quoteName, setQuoteName] = useState('')
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const buildQuoteMessage = () => {
    const lines = items.map((i) => {
      const lineTotal = getItemLineTotal(i).toFixed(2)
      const addOnText = i.addOns?.length
        ? ` · ${i.addOns.map(addOn => `${addOn.name} (+$${addOn.price.toFixed(2)})`).join(' · ')}`
        : ''
      return `• ${i.name} — ${i.option} · ${i.size}${addOnText} — $${lineTotal}`
    })
    lines.push('')
    lines.push(`Cart total: $${total.toFixed(2)}`)
    return lines.join('\n')
  }

  const handleQuote = async (e: FormEvent) => {
    e.preventDefault()
    if (!quoteEmail || !quoteName) return
    setQuoteStatus('sending')
    const message = `Hold this quote for me, please.\n\n${buildQuoteMessage()}`
    try {
      await submitContactRequest({
        name: quoteName,
        email: quoteEmail,
        service: 'Cart Quote Hold',
        message,
        subject: `Cart quote hold from ${quoteName}`,
        source: 'cart-quote-hold',
        tags: ['cart-quote'],
      })
      setQuoteStatus('sent')
    } catch {
      setQuoteStatus('error')
    }
  }

  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-square max-w-sm mx-auto"
          >
            <img src={emptyCartImage} alt="Custom stickers" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Nothing in here yet.</h1>
          <p className="text-muted-foreground mb-8">Start with stickers — or pick a service and we'll take it from a brief.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/stickers" className="btn-primary">Make Custom Stickers</Link>
            <Link to="/services" className="btn-secondary">Browse Services <ArrowRight size={16} /></Link>
          </div>
          <RestoreCartWidget />
        </div>
      </section>
    )
  }
  return (
    <section className="py-8 md:py-16">
      <div className="section-container max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black mb-8">Your Cart</motion.h1>
        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.option} · {item.size}</p>
                {item.addOns?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.addOns.map(addOn => (
                      <span key={addOn.name} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {addOn.name} +${addOn.price.toFixed(2)}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.artwork && (
                  <p className="mt-2 text-xs font-medium text-green-400">
                    Artwork attached: {item.artwork.fileName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Decrease quantity for ${item.name}`}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label={`Increase quantity for ${item.name}`}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold text-primary w-20 text-right">${getItemLineTotal(item).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {belowMin && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-yellow-400">
                ${MIN_ORDER} minimum order
              </p>
              <p className="text-muted-foreground">
                Add ${shortfall.toFixed(2)} more to check out. Bumping quantities or adding a sample pack is an easy way there.
              </p>
            </div>
          </div>
        )}
        {/* Auto-applied first-order discount */}
        {isAutoApplied && !belowMin && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="mb-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-primary">First-order discount applied · {promoLabel}</p>
              <p className="text-xs text-muted-foreground">
                Saved ${promoDiscount.toFixed(2)} automatically — no code needed.
              </p>
            </div>
            <p className="font-black text-primary tabular-nums shrink-0">−${promoDiscount.toFixed(2)}</p>
          </motion.div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            {promoDiscount > 0 ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black">Total:</span>
                  <span className="text-2xl font-black text-primary">${discountedTotal.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground line-through">${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-primary mt-1">You saved ${promoDiscount.toFixed(2)}</p>
              </div>
            ) : (
              <div className="text-2xl font-black">Total: <span className="text-primary">${total.toFixed(2)}</span></div>
            )}
          </div>
          {belowMin ? (
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-muted/50 text-muted-foreground font-bold text-sm cursor-not-allowed"
            >
              Minimum ${MIN_ORDER} to checkout
            </button>
          ) : (
            <Link to="/checkout" className="btn-primary">Proceed to Checkout</Link>
          )}
        </div>

        {/* Save-as-quote — email this cart for later */}
        <div className="bg-card/50 border border-border/70 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setQuoteOpen(!quoteOpen)}
            aria-expanded={quoteOpen}
            aria-controls="cart-quote-panel"
            className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mail size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Email this quote to me</p>
                <p className="text-xs text-muted-foreground">Hold the price, decide later — we'll follow up within 24 hrs.</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{quoteOpen ? '−' : '+'}</span>
          </button>
          <AnimatePresence>
            {quoteOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div id="cart-quote-panel" className="px-6 pb-6 border-t border-border/50 pt-4">
                  {quoteStatus === 'sent' ? (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                        <Check size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-green-400">Quote sent to {quoteEmail}</p>
                        <p className="text-xs text-muted-foreground">Check your inbox — we saved your cart and will follow up.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleQuote} className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          value={quoteName}
                          onChange={(e) => setQuoteName(e.target.value)}
                          required
                          aria-label="Quote contact name"
                          className="input-base"
                          placeholder="Your name"
                        />
                        <input
                          type="email"
                          value={quoteEmail}
                          onChange={(e) => setQuoteEmail(e.target.value)}
                          required
                          aria-label="Quote contact email"
                          className="input-base"
                          placeholder="you@email.com"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={quoteStatus === 'sending' || !quoteName || !quoteEmail}
                        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quoteStatus === 'sending' ? (
                          <><Loader2 size={14} className="animate-spin" /> Sending…</>
                        ) : (
                          <><Mail size={14} /> Send my quote</>
                        )}
                      </button>
                      {quoteStatus === 'error' && (
                        <p className="text-xs text-destructive text-center">
                          Couldn't send — try again or email thestickersmith@gmail.com.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
