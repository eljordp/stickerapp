import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getPricing, type ProductCategory } from '@/lib/pricing'

interface Props {
  categoryNames: string[]
}

export default function ProductOrder({ categoryNames }: Props) {
  const { addItem } = useCart()
  const pricing = useMemo(() => getPricing(), [])

  const categories = categoryNames
    .map(name => pricing.products.find(p => p.name === name))
    .filter((c): c is ProductCategory => !!c)

  const [activeCategory, setActiveCategory] = useState(0)
  const [selectedItem, setSelectedItem] = useState(0)
  const [selectedQtyIndex, setSelectedQtyIndex] = useState(0)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState(false)

  const category = categories[activeCategory]
  if (!category) return null

  const item = category.items[selectedItem]
  if (!item) return null

  const qtyOption = item.quantities[selectedQtyIndex] || item.quantities[0]
  const addOnTotal = category.addOns
    .filter(a => selectedAddOns.has(a.name))
    .reduce((sum, a) => sum + a.value, 0)
  const totalPrice = +(qtyOption.price + addOnTotal).toFixed(2)

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleAddToCart = () => {
    const addOns = category.addOns
      .filter(a => selectedAddOns.has(a.name))
      .map(a => ({ name: a.name, price: a.value }))

    addItem({
      id: `${category.name}-${item.size}-${Date.now()}`,
      name: `${item.size}`,
      size: item.size,
      option: `${qtyOption.qty}${qtyOption.qty > 1 ? ' pcs' : ''}`,
      price: totalPrice,
      quantity: 1,
      addOns: addOns.length > 0 ? addOns : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const resetSelections = (catIdx: number) => {
    setActiveCategory(catIdx)
    setSelectedItem(0)
    setSelectedQtyIndex(0)
    setSelectedAddOns(new Set())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-5xl mx-auto"
    >
      <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">Shop Products</h2>

      {/* Category tabs if multiple */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => resetSelections(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === i
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Product selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Select Product</label>
            <div className="grid gap-2">
              {category.items.map((p, i) => (
                <button
                  key={p.size}
                  onClick={() => { setSelectedItem(i); setSelectedQtyIndex(0) }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                    selectedItem === i
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span>{p.size}</span>
                  <span className="float-right text-muted-foreground">
                    from ${Math.min(...p.quantities.map(q => q.price)).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Quantity</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {item.quantities.map((q, i) => (
                <button
                  key={q.qty}
                  onClick={() => setSelectedQtyIndex(i)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    selectedQtyIndex === i
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="font-bold">{q.qty}{q.qty > 1 ? ' pcs' : ''}</div>
                  <div className="text-xs mt-0.5 text-muted-foreground">${q.price.toFixed(2)}{q.qty > 1 ? '/ea' : ''}</div>
                </button>
              ))}
            </div>
          </div>

          {category.addOns.length > 0 && (
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Add-Ons</label>
              <div className="grid grid-cols-2 gap-2">
                {category.addOns.map(addon => (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddOn(addon.name)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left flex items-center gap-2 ${
                      selectedAddOns.has(addon.name)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {selectedAddOns.has(addon.name) ? <Check size={14} /> : <Plus size={14} className="text-muted-foreground" />}
                    <div>
                      <div>{addon.name}</div>
                      <div className="text-xs text-muted-foreground">+${addon.value.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="text-right max-w-[60%]">{item.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>{qtyOption.qty}{qtyOption.qty > 1 ? ' pcs' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price</span>
                <span>${qtyOption.price.toFixed(2)}{qtyOption.qty > 1 ? '/ea' : ''}</span>
              </div>
              {selectedAddOns.size > 0 && (
                <>
                  <div className="border-t border-border pt-2 mt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add-Ons</span>
                  </div>
                  {category.addOns
                    .filter(a => selectedAddOns.has(a.name))
                    .map(a => (
                      <div key={a.name} className="flex justify-between">
                        <span className="text-muted-foreground">{a.name}</span>
                        <span>+${a.value.toFixed(2)}</span>
                      </div>
                    ))}
                </>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toFixed(2)}{qtyOption.qty > 1 ? '/ea' : ''}</span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className={`btn-primary w-full ${added ? 'bg-green-600' : ''}`}
            >
              {added ? (
                <>Added to Cart! <Check size={18} /></>
              ) : (
                <>Add to Cart <ShoppingCart size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
