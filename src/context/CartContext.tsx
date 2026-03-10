import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { validatePromoCode, applyPromoCode, type PromoResult } from '@/lib/promoCodes'

interface CartItem {
  id: string
  name: string
  size: string
  option: string
  price: number
  quantity: number
  addOns?: { name: string; price: number }[]
  material?: string
  shape?: string
  dimensions?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => 'added' | 'pending'
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  markConverted: () => Promise<void>
  total: number
  totalItems: number
  cartEmail: string | null
  // Promo code
  promoCode: string | null
  promoDiscount: number
  promoLabel: string | null
  applyPromo: (code: string) => PromoResult
  removePromo: () => void
  finalizePromo: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Email Capture Modal
function EmailCaptureModal({
  isOpen,
  onSubmit,
  onClose,
}: {
  isOpen: boolean
  onSubmit: (email: string) => void
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid email'); return }
    onSubmit(trimmed)
    setEmail('')
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Before we add that...</h3>
                <p className="text-sm text-muted-foreground">Enter your email to save your cart</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${error ? 'border-destructive' : 'border-border'}`}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>
              <button type="submit" className="btn-primary w-full">
                Continue to Cart
              </button>
              <p className="text-xs text-muted-foreground text-center">
                We'll save your cart so you don't lose it
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tss-cart')
    return saved ? JSON.parse(saved) : []
  })
  const [cartEmail, setCartEmail] = useState<string | null>(() => localStorage.getItem('tss-cart-email'))
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null)
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLabel, setPromoLabel] = useState<string | null>(null)

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tss-cart', JSON.stringify(items))
  }, [items])

  // Sync cart session to Supabase
  const syncSession = useCallback(async (currentItems: CartItem[], email: string | null) => {
    if (!email || currentItems.length === 0) return

    const sessionId = localStorage.getItem('tss-cart-session-id')
    const totalPrice = currentItems.reduce((sum, i) => {
      const addOnTotal = i.addOns?.reduce((a, b) => a + b.price, 0) || 0
      return sum + (i.price + addOnTotal) * i.quantity
    }, 0)

    try {
      if (sessionId) {
        await supabase.from('cart_sessions').update({
          email,
          items: currentItems,
          total_price: totalPrice,
          updated_at: new Date().toISOString(),
        }).eq('id', sessionId)
      } else {
        const { data } = await supabase.from('cart_sessions').insert({
          email,
          items: currentItems,
          total_price: totalPrice,
        }).select('id').single()

        if (data?.id) {
          localStorage.setItem('tss-cart-session-id', data.id)
        }
      }
    } catch {
      // Silent fail — localStorage is the backup
    }
  }, [])

  // Sync whenever items or email change
  useEffect(() => {
    if (cartEmail && items.length > 0) {
      syncSession(items, cartEmail)
    }
  }, [items, cartEmail, syncSession])

  const doAddItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, item]
    })
  }

  const addItem = (item: CartItem): 'added' | 'pending' => {
    if (!cartEmail) {
      setPendingItem(item)
      setShowEmailModal(true)
      return 'pending'
    }
    doAddItem(item)
    return 'added'
  }

  const handleEmailSubmit = (email: string) => {
    setCartEmail(email)
    localStorage.setItem('tss-cart-email', email)
    setShowEmailModal(false)

    if (pendingItem) {
      doAddItem(pendingItem)
      setPendingItem(null)
    }
  }

  const handleEmailClose = () => {
    setShowEmailModal(false)
    setPendingItem(null)
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeItem(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => {
    setItems([])
    setPromoCode(null)
    setPromoDiscount(0)
    setPromoLabel(null)
  }

  const markConverted = async () => {
    const sessionId = localStorage.getItem('tss-cart-session-id')
    if (sessionId) {
      try {
        await supabase.from('cart_sessions').update({ converted: true }).eq('id', sessionId)
      } catch {
        // Silent fail
      }
      localStorage.removeItem('tss-cart-session-id')
    }
  }

  const total = items.reduce((sum, i) => {
    const addOnTotal = i.addOns?.reduce((a, b) => a + b.price, 0) || 0
    return sum + (i.price + addOnTotal) * i.quantity
  }, 0)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // Re-validate promo when cart changes
  useEffect(() => {
    if (promoCode) {
      const result = validatePromoCode(promoCode, total)
      if (result.valid && result.discount !== undefined) {
        setPromoDiscount(result.discount)
      } else {
        setPromoCode(null)
        setPromoDiscount(0)
        setPromoLabel(null)
      }
    }
  }, [total, promoCode])

  const applyPromo = (code: string): PromoResult => {
    const result = validatePromoCode(code, total)
    if (result.valid && result.code && result.discount !== undefined) {
      setPromoCode(result.code.code)
      setPromoDiscount(result.discount)
      setPromoLabel(
        result.code.type === 'percent'
          ? `${result.code.value}% off`
          : `$${result.code.value} off`
      )
    }
    return result
  }

  const removePromo = () => {
    setPromoCode(null)
    setPromoDiscount(0)
    setPromoLabel(null)
  }

  const finalizePromo = () => {
    if (promoCode) {
      applyPromoCode(promoCode)
    }
  }

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, markConverted,
      total, totalItems, cartEmail,
      promoCode, promoDiscount, promoLabel,
      applyPromo, removePromo, finalizePromo,
    }}>
      {children}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onSubmit={handleEmailSubmit}
        onClose={handleEmailClose}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
