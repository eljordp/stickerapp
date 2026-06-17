import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { validatePromoCode, applyPromoCode, type PromoResult, AUTO_DISCOUNT_CODE, AUTO_APPLIED_KEY } from '@/lib/promoCodes'

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
  artwork?: {
    bucket: string
    path: string
    fileName: string
    contentType: string
    size: number
    uploadedAt: string
  }
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tss-cart')
    return saved ? JSON.parse(saved) : []
  })
  const [cartEmail] = useState<string | null>(() => localStorage.getItem('tss-cart-email'))
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLabel, setPromoLabel] = useState<string | null>(null)

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tss-cart', JSON.stringify(items))
  }, [items])

  // Sync cart session to Supabase — track every cart, email-optional.
  // Email is captured separately (modal or checkout) and added to the row if/when available.
  const syncSession = useCallback(async (currentItems: CartItem[], email: string | null) => {
    if (currentItems.length === 0) return

    const sessionId = localStorage.getItem('tss-cart-session-id')
    const totalPrice = currentItems.reduce((sum, i) => {
      const addOnTotal = i.addOns?.reduce((a, b) => a + b.price, 0) || 0
      return sum + (i.price + addOnTotal) * i.quantity
    }, 0)

    if (sessionId) {
      const { error } = await supabase.from('cart_sessions').update({
        email,
        items: currentItems,
        total_price: totalPrice,
        updated_at: new Date().toISOString(),
      }).eq('id', sessionId)
      if (error) console.error('[cart_sessions] update failed:', error)
    } else {
      const { data, error } = await supabase.from('cart_sessions').insert({
        email,
        items: currentItems,
        total_price: totalPrice,
      }).select('id').single()
      if (error) {
        console.error('[cart_sessions] insert failed:', error)
        return
      }
      if (data?.id) localStorage.setItem('tss-cart-session-id', data.id)
    }
  }, [])

  // Sync whenever items or email change — email no longer gates tracking
  useEffect(() => {
    if (items.length > 0) {
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
    doAddItem(item)
    return 'added'
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
    if (!sessionId) return
    const { error } = await supabase.from('cart_sessions').update({ converted: true }).eq('id', sessionId)
    if (error) console.error('[cart_sessions] mark converted failed:', error)
    localStorage.removeItem('tss-cart-session-id')
  }

  const total = items.reduce((sum, i) => {
    const addOnTotal = i.addOns?.reduce((a, b) => a + b.price, 0) || 0
    return sum + (i.price + addOnTotal) * i.quantity
  }, 0)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // Re-validate promo when cart changes
  useEffect(() => {
    if (!promoCode) return
    const timer = window.setTimeout(() => {
      const result = validatePromoCode(promoCode, total)
      if (result.valid && result.discount !== undefined) {
        setPromoDiscount(result.discount)
      } else {
        setPromoCode(null)
        setPromoDiscount(0)
        setPromoLabel(null)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [total, promoCode])

  // Auto-apply first-order discount for first-time buyers
  useEffect(() => {
    if (items.length === 0) return
    if (promoCode) return // user already has a code applied
    const timer = window.setTimeout(() => {
      const hasOrdered = localStorage.getItem('tss_order_completed') === 'true'
      if (hasOrdered) return
      const result = validatePromoCode(AUTO_DISCOUNT_CODE, total)
      if (result.valid && result.code && result.discount !== undefined) {
        setPromoCode(result.code.code)
        setPromoDiscount(result.discount)
        setPromoLabel(`${result.code.value}% off`)
        localStorage.setItem(AUTO_APPLIED_KEY, 'true')
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [items.length, total, promoCode])

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
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
