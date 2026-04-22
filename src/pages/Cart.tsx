import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const MIN_ORDER = 35

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const belowMin = total > 0 && total < MIN_ORDER
  const shortfall = +(MIN_ORDER - total).toFixed(2)
  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-black mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Start by ordering some custom stickers!</p>
          <Link to="/order" className="btn-primary">Make Custom Stickers</Link>
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
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>
    </section>
  )
}
