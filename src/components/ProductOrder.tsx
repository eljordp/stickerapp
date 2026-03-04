import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Plus, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getPricing, type ProductCategory, type ProductTier } from '@/lib/pricing'

interface Props {
  categoryNames: string[]
}

/** Group items by their prefix before " – " */
function groupItems(items: ProductTier[]) {
  const groups: { label: string; items: { item: ProductTier; globalIndex: number }[] }[] = []
  const map = new Map<string, { item: ProductTier; globalIndex: number }[]>()
  items.forEach((item, i) => {
    const dashIdx = item.size.indexOf(' – ')
    const prefix = dashIdx > -1 ? item.size.substring(0, dashIdx) : item.size
    if (!map.has(prefix)) {
      const arr: { item: ProductTier; globalIndex: number }[] = []
      map.set(prefix, arr)
      groups.push({ label: prefix, items: arr })
    }
    map.get(prefix)!.push({ item, globalIndex: i })
  })
  return groups
}

/** Detect if a category supports custom quantity (bulk items with high qty tiers) */
function isBulkCategory(cat: ProductCategory): boolean {
  return cat.items.some(item => item.quantities.some(q => q.qty >= 50))
}

/** Find the best tier for a given qty (highest tier whose qty <= input) */
function findTier(quantities: { qty: number; price: number }[], qty: number) {
  const sorted = [...quantities].sort((a, b) => a.qty - b.qty)
  let tier = sorted[0]
  for (const t of sorted) {
    if (qty >= t.qty) tier = t
  }
  return tier
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
  const [customQty, setCustomQty] = useState(250)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState(false)

  const category = categories[activeCategory]
  if (!category) return null

  const item = category.items[selectedItem]
  if (!item) return null

  const bulk = isBulkCategory(category)
  const groups = useMemo(() => groupItems(category.items), [category])
  const hasGroups = groups.length > 1 || groups[0]?.label !== groups[0]?.items[0]?.item.size

  // Quantity & pricing
  const qtyOption = bulk
    ? findTier(item.quantities, customQty)
    : (item.quantities[selectedQtyIndex] || item.quantities[0])
  const effectiveQty = bulk ? customQty : qtyOption.qty
  const unitPrice = qtyOption.price
  const addOnTotal = category.addOns
    .filter(a => selectedAddOns.has(a.name))
    .reduce((sum, a) => sum + a.value, 0)

  // For bulk (per-unit pricing): total = (unitPrice + addOns) * qty
  // For fixed (per-project pricing): total = price + addOns
  const isPerUnit = bulk || item.quantities.length > 1
  const totalPrice = isPerUnit
    ? +((unitPrice + addOnTotal) * effectiveQty).toFixed(2)
    : +(unitPrice + addOnTotal).toFixed(2)

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
      option: effectiveQty > 1 ? `${effectiveQty} pcs` : '1',
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
    setCustomQty(250)
    setSelectedAddOns(new Set())
  }

  const displayName = (size: string) => {
    const dashIdx = size.indexOf(' – ')
    return dashIdx > -1 ? size.substring(dashIdx + 3) : size
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-5xl mx-auto"
    >
      <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">Shop Products</h2>

      {/* Category tabs */}
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
          {/* Products - grouped by sub-category */}
          <div>
            <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Select Product</label>
            {hasGroups ? (
              <div className="space-y-4">
                {groups.map(group => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 pl-1">{group.label}</p>
                    <div className="grid gap-2">
                      {group.items.map(({ item: p, globalIndex }) => (
                        <button
                          key={p.size}
                          onClick={() => { setSelectedItem(globalIndex); setSelectedQtyIndex(0) }}
                          className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                            selectedItem === globalIndex
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <span>{displayName(p.size)}</span>
                          <span className="float-right text-muted-foreground">
                            from ${Math.min(...p.quantities.map(q => q.price)).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                      {item.quantities.length === 1 && item.quantities[0].qty === 1
                        ? `$${p.quantities[0].price.toFixed(2)}`
                        : `from $${Math.min(...p.quantities.map(q => q.price)).toFixed(2)}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity - smart calculator for bulk, buttons for per-unit */}
          <div>
            <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Quantity</label>
            {bulk ? (
              <div>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
                  value={customQty}
                  onChange={e => setCustomQty(Number(e.target.value) || 0)}
                  placeholder="Enter quantity"
                />
                {/* Show tier breakdown */}
                <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-xs space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Price Tiers</p>
                  {item.quantities.map((q, i) => {
                    const nextQty = item.quantities[i + 1]?.qty
                    const label = nextQty ? `${q.qty}–${nextQty - 1}` : `${q.qty}+`
                    const isActive = qtyOption.qty === q.qty
                    return (
                      <div key={q.qty} className={`flex justify-between ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        <span>{label} pcs</span>
                        <span>${q.price.toFixed(2)}/ea</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : item.quantities.length === 1 && item.quantities[0].qty === 1 ? (
              <div className="px-4 py-3 rounded-xl text-sm font-medium border border-primary bg-primary/10 text-primary text-center">
                Per project pricing
              </div>
            ) : (
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
                    <div className="text-xs mt-0.5 text-muted-foreground">${q.price.toFixed(2)}/ea</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add-Ons */}
          {category.addOns.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-primary" />
                <label className="text-sm font-bold uppercase tracking-wider">Premium Add-Ons</label>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Enhance your order with premium upgrades.</p>
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
                      <div className="text-xs text-muted-foreground">+${addon.value.toFixed(2)}{isPerUnit ? '/ea' : ''}</div>
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
              {effectiveQty > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{effectiveQty.toLocaleString()} pcs</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isPerUnit ? 'Unit Price' : 'Price'}</span>
                <span>${unitPrice.toFixed(2)}{isPerUnit ? '/ea' : ''}</span>
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
                        <span>+${a.value.toFixed(2)}{isPerUnit ? '/ea' : ''}</span>
                      </div>
                    ))}
                </>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                <span>Est. Total</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={bulk && customQty <= 0}
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
