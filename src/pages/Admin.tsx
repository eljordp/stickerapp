import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LogOut, Package, DollarSign, Users, ChevronDown, ChevronUp,
  Truck, Clock, CheckCircle, Settings, RotateCcw, Save, Loader2,
  ShoppingCart, BarChart3, UserPlus, Eye, MousePointer, ArrowRight,
  Copy, ExternalLink, Mail, Tag, Plus, Trash2, ToggleLeft, ToggleRight, Share2, Gift,
} from 'lucide-react'
import { getPricing, savePricing, defaultPricing, type PricingConfig } from '@/lib/pricing'
import { supabase } from '@/lib/supabase'
import { getReferralUrl } from '@/lib/referrals'
import { toast } from 'sonner'
import { getPromoCodes, savePromoCodes, categoryLabels, type PromoCode } from '@/lib/promoCodes'
import { getReferrers, saveReferrers, getReferralLog, getReferralShareUrl, type Referrer, type ReferrerTier } from '@/lib/referralRewards'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string; name: string; size: string; option: string
  price: number; quantity: number
  addOns?: { name: string; price: number }[]
  material?: string; shape?: string
}

interface Order {
  id: string; date: string
  customer: {
    firstName: string; lastName: string; email: string; phone: string
    address: string; city: string; state: string; zip: string
  }
  items: OrderItem[]; total: string
  status: 'completed' | 'shipped' | 'processing'
}

interface CartSession {
  id: string; email: string | null; items: unknown[]
  total_price: number; converted: boolean
  created_at: string; updated_at: string
}

interface Customer {
  id: string; email: string; first_name: string | null; last_name: string | null
  phone: string | null; total_spent: number; order_count: number
  referral_code: string | null; source: string | null
  referred_by: string | null; created_at: string
}

type CustomerTag = 'admin' | 'vip' | 'customer'

function getCustomerTags(): Record<string, CustomerTag> {
  return JSON.parse(localStorage.getItem('tss-customer-tags') || '{}')
}

function setCustomerTag(customerId: string, tag: CustomerTag) {
  const tags = getCustomerTags()
  if (tag === 'customer') {
    delete tags[customerId]
  } else {
    tags[customerId] = tag
  }
  localStorage.setItem('tss-customer-tags', JSON.stringify(tags))
}

const tagConfig: Record<CustomerTag, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  vip: { label: 'VIP', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  customer: { label: 'Customer', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
}

interface AnalyticsSummary {
  totalViews: number; uniqueVisitors: number; todayViews: number
  topPages: { path: string; views: number }[]
  topClicks: { element: string; count: number }[]
  dropOffs: { from_path: string; to_path: string; count: number }[]
  avgDuration: { path: string; avg_ms: number }[]
}

// ─── Login Form ──────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Authentication failed'); setLoading(false); return }

      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      if (!isAdmin) {
        await supabase.auth.signOut()
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      toast.success('Logged in successfully')
      onLogin()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('fetch') || msg.includes('network')) {
        setError('Cannot connect to server. Check your internet connection or contact the developer.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-black mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
              <input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="admin@email.com" required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Logging in...</> : 'Log In'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Shared Components ───────────────────────────────────────────────────────

const statusConfig = {
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-400 bg-blue-400/10' },
  processing: { label: 'Processing', icon: Clock, color: 'text-yellow-400 bg-yellow-400/10' },
}

function StatCard({ icon: Icon, label, value, color = 'text-primary', delay = 0 }: {
  icon: typeof Package; label: string; value: string | number; color?: string; delay?: number
}) {
  const bgColor = color.split(' ')[0].replace('text-', 'bg-') + '/10'
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon size={20} className={color.split(' ')[0]} />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className={`text-3xl font-black ${color.split(' ')[0]}`}>{value}</p>
    </motion.div>
  )
}

// ─── Orders Tab ──────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setOrders(data.map(o => ({
          id: o.id, date: o.created_at,
          customer: {
            firstName: o.customer_first_name, lastName: o.customer_last_name,
            email: o.customer_email, phone: o.customer_phone || '',
            address: o.customer_address || '', city: o.customer_city || '',
            state: o.customer_state || '', zip: o.customer_zip || '',
          },
          items: o.items as OrderItem[], total: String(o.total),
          status: o.status as Order['status'],
        })))
      } else {
        setOrders(JSON.parse(localStorage.getItem('tss-orders') || '[]'))
      }
    } catch {
      setOrders(JSON.parse(localStorage.getItem('tss-orders') || '[]'))
    } finally { setLoading(false) }
  }

  const updateStatus = async (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o)
    setOrders(updated)
    try { await supabase.from('orders').update({ status }).eq('id', orderId) } catch {
      localStorage.setItem('tss-orders', JSON.stringify(updated))
    }
    toast.success(`Order status updated to ${status}`)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0)
  const uniqueCustomers = new Set(orders.map(o => o.customer.email)).size

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading orders...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Total Orders" value={orders.length} delay={0.1} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="text-green-400" delay={0.2} />
        <StatCard icon={Users} label="Unique Customers" value={uniqueCustomers} color="text-blue-400" delay={0.3} />
      </div>

      <h2 className="text-xl font-bold">Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const isOpen = expanded === order.id
            const cfg = statusConfig[order.status] || statusConfig.completed
            const StatusIcon = cfg.icon
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={isOpen}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ${cfg.color}`}>
                      <StatusIcon size={12} />{cfg.label}
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground break-all">PayPal ID: {order.id}</p>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`status-${order.id}`} className="text-xs text-muted-foreground">Status:</label>
                        <select id={`status-${order.id}`} value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value as Order['status'])}
                          className="text-xs px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
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
  )
}

// ─── Pricing Tab ─────────────────────────────────────────────────────────────

const categoryTabs = [
  { id: 'stickers', label: 'Stickers' },
  { id: 'mylar', label: 'Mylar', productIndex: 0 },
  { id: 'displays', label: 'Displays', productIndex: 1 },
  { id: 'backdrops', label: 'Backdrops', productIndex: 2 },
  { id: 'tablecovers', label: 'Table Covers', productIndex: 3 },
  { id: 'banners', label: 'Banners', productIndex: 4 },
  { id: 'bizcards', label: 'Biz Cards', productIndex: 5 },
  { id: 'storefront', label: 'Storefront', productIndex: 6 },
  { id: 'aframes', label: 'A-Frames', productIndex: 7 },
  { id: 'wallgraphics', label: 'Wall Graphics', productIndex: 8 },
  { id: 'decals', label: 'Decals', productIndex: 9 },
  { id: 'fullwraps', label: 'Full Wraps', productIndex: 10 },
  { id: 'partialwraps', label: 'Partial Wraps', productIndex: 11 },
  { id: 'frosted', label: 'Frosted Film', productIndex: 12 },
  { id: 'solar', label: 'Solar Film', productIndex: 13 },
  { id: 'security', label: 'Security Film', productIndex: 14 },
  { id: 'autotint', label: 'Auto Tint', productIndex: 15 },
  { id: 'flyers', label: 'Flyers', productIndex: 16 },
  { id: 'postcards', label: 'Postcards', productIndex: 17 },
  { id: 'magnets', label: 'Magnets', productIndex: 18 },
  { id: 'addons', label: 'Add-Ons' },
]

function PriceInput({ value, onChange, label }: { value: number; onChange: (v: string) => void; label: string }) {
  return (
    <div className="bg-muted/30 rounded-xl p-3">
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
        <input type="number" step="0.01" min="0" value={value} onChange={e => onChange(e.target.value)}
          className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
      </div>
    </div>
  )
}

function SubTabs({ active, tabs, onChange }: { active: string; tabs: { id: string; label: string }[]; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit" role="tablist">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} role="tab" aria-selected={active === tab.id}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${active === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function PricingTab() {
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

  const handleSave = () => { savePricing(config); setSaved(true); toast.success('Pricing saved'); setTimeout(() => setSaved(false), 2000) }
  const handleReset = () => { setConfig(defaultPricing); savePricing(defaultPricing); setSaved(true); toast.success('Pricing reset to defaults'); setTimeout(() => setSaved(false), 2000) }

  const tierLabels = ['1–50', '51–100', '101–200', '201–500', '501+']
  const activeProduct = categoryTabs.find(t => t.id === activeTab)

  return (
    <div className="space-y-6">
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

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Pricing categories">
        {categoryTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} role="tab" aria-selected={activeTab === tab.id}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stickers' && (
        <div className="space-y-5">
          <SubTabs active={getSubTab('stickers')} tabs={[{ id: 'pricing', label: 'Quantity Pricing' }, { id: 'materials', label: 'Materials' }]} onChange={v => setSubTabFor('stickers', v)} />
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
                      <input type="number" step="0.05" min="0.1" value={mat.multiplier} onChange={e => updateMultiplier(i, e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeProduct && activeProduct.productIndex !== undefined && config.products[activeProduct.productIndex] && (() => {
        const catIndex = activeProduct.productIndex!
        const cat = config.products[catIndex]
        const hasAddOns = cat.addOns.length > 0
        const currentSub = getSubTab(activeTab)
        return (
          <div className="space-y-5">
            {hasAddOns && (
              <SubTabs active={currentSub} tabs={[{ id: 'pricing', label: 'Quantity Pricing' }, { id: 'addons', label: 'Add-Ons' }]} onChange={v => setSubTabFor(activeTab, v)} />
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
                              <input type="number" step="0.01" min="0" value={q.price}
                                onChange={e => updateProductPrice(catIndex, itemIndex, qtyIndex, e.target.value)}
                                className="w-full pl-6 pr-2 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
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

      {activeTab === 'addons' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-1">Sticker Finishes</h3>
            <p className="text-sm text-muted-foreground mb-4">Base price added per sticker for each finish</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {config.stickerAddOns.map((addon, i) => (
                <PriceInput key={addon.name} label={addon.name} value={addon.value} onChange={v => updateStickerAddOn(i, v)} />
              ))}
            </div>
          </div>
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

function PromoCodeManager() {
  const [codes, setCodes] = useState<PromoCode[]>(() => getPromoCodes())
  const [showAdd, setShowAdd] = useState(false)
  const [newCode, setNewCode] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    label: '',
    category: 'custom' as PromoCode['category'],
    minOrder: 0,
    maxUses: 0,
    expiresAt: '',
  })

  const toggleActive = (index: number) => {
    const updated = codes.map((c, i) => i === index ? { ...c, active: !c.active } : c)
    setCodes(updated)
    savePromoCodes(updated)
  }

  const deleteCode = (index: number) => {
    const updated = codes.filter((_, i) => i !== index)
    setCodes(updated)
    savePromoCodes(updated)
  }

  const addCode = () => {
    if (!newCode.code.trim() || !newCode.label.trim()) return
    const code: PromoCode = {
      code: newCode.code.toUpperCase().trim().replace(/\s/g, ''),
      type: newCode.type,
      value: newCode.value,
      label: newCode.label,
      category: newCode.category,
      minOrder: newCode.minOrder || undefined,
      maxUses: newCode.maxUses || undefined,
      uses: 0,
      active: true,
      expiresAt: newCode.expiresAt || undefined,
      createdAt: new Date().toISOString(),
    }
    const updated = [...codes, code]
    setCodes(updated)
    savePromoCodes(updated)
    setNewCode({ code: '', type: 'percent', value: 10, label: '', category: 'custom', minOrder: 0, maxUses: 0, expiresAt: '' })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag size={20} className="text-primary" />
          <h2 className="text-xl font-bold">Promo Codes</h2>
          <span className="text-sm text-muted-foreground">({codes.filter(c => c.active).length} active)</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all"
        >
          <Plus size={14} /> New Code
        </button>
      </div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-primary/30 rounded-2xl p-6 space-y-4"
        >
          <h3 className="font-bold">Create Promo Code</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Code *</label>
              <input type="text" value={newCode.code} onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })} placeholder="e.g. TRADESHOW2026" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase tracking-wider" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Label *</label>
              <input type="text" value={newCode.label} onChange={e => setNewCode({ ...newCode, label: e.target.value })} placeholder="e.g. Bay Area Trade Show 2026" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
              <select value={newCode.category} onChange={e => setNewCode({ ...newCode, category: e.target.value as PromoCode['category'] })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="friends_family">Friends & Family</option>
                <option value="first_time">First Time Customer</option>
                <option value="event">Trade Show / Event</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Discount Type</label>
              <select value={newCode.type} onChange={e => setNewCode({ ...newCode, type: e.target.value as 'percent' | 'fixed' })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="percent">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Value ({newCode.type === 'percent' ? '%' : '$'})</label>
              <input type="number" min="0" step={newCode.type === 'percent' ? '1' : '0.01'} value={newCode.value} onChange={e => setNewCode({ ...newCode, value: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Min Order ($)</label>
              <input type="number" min="0" step="1" value={newCode.minOrder} onChange={e => setNewCode({ ...newCode, minOrder: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Max Uses (0 = unlimited)</label>
              <input type="number" min="0" step="1" value={newCode.maxUses} onChange={e => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expires (optional)</label>
              <input type="date" value={newCode.expiresAt} onChange={e => setNewCode({ ...newCode, expiresAt: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCode} className="btn-primary text-sm">Create Code</button>
            <button onClick={() => setShowAdd(false)} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2">Cancel</button>
          </div>
        </motion.div>
      )}

      {codes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Tag size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No promo codes yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {codes.map((code, i) => (
            <div key={code.code} className={`bg-card border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${code.active ? 'border-border' : 'border-border opacity-50'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => toggleActive(i)} className="shrink-0">
                  {code.active ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-muted-foreground" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black tracking-wider">{code.code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{code.type === 'percent' ? `${code.value}% off` : `$${code.value} off`}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{categoryLabels[code.category]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{code.label}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{code.uses} uses</span>
                    {code.maxUses ? <span>max {code.maxUses}</span> : null}
                    {code.minOrder ? <span>min ${code.minOrder}</span> : null}
                    {code.expiresAt ? <span>expires {new Date(code.expiresAt).toLocaleDateString()}</span> : null}
                  </div>
                </div>
              </div>
              <button onClick={() => deleteCode(i)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 self-end sm:self-center">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Carts Tab ───────────────────────────────────────────────────────────────

function CartsTab() {
  const [carts, setCarts] = useState<CartSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'converted'>('all')

  useEffect(() => { fetchCarts() }, [])

  const fetchCarts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('cart_sessions').select('*').order('updated_at', { ascending: false })
      if (!error && data) setCarts(data as CartSession[])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const filtered = carts.filter(c => {
    if (filter === 'abandoned') return !c.converted
    if (filter === 'converted') return c.converted
    return true
  })

  const abandonedCount = carts.filter(c => !c.converted).length
  const convertedCount = carts.filter(c => c.converted).length
  const abandonedValue = carts.filter(c => !c.converted).reduce((s, c) => s + (c.total_price || 0), 0)

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading cart sessions...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={ShoppingCart} label="Abandoned Carts" value={abandonedCount} color="text-yellow-400" delay={0.1} />
        <StatCard icon={DollarSign} label="Abandoned Value" value={`$${abandonedValue.toFixed(2)}`} color="text-red-400" delay={0.2} />
        <StatCard icon={CheckCircle} label="Converted" value={convertedCount} color="text-green-400" delay={0.3} />
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'abandoned', 'converted'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'abandoned' ? `(${abandonedCount})` : f === 'converted' ? `(${convertedCount})` : `(${carts.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No cart sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cart, i) => {
            const items = (cart.items || []) as { name?: string; quantity?: number }[]
            return (
              <motion.div key={cart.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={14} className="text-muted-foreground shrink-0" />
                      <p className="font-medium truncate">{cart.email || 'No email'}</p>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${cart.converted ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                        {cart.converted ? 'Converted' : 'Abandoned'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {items.length} item{items.length !== 1 ? 's' : ''}: {items.map(item => item.name || 'Item').join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {new Date(cart.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-black text-primary shrink-0">${(cart.total_price || 0).toFixed(2)}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────

function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d')

  useEffect(() => { fetchAnalytics() }, [range])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let since = ''
      if (range === 'today') since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      else if (range === '7d') since = new Date(now.getTime() - 7 * 86400000).toISOString()
      else if (range === '30d') since = new Date(now.getTime() - 30 * 86400000).toISOString()

      // Page views
      let pvQuery = supabase.from('page_views').select('path, visitor_id, created_at')
      if (since) pvQuery = pvQuery.gte('created_at', since)
      const { data: pvData } = await pvQuery

      const views = pvData || []
      const totalViews = views.length
      const uniqueVisitors = new Set(views.map(v => v.visitor_id)).size

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const todayViews = views.filter(v => v.created_at >= today).length

      // Top pages
      const pageCounts: Record<string, number> = {}
      views.forEach(v => { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1 })
      const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, views: count }))

      // Top clicks
      let clickQuery = supabase.from('click_events').select('element')
      if (since) clickQuery = clickQuery.gte('created_at', since)
      const { data: clickData } = await clickQuery

      const clickCounts: Record<string, number> = {}
      ;(clickData || []).forEach(c => { clickCounts[c.element] = (clickCounts[c.element] || 0) + 1 })
      const topClicks = Object.entries(clickCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([element, count]) => ({ element, count }))

      // Navigation / drop-offs
      let navQuery = supabase.from('nav_events').select('from_path, to_path, duration_ms')
      if (since) navQuery = navQuery.gte('created_at', since)
      const { data: navData } = await navQuery

      const navPairs: Record<string, number> = {}
      const durationByPath: Record<string, number[]> = {}
      ;(navData || []).forEach(n => {
        const key = `${n.from_path} → ${n.to_path}`
        navPairs[key] = (navPairs[key] || 0) + 1
        if (!durationByPath[n.from_path]) durationByPath[n.from_path] = []
        durationByPath[n.from_path].push(n.duration_ms || 0)
      })

      const dropOffs = Object.entries(navPairs).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([pair, count]) => {
          const [from_path, to_path] = pair.split(' → ')
          return { from_path, to_path, count }
        })

      const avgDuration = Object.entries(durationByPath)
        .map(([path, durations]) => ({ path, avg_ms: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) }))
        .sort((a, b) => b.avg_ms - a.avg_ms)
        .slice(0, 10)

      setData({ totalViews, uniqueVisitors, todayViews, topPages, topClicks, dropOffs, avgDuration })
    } catch {
      setData({ totalViews: 0, uniqueVisitors: 0, todayViews: 0, topPages: [], topClicks: [], dropOffs: [], avgDuration: [] })
    } finally { setLoading(false) }
  }

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading analytics...</p>
    </div>
  )

  if (!data) return null

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 size={20} className="text-primary" /> Site Analytics</h2>
        <div className="flex gap-1">
          {(['today', '7d', '30d', 'all'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {r === 'today' ? 'Today' : r === 'all' ? 'All Time' : `Last ${r}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Total Page Views" value={data.totalViews} delay={0.1} />
        <StatCard icon={Users} label="Unique Visitors" value={data.uniqueVisitors} color="text-blue-400" delay={0.2} />
        <StatCard icon={BarChart3} label="Views Today" value={data.todayViews} color="text-green-400" delay={0.3} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Eye size={16} className="text-primary" /> Top Pages</h3>
          {data.topPages.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
            <div className="space-y-2">
              {data.topPages.map((p, i) => (
                <div key={p.path} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <span className="text-sm font-mono truncate">{p.path}</span>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><MousePointer size={16} className="text-primary" /> Top Clicks</h3>
          {data.topClicks.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
            <div className="space-y-2">
              {data.topClicks.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <span className="text-sm truncate">{c.element}</span>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRight size={16} className="text-primary" /> Navigation Flow</h3>
          {data.dropOffs.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
            <div className="space-y-2">
              {data.dropOffs.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0 text-sm">
                    <span className="font-mono truncate">{d.from_path}</span>
                    <ArrowRight size={12} className="text-muted-foreground shrink-0" />
                    <span className="font-mono truncate">{d.to_path}</span>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={16} className="text-primary" /> Avg Time on Page</h3>
          {data.avgDuration.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
            <div className="space-y-2">
              {data.avgDuration.map((d, i) => (
                <div key={d.path} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <span className="text-sm font-mono truncate">{d.path}</span>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{formatDuration(d.avg_ms)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CRM / Referrals Tab ────────────────────────────────────────────────────

function CRMTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [referrals, setReferrals] = useState<{ id: string; referral_code: string; status: string; created_at: string; order_id: string | null; referrer: { email: string; first_name: string | null } | null; referred: { email: string; first_name: string | null } | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'customers' | 'referrals'>('customers')
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<CustomerTag | 'all'>('all')
  const [tags, setTags] = useState<Record<string, CustomerTag>>(getCustomerTags())

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [{ data: custData }, { data: refData }] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('referrals').select('*, referrer:referrer_id(email, first_name), referred:referred_id(email, first_name)').order('created_at', { ascending: false }),
      ])
      if (custData) setCustomers(custData as Customer[])
      if (refData) setReferrals(refData as typeof referrals)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleTagChange = (customerId: string, tag: CustomerTag) => {
    setCustomerTag(customerId, tag)
    setTags(getCustomerTags())
    toast.success(`Customer tagged as ${tagConfig[tag].label}`)
  }

  const getTag = (customerId: string): CustomerTag => tags[customerId] || 'customer'

  const filtered = customers.filter(c => {
    const matchesSearch = !search || c.email.toLowerCase().includes(search.toLowerCase()) || (c.first_name || '').toLowerCase().includes(search.toLowerCase()) || (c.last_name || '').toLowerCase().includes(search.toLowerCase())
    const matchesTag = tagFilter === 'all' || getTag(c.id) === tagFilter
    return matchesSearch && matchesTag
  })

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((s, c) => s + (c.total_spent || 0), 0)
  const totalReferrals = referrals.length
  const adminCount = customers.filter(c => getTag(c.id) === 'admin').length
  const vipCount = customers.filter(c => getTag(c.id) === 'vip').length

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(getReferralUrl(code))
    toast.success('Referral link copied!')
  }

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading CRM data...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Customers" value={totalCustomers} delay={0.1} />
        <StatCard icon={DollarSign} label="Lifetime Revenue" value={`$${totalRevenue.toFixed(2)}`} color="text-green-400" delay={0.2} />
        <StatCard icon={UserPlus} label="Referrals" value={totalReferrals} color="text-purple-400" delay={0.3} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {(['customers', 'referrals'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === v ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {v === 'customers' ? `Customers (${totalCustomers})` : `Referrals (${totalReferrals})`}
            </button>
          ))}
        </div>
        {view === 'customers' && (
          <>
            <div className="flex gap-1">
              {([['all', `All (${totalCustomers})`], ['admin', `Admins (${adminCount})`], ['vip', `VIP (${vipCount})`], ['customer', `Regular`]] as [CustomerTag | 'all', string][]).map(([key, label]) => (
                <button key={key} onClick={() => setTagFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tagFilter === key ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent'}`}>
                  {label}
                </button>
              ))}
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
              className="px-4 py-2 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 max-w-xs" />
          </>
        )}
      </div>

      {view === 'customers' && (
        filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{search ? 'No matching customers' : 'No customers yet.'}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Email</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Orders</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Spent</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Referral Code</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const tag = getTag(c.id)
                    const cfg = tagConfig[tag]
                    return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={tag}
                          onChange={e => handleTagChange(c.id, e.target.value as CustomerTag)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer bg-transparent ${cfg.bg} ${cfg.color} focus:outline-none focus:ring-1 focus:ring-primary/50`}
                        >
                          <option value="customer">Customer</option>
                          <option value="vip">VIP</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                      <td className="px-4 py-3 text-right font-bold">{c.order_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-400">${(c.total_spent || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-lg text-xs bg-muted/50 text-muted-foreground">{c.source || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.referral_code ? (
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{c.referral_code}</code>
                            <button onClick={() => copyLink(c.referral_code!)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy referral link">
                              <Copy size={12} />
                            </button>
                            <a href={getReferralUrl(c.referral_code)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Open referral link">
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {view === 'referrals' && (
        referrals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <UserPlus size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No referrals yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref, i) => (
              <motion.div key={ref.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-bold">{ref.referrer?.first_name || ref.referrer?.email || '?'}</span>
                      <span className="text-muted-foreground"> referred </span>
                      <span className="font-bold">{ref.referred?.first_name || ref.referred?.email || '?'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Code: {ref.referral_code} · {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    ref.status === 'purchased' ? 'text-green-400 bg-green-400/10' :
                    ref.status === 'signed_up' ? 'text-blue-400 bg-blue-400/10' :
                    'text-yellow-400 bg-yellow-400/10'
                  }`}>
                    {ref.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const mainTabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'promos', label: 'Promos', icon: Tag },
  { id: 'carts', label: 'Carts', icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'referrals', label: 'Referrals', icon: Share2 },
] as const

type MainTab = (typeof mainTabs)[number]['id']

function Dashboard() {
  const [activeTab, setActiveTab] = useState<MainTab>('orders')

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <section className="py-8 md:py-16">
      <div className="section-container max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black">
            Admin Dashboard
          </motion.h1>
          <button onClick={logout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Sign out">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-8 scrollbar-hide" role="tablist" aria-label="Admin sections">
          {mainTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} role="tab" aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}>
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'pricing' && <PricingTab />}
        {activeTab === 'promos' && <PromoCodeManager />}
        {activeTab === 'carts' && <CartsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'crm' && <CRMTab />}
        {activeTab === 'referrals' && <ReferralsTab />}
      </div>
    </section>
  )
}

// ─── Referrals Tab ──────────────────────────────────────────────────────────

function ReferralsTab() {
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [logs, setLogs] = useState(getReferralLog())
  const [view, setView] = useState<'referrers' | 'conversions'>('referrers')

  useEffect(() => {
    setReferrers(getReferrers())
    setLogs(getReferralLog())
  }, [])

  const totalClicks = referrers.reduce((s, r) => s + r.clicks, 0)
  const totalConversions = referrers.reduce((s, r) => s + r.conversions, 0)
  const totalEarned = referrers.reduce((s, r) => s + r.totalEarned, 0)

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(getReferralShareUrl(code))
    toast.success('Referral link copied!')
  }

  const toggleTier = (referrerId: string) => {
    const updated = referrers.map(r => {
      if (r.id === referrerId) {
        const newTier: ReferrerTier = r.tier === 'partner' ? 'standard' : 'partner'
        return { ...r, tier: newTier }
      }
      return r
    })
    saveReferrers(updated)
    setReferrers(updated)
    const ref = updated.find(r => r.id === referrerId)
    toast.success(`${ref?.name} is now ${ref?.tier === 'partner' ? 'a Partner (10%)' : 'Standard (5%)'}`)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Referrers', value: referrers.length, icon: Users },
          { label: 'Total Clicks', value: totalClicks, icon: MousePointer },
          { label: 'Conversions', value: totalConversions, icon: CheckCircle },
          { label: 'Commission Paid', value: `$${totalEarned.toFixed(2)}`, icon: Gift },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2"><s.icon size={16} /><span className="text-xs font-medium">{s.label}</span></div>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {(['referrers', 'conversions'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === v ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
            {v === 'referrers' ? `Referrers (${referrers.length})` : `Conversions (${logs.length})`}
          </button>
        ))}
      </div>

      {view === 'referrers' && (
        referrers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Share2 size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No referrers yet. Share the <a href="/referral" className="text-primary underline">/referral</a> page.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-center px-4 py-3">Tier</th>
                  <th className="text-center px-4 py-3">Clicks</th>
                  <th className="text-center px-4 py-3">Sales</th>
                  <th className="text-center px-4 py-3">Earned</th>
                  <th className="text-left px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs bg-muted/50 px-2 py-0.5 rounded font-bold">{r.code}</code>
                        <button onClick={() => copyLink(r.code)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy referral link">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleTier(r.id)} className="group flex items-center gap-1.5 mx-auto" title={`Click to ${r.tier === 'partner' ? 'demote to Standard' : 'promote to Partner'}`}>
                        {r.tier === 'partner'
                          ? <><ToggleRight size={20} className="text-primary" /><span className="text-xs font-bold text-primary">10%</span></>
                          : <><ToggleLeft size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" /><span className="text-xs font-medium text-muted-foreground">5%</span></>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">{r.clicks}</td>
                    <td className="px-4 py-3 text-center font-bold text-green-400">{r.conversions}</td>
                    <td className="px-4 py-3 text-center font-bold text-yellow-400">${r.totalEarned.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {view === 'conversions' && (
        logs.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Gift size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No referral conversions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      <span className="text-primary">{log.referrerName}</span> referred <span className="font-bold">{log.buyerName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Code: {log.referrerCode} · Order: ${log.orderTotal.toFixed(2)} · {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Reward generated</p>
                    <code className="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded font-bold">{log.rewardCodeGenerated}</code>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => { checkSession() }, [])

  const checkSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
        setAuthed(!!isAdmin)
      }
    } catch { /* Not authenticated */ }
    finally { setChecking(false) }
  }

  if (checking) return (
    <section className="py-16 md:py-24 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin" />
    </section>
  )

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />
  return <Dashboard />
}
