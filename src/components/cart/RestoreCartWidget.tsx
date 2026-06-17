import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Loader2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart, type SavedCartLookup } from '@/context/CartContext'
import { toast } from 'sonner'

type Status = 'idle' | 'searching' | 'found' | 'empty' | 'error'

function formatSavedAt(d: Date): string {
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function RestoreCartWidget() {
  const { lookupSavedCart, restoreCart } = useCart()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [saved, setSaved] = useState<SavedCartLookup | null>(null)

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('searching')
    const result = await lookupSavedCart(trimmed)
    if (!result) {
      setStatus('empty')
      return
    }
    setSaved(result)
    setStatus('found')
  }

  const handleRestore = () => {
    if (!saved) return
    restoreCart(saved, email.trim())
    toast.success(`Restored ${saved.items.length} ${saved.items.length === 1 ? 'item' : 'items'} from ${formatSavedAt(saved.savedAt)}.`)
  }

  const handleReset = () => {
    setStatus('idle')
    setSaved(null)
  }

  return (
    <div className="mt-10 pt-8 border-t border-border/40 text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <ShoppingBag size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Have a saved cart?</h3>
          <p className="text-xs text-muted-foreground">If you ordered or browsed before, enter your email to pick up where you left off.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'found' && saved ? (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
          >
            <div className="text-sm">
              <span className="font-semibold">{saved.items.length} {saved.items.length === 1 ? 'item' : 'items'}</span>
              <span className="text-muted-foreground"> · ${saved.totalPrice.toFixed(2)} · saved {formatSavedAt(saved.savedAt)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={handleRestore} className="btn-primary text-sm py-2.5 flex-1 justify-center">
                Restore my cart <ArrowRight size={14} />
              </button>
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                Not mine
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onSubmit={handleLookup}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === 'empty' || status === 'error') setStatus('idle') }}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  disabled={status === 'searching'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'searching' || !email}
                className="btn-secondary text-sm px-4 py-2.5 disabled:opacity-50"
              >
                {status === 'searching' ? <Loader2 size={14} className="animate-spin" /> : 'Find it'}
              </button>
            </div>
            {status === 'empty' && (
              <p className="text-xs text-muted-foreground">No saved cart found for that email.</p>
            )}
            {status === 'error' && (
              <p className="text-xs text-destructive">Couldn't check — try again in a moment.</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
