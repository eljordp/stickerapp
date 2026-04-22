import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Mail, Check, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { sendContactEmail } from '@/lib/email'

const MIN_ORDER = 35

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const belowMin = total > 0 && total < MIN_ORDER
  const shortfall = +(MIN_ORDER - total).toFixed(2)

  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteEmail, setQuoteEmail] = useState('')
  const [quoteName, setQuoteName] = useState('')
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const buildQuoteMessage = () => {
    const lines = items.map((i) => {
      const lineTotal = (i.price * i.quantity).toFixed(2)
      return `• ${i.name} — ${i.option} · ${i.size} — $${lineTotal}`
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
      await supabase.from('contact_submissions').insert({
        name: quoteName,
        email: quoteEmail,
        service: 'Cart Quote Hold',
        message,
      })
      sendContactEmail({
        name: quoteName,
        email: quoteEmail,
        service: 'Cart Quote Hold',
        message,
      })
      setQuoteStatus('sent')
    } catch {
      setQuoteStatus('error')
    }
  }

  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-black mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Start by ordering some custom stickers!</p>
          <Link to="/stickers" className="btn-primary">Make Custom Stickers</Link>
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
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"><Minus size={14} /></button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"><Plus size={14} /></button>
                </div>
                <span className="font-bold text-primary w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={18} /></button>
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
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-2xl font-black">Total: <span className="text-primary">${total.toFixed(2)}</span></div>
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
            onClick={() => setQuoteOpen(!quoteOpen)}
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
                <div className="px-6 pb-6 border-t border-border/50 pt-4">
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
                          className="input-base"
                          placeholder="Your name"
                        />
                        <input
                          type="email"
                          value={quoteEmail}
                          onChange={(e) => setQuoteEmail(e.target.value)}
                          required
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
