import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Package, DollarSign, Users, ChevronDown, ChevronUp, Truck, Clock, CheckCircle, Settings, RotateCcw, Save } from 'lucide-react'
import { getPricing, savePricing, defaultPricing, type PricingConfig } from '@/lib/pricing'

const ADMIN_EMAIL = 'thestickersmith@gmail.com'
const ADMIN_PASSWORD = 'Lolasdad22!'

interface OrderItem {
  id: string
  name: string
  size: string
  option: string
  price: number
  quantity: number
  addOns?: { name: string; price: number }[]
  material?: string
  shape?: string
}

interface Order {
  id: string
  date: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
  }
  items: OrderItem[]
  total: string
  status: 'completed' | 'shipped' | 'processing'
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('tss-admin', 'true')
      onLogin()
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <h1 className="text-2xl font-black mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="admin@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" className="btn-primary w-full">Log In</button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

const statusConfig = {
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-400 bg-blue-400/10' },
  processing: { label: 'Processing', icon: Clock, color: 'text-yellow-400 bg-yellow-400/10' },
}

const categoryTabs = [
  { id: 'stickers', label: 'Stickers' },
  { id: 'mylar', label: 'Mylar', productIndex: 0 },
  { id: 'canopies', label: 'Canopies', productIndex: 1 },
  { id: 'backdrops', label: 'Backdrops', productIndex: 2 },
  { id: 'tablecovers', label: 'Table Covers', productIndex: 3 },
  { id: 'banners', label: 'Banners', productIndex: 4 },
  { id: 'businessprint', label: 'Biz Print', productIndex: 5 },
  { id: 'storefront', label: 'Storefront', productIndex: 6 },
  { id: 'aframes', label: 'A-Frames', productIndex: 7 },
  { id: 'wallgraphics', label: 'Wall Graphics', productIndex: 8 },
  { id: 'decals', label: 'Decals', productIndex: 9 },
  { id: 'fullwraps', label: 'Full Wraps', productIndex: 10 },
  { id: 'partialwraps', label: 'Partial Wraps', productIndex: 11 },
  { id: 'frosted', label: 'Frosted Film', productIndex: 12 },
  { id: 'solar', label: 'Solar Film', productIndex: 13 },
  { id: 'security', label: 'Security Film', productIndex: 14 },
  { id: 'addons', label: 'Add-Ons' },
]

function PriceInput({ value, onChange, label }: { value: number; onChange: (v: string) => void; label: string }) {
  return (
    <div className="bg-muted/30 rounded-xl p-3">
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
        <input
          type="number" step="0.01" min="0" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>
    </div>
  )
}

function SubTabs({ active, tabs, onChange }: { active: string; tabs: { id: string; label: string }[]; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function PricingEditor() {
  const [config, setConfig] = useState<PricingConfig>(() => getPricing())
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('stickers')
  const [subTab, setSubTab] = useState<Record<string, string>>({})

  const getSubTab = (id: string) => subTab[id] || 'pricing'
  const setSubTabFor = (id: string, val: string) => setSubTab(prev => ({ ...prev, [id]: val }))

  const updateTierPrice = (index: number, value: string) => {
    setConfig({ ...config, basePrices: config.basePrices.map((t, i) => i === index ? { ...t, price: parseFloat(value) || 0 } : t) })
  }

  const updateMultiplier = (index: number, value: string) => {
    setConfig({ ...config, materialMultipliers: config.materialMultipliers.map((m, i) => i === index ? { ...m, multiplier: parseFloat(value) || 1 } : m) })
  }

  const updateStickerAddOn = (index: number, value: string) => {
    setConfig({ ...config, stickerAddOns: config.stickerAddOns.map((a, i) => i === index ? { ...a, value: parseFloat(value) || 0 } : a) })
  }

  const updateProductPrice = (catIndex: number, itemIndex: number, qtyIndex: number, value: string) => {
    const products = config.products.map((cat, ci) => {
      if (ci !== catIndex) return cat
      return { ...cat, items: cat.items.map((item, ii) => {
        if (ii !== itemIndex) return item
        return { ...item, quantities: item.quantities.map((q, qi) => qi === qtyIndex ? { ...q, price: parseFloat(value) || 0 } : q) }
      }) }
    })
    setConfig({ ...config, products })
  }

  const updateProductAddOn = (catIndex: number, addonIndex: number, value: string) => {
    const products = config.products.map((cat, ci) => {
      if (ci !== catIndex) return cat
      return { ...cat, addOns: cat.addOns.map((a, i) => i === addonIndex ? { ...a, value: parseFloat(value) || 0 } : a) }
    })
    setConfig({ ...config, products })
  }

  const handleSave = () => {
    savePricing(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setConfig(defaultPricing)
    savePricing(defaultPricing)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tierLabels = ['1–50', '51–100', '101–200', '201–500', '501+']
  const activeProduct = categoryTabs.find(t => t.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-primary" />
          <h2 className="text-xl font-bold">Pricing Manager</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30">
            <RotateCcw size={14} /> Reset All
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-lg transition-all ${saved ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:brightness-110'}`}>
            <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {categoryTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stickers Tab */}
      {activeTab === 'stickers' && (
        <div className="space-y-5">
          <SubTabs
            active={getSubTab('stickers')}
            tabs={[{ id: 'pricing', label: 'Quantity Pricing' }, { id: 'materials', label: 'Materials' }]}
            onChange={v => setSubTabFor('stickers', v)}
          />

          {getSubTab('stickers') === 'pricing' && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-1">Base Price Per Sticker</h3>
              <p className="text-sm text-muted-foreground mb-4">Price per unit at each quantity tier</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {config.basePrices.map((tier, i) => (
                  <PriceInput key={i} label={`${tierLabels[i]} pcs`} value={tier.price} onChange={v => updateTierPrice(i, v)} />
                ))}
              </div>
            </div>
          )}

          {getSubTab('stickers') === 'materials' && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-1">Material Multipliers</h3>
              <p className="text-sm text-muted-foreground mb-4">Price multiplier per material type (1.0x = base price)</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {config.materialMultipliers.map((mat, i) => (
                  <div key={mat.name} className="bg-muted/30 rounded-xl p-3">
                    <label className="block text-xs font-medium text-foreground mb-1.5">{mat.name}</label>
                    <div className="relative">
                      <input
                        type="number" step="0.05" min="0.1" value={mat.multiplier}
                        onChange={e => updateMultiplier(i, e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Category Tabs */}
      {activeProduct && activeProduct.productIndex !== undefined && config.products[activeProduct.productIndex] && (() => {
        const catIndex = activeProduct.productIndex!
        const cat = config.products[catIndex]
        const hasAddOns = cat.addOns.length > 0
        const currentSub = getSubTab(activeTab)
        return (
          <div className="space-y-5">
            {hasAddOns && (
              <SubTabs
                active={currentSub}
                tabs={[{ id: 'pricing', label: 'Quantity Pricing' }, { id: 'addons', label: 'Add-Ons' }]}
                onChange={v => setSubTabFor(activeTab, v)}
              />
            )}

            {currentSub !== 'addons' && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-1">Sizes & Pricing</h3>
                <p className="text-sm text-muted-foreground mb-4">{cat.items.length} products — set price per quantity tier</p>
                <div className="space-y-3">
                  {cat.items.map((item, itemIndex) => (
                    <div key={item.size} className="bg-muted/30 rounded-xl p-4">
                      <p className="text-sm font-bold mb-3">{item.size}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {item.quantities.map((q, qtyIndex) => (
                          <div key={q.qty}>
                            <label className="block text-[11px] text-muted-foreground mb-1">{q.qty === 1 ? 'Per unit' : `${q.qty}+ pcs`}</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                              <input
                                type="number" step="0.01" min="0" value={q.price}
                                onChange={e => updateProductPrice(catIndex, itemIndex, qtyIndex, e.target.value)}
                                className="w-full pl-6 pr-2 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSub === 'addons' && hasAddOns && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-1">{cat.name} Add-Ons</h3>
                <p className="text-sm text-muted-foreground mb-4">Base price per add-on</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.addOns.map((addon, i) => (
                    <PriceInput key={addon.name} label={addon.name} value={addon.value} onChange={v => updateProductAddOn(catIndex, i, v)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Dedicated Add-Ons Tab */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          {/* Sticker Finish Add-Ons */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Sticker Finishes</h3>
            <p className="text-sm text-muted-foreground mb-4">Base price added per sticker for each finish</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {config.stickerAddOns.map((addon, i) => (
                <PriceInput key={addon.name} label={addon.name} value={addon.value} onChange={v => updateStickerAddOn(i, v)} />
              ))}
            </div>
          </div>

          {/* All Product Add-Ons grouped by category */}
          {config.products.map((cat, catIndex) => {
            if (cat.addOns.length === 0) return null
            return (
              <div key={cat.name} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">Base price per add-on</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cat.addOns.map((addon, i) => (
                    <PriceInput key={addon.name} label={addon.name} value={addon.value} onChange={v => updateProductAddOn(catIndex, i, v)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem('tss-orders') || '[]'))
  }, [])

  const updateStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o)
    setOrders(updated)
    localStorage.setItem('tss-orders', JSON.stringify(updated))
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0)
  const uniqueCustomers = new Set(orders.map(o => o.customer.email)).size

  const logout = () => {
    sessionStorage.removeItem('tss-admin')
    window.location.reload()
  }

  return (
    <section className="py-8 md:py-16">
      <div className="section-container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black"
          >
            Admin Dashboard
          </motion.h1>
          <button onClick={logout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Package size={20} className="text-primary" /></div>
              <span className="text-sm text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-3xl font-black">{orders.length}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center"><DollarSign size={20} className="text-green-400" /></div>
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-3xl font-black text-green-400">${totalRevenue.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center"><Users size={20} className="text-blue-400" /></div>
              <span className="text-sm text-muted-foreground">Unique Customers</span>
            </div>
            <p className="text-3xl font-black">{uniqueCustomers}</p>
          </motion.div>
        </div>

        {/* Pricing Editor */}
        <div className="mb-10">
          <PricingEditor />
        </div>

        {/* Orders */}
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet. They'll show up here when customers pay.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const isOpen = expanded === order.id
              const cfg = statusConfig[order.status] || statusConfig.completed
              const StatusIcon = cfg.icon
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ${cfg.color}`}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{order.customer.firstName} {order.customer.lastName}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-black text-primary">${order.total}</span>
                      {isOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                      {/* Customer Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Contact</h4>
                          <p className="text-sm">{order.customer.email}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Shipping</h4>
                          <p className="text-sm">{order.customer.address}</p>
                          <p className="text-sm">{order.customer.city}, {order.customer.state} {order.customer.zip}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, j) => (
                            <div key={j} className="flex justify-between items-start bg-muted/30 rounded-xl p-3">
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.option} · {item.size}{item.material ? ` · ${item.material}` : ''}{item.shape ? ` · ${item.shape}` : ''}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                {item.addOns && item.addOns.length > 0 && (
                                  <p className="text-xs text-muted-foreground">Add-ons: {item.addOns.map(a => `${a.name} (+$${a.price.toFixed(2)})`).join(', ')}</p>
                                )}
                              </div>
                              <span className="font-bold text-sm text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order ID & Status Update */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground break-all">PayPal ID: {order.id}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Status:</span>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('tss-admin') === 'true')
  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />
  return <Dashboard />
}
