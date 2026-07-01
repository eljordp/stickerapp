import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LogOut, Package, DollarSign, Users, ChevronDown, ChevronUp,
  Truck, Clock, CheckCircle, Settings, RotateCcw, Save, Loader2,
  ShoppingCart, BarChart3, UserPlus, Eye, MousePointer,
  Copy, ExternalLink, Mail, Tag, Plus, Trash2, ToggleLeft, ToggleRight, Share2, Gift,
  CreditCard, Unplug, Send, AlertCircle, MapPin,
  TrendingUp, Target, Search, Globe, History,
  Sun, Moon,
} from 'lucide-react'
import { getPricing, loadPricing, savePricing, defaultPricing, type PricingConfig } from '@/lib/pricing'
import { supabase } from '@/lib/supabase'
import { getReferralUrl } from '@/lib/referrals'
import { markStaffDevice } from '@/lib/analytics'
import { toast } from 'sonner'
import { getPromoCodes, savePromoCodes, categoryLabels, type PromoCode } from '@/lib/promoCodes'
import { getReferrers, saveReferrers, getReferralLog, getReferralShareUrl, type Referrer, type ReferrerTier } from '@/lib/referralRewards'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string; name: string; size: string; option: string
  price: number; quantity: number
  addOns?: { name: string; price: number }[]
  material?: string; shape?: string
  artwork?: {
    path: string
    fileName: string
    contentType?: string
    size?: number
  }
}

type OrderStatus = 'completed' | 'shipped' | 'processing'
type PaymentStatus = 'captured' | 'not_captured' | 'not_found' | 'unverified' | 'checking' | 'error'

interface Order {
  id: string; date: string
  customer: {
    firstName: string; lastName: string; email: string; phone: string
    address: string; city: string; state: string; zip: string
  }
  items: OrderItem[]; total: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentCheckedAt?: string
  paymentIssue?: string
  paypalCaptureId?: string
  paymentAmount?: string
  paymentCurrency?: string
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

type CRMReferral = {
  id: string
  referral_code: string
  status: string
  created_at: string
  order_id: string | null
  referrer: { email: string; first_name: string | null } | null
  referred: { email: string; first_name: string | null } | null
}

interface EmailSubscriber {
  id: string
  email: string
  name: string | null
  phone: string | null
  service_interest: string | null
  source: string | null
  status: 'subscribed' | 'unsubscribed'
  tags: string[] | null
  consented_at: string
  created_at: string
}

interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  service: string | null
  message: string
  source: string | null
  created_at: string
}

interface SquareConnectionStatus {
  connected: boolean
  connection: {
    merchant_id: string | null
    location_id: string | null
    location_name: string | null
    connected_at: string | null
    token_expires_at: string | null
    scopes: string[] | null
  } | null
  missing: string[]
  redirectUri: string
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
  visitors: number; pageViews: number
  leads: number; orders: number; revenue: number; ctaClicks: number
  topProducts: { name: string; views: number }[]
  topClicks: { element: string; count: number }[]
  funnel: { label: string; count: number; pct: number }[]
  capped: boolean
}

const ADMIN_BACKGROUND_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000
const ANALYTICS_PAGE_SIZE = 1000
const ANALYTICS_MAX_ROWS = 10000

// Customer-facing product/service pages → owner-friendly names.
const PRODUCT_PAGE_NAMES: Record<string, string> = {
  '/stickers': 'Stickers',
  '/sticker-sheets': 'Sticker Sheets',
  '/die-cut-stickers': 'Die-Cut Stickers',
  '/holographic-stickers': 'Holographic Stickers',
  '/custom-labels': 'Custom Labels',
  '/roll-labels': 'Roll Labels',
  '/mylar': 'Mylar Packaging',
  '/services': 'Services (overview)',
  '/services/vehicle-graphics': 'Vehicle Graphics',
  '/services/business-signage': 'Business Signage',
  '/services/event-displays': 'Event Displays',
  '/services/business-print': 'Business Print',
  '/services/window-film': 'Window Film & Tint',
  '/projects': 'Projects / Portfolio',
}

// Pages that are NOT product interest (internal, utility, or staff areas).
function isInternalPath(path: string) {
  return path.startsWith('/admin') || path.startsWith('/account')
}

// Labels that signal buying intent when clicked.
const CTA_KEYWORDS = ['start my project', 'get a quote', 'request a quote', 'quote', 'order', 'add to cart', 'checkout', 'call', 'contact', 'get started']
function isCtaLabel(label: string) {
  const l = (label || '').toLowerCase()
  return CTA_KEYWORDS.some(k => l.includes(k)) || /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(l)
}

function formatRefreshTime(date: Date | null) {
  if (!date) return 'not refreshed yet'
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
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

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Package; color: string }> = {
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-400 bg-blue-400/10' },
  processing: { label: 'Processing', icon: Clock, color: 'text-yellow-400 bg-yellow-400/10' },
}

const paymentReviewConfig = {
  label: 'Payment Review',
  icon: AlertCircle,
  color: 'text-red-400 bg-red-400/10',
}

const paymentConfig: Record<PaymentStatus, { label: string; icon: typeof Package; color: string }> = {
  captured: { label: 'PayPal captured', icon: CheckCircle, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  not_captured: { label: 'No capture found', icon: AlertCircle, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  not_found: { label: 'Not in live PayPal', icon: AlertCircle, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  unverified: { label: 'Payment unverified', icon: AlertCircle, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  checking: { label: 'Checking PayPal', icon: Loader2, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  error: { label: 'Verify failed', icon: AlertCircle, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
}

function normalizePaymentStatus(value: unknown): PaymentStatus {
  if (value === 'captured' || value === 'not_captured' || value === 'not_found' || value === 'checking' || value === 'error') {
    return value
  }
  return 'unverified'
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  if (value === 'completed' || value === 'shipped' || value === 'processing') return value
  return 'processing'
}

function needsPaymentReview(order: Order) {
  if (order.paymentStatus === 'captured') return false
  if (order.paymentStatus === 'not_captured' || order.paymentStatus === 'not_found' || order.paymentStatus === 'error') return true
  return order.status === 'completed'
}

function getVisibleStatusConfig(order: Order) {
  return needsPaymentReview(order) ? paymentReviewConfig : statusConfig[order.status]
}

function artworkDownloadUrl(artwork: NonNullable<OrderItem['artwork']>) {
  return `/api/uploads/artwork-download?path=${encodeURIComponent(artwork.path)}&name=${encodeURIComponent(artwork.fileName)}`
}

async function adminApiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Admin session expired')

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  return fetch(input, { ...init, headers })
}

async function openArtworkDownload(artwork: NonNullable<OrderItem['artwork']>) {
  const response = await adminApiFetch(artworkDownloadUrl(artwork))
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.url) throw new Error(data.error || 'Could not create artwork download link.')
  window.open(data.url, '_blank', 'noopener,noreferrer')
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
  const [loadError, setLoadError] = useState('')
  const verifyAttempted = useRef<Set<string>>(new Set())

  useEffect(() => { fetchOrders() }, [])

  useEffect(() => {
    if (loading) return
    orders
      .filter(order => order.paymentStatus !== 'captured' && order.paymentStatus !== 'checking' && !verifyAttempted.current.has(order.id))
      .slice(0, 25)
      .forEach(order => { void verifyPayment(order.id, true) })
  }, [loading, orders])

  const fetchOrders = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) throw error

      setOrders((data || []).map(o => ({
        id: o.id, date: o.created_at,
        customer: {
          firstName: o.customer_first_name, lastName: o.customer_last_name,
          email: o.customer_email, phone: o.customer_phone || '',
          address: o.customer_address || '', city: o.customer_city || '',
          state: o.customer_state || '', zip: o.customer_zip || '',
        },
        items: o.items as OrderItem[], total: String(o.total),
        status: normalizeOrderStatus(o.status),
        paymentStatus: normalizePaymentStatus(o.payment_status),
        paymentCheckedAt: typeof o.payment_verified_at === 'string' ? o.payment_verified_at : undefined,
        paypalCaptureId: typeof o.paypal_capture_id === 'string' ? o.paypal_capture_id : undefined,
        paymentAmount: o.payment_amount ? String(o.payment_amount) : undefined,
        paymentCurrency: typeof o.payment_currency === 'string' ? o.payment_currency : undefined,
      })))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase error'
      setLoadError(`Could not load Supabase orders: ${message}. Showing only orders saved in this admin browser.`)
      try {
        const localOrders = JSON.parse(localStorage.getItem('tss-orders') || '[]') as Array<Partial<Order>>
        setOrders(localOrders.map(order => ({
          id: String(order.id || ''),
          date: String(order.date || new Date().toISOString()),
          customer: {
            firstName: order.customer?.firstName || '',
            lastName: order.customer?.lastName || '',
            email: order.customer?.email || '',
            phone: order.customer?.phone || '',
            address: order.customer?.address || '',
            city: order.customer?.city || '',
            state: order.customer?.state || '',
            zip: order.customer?.zip || '',
          },
          items: (order.items || []) as OrderItem[],
          total: String(order.total || '0.00'),
          status: normalizeOrderStatus(order.status),
          paymentStatus: normalizePaymentStatus(order.paymentStatus),
          paymentCheckedAt: order.paymentCheckedAt,
          paymentIssue: order.paymentIssue,
          paypalCaptureId: order.paypalCaptureId,
          paymentAmount: order.paymentAmount,
          paymentCurrency: order.paymentCurrency,
        })))
      } catch {
        setOrders([])
      }
    } finally { setLoading(false) }
  }

  const verifyPayment = async (orderId: string, silent = false) => {
    verifyAttempted.current.add(orderId)
    setOrders(prev => prev.map(order => (
      order.id === orderId
        ? { ...order, paymentStatus: 'checking', paymentIssue: 'Checking live PayPal for a completed capture.' }
        : order
    )))

    try {
      const response = await fetch(`/api/paypal/verify-order?orderID=${encodeURIComponent(orderId)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not verify PayPal order.')

      const paymentStatus = normalizePaymentStatus(data.paymentStatus)
      setOrders(prev => prev.map(order => (
        order.id === orderId
          ? {
              ...order,
              paymentStatus,
              paymentCheckedAt: data.verifiedAt || new Date().toISOString(),
              paymentIssue: paymentStatus === 'captured'
                ? ''
                : data.error || 'Live PayPal did not return a completed capture for this order ID.',
              paypalCaptureId: typeof data.captureId === 'string' ? data.captureId : order.paypalCaptureId,
              paymentAmount: data.amount ? String(data.amount) : order.paymentAmount,
              paymentCurrency: typeof data.currency === 'string' ? data.currency : order.paymentCurrency,
            }
          : order
      )))

      if (!silent) {
        if (paymentStatus === 'captured') {
          toast.success('PayPal capture verified')
        } else {
          toast.error('No live PayPal capture found')
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not verify PayPal order.'
      setOrders(prev => prev.map(order => (
        order.id === orderId
          ? { ...order, paymentStatus: 'error', paymentIssue: message, paymentCheckedAt: new Date().toISOString() }
          : order
      )))
      if (!silent) toast.error(message)
    }
  }

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o)
    setOrders(updated)
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
    } catch {
      localStorage.setItem('tss-orders', JSON.stringify(updated))
      toast.error('Could not update Supabase order status. Saved only in this browser.')
      return
    }
    toast.success(`Order status updated to ${status}`)
  }

  const paidOrders = orders.filter(o => o.paymentStatus === 'captured')
  const reviewOrders = orders.filter(needsPaymentReview)
  const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total), 0)
  const uniqueCustomers = new Set(orders.map(o => o.customer.email)).size

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading orders...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
            <p>{loadError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Orders" value={orders.length} delay={0.1} />
        <StatCard icon={DollarSign} label="Verified Revenue" value={`$${totalRevenue.toFixed(2)}`} color="text-green-400" delay={0.2} />
        <StatCard icon={AlertCircle} label="Payment Review" value={reviewOrders.length} color="text-yellow-400" delay={0.3} />
        <StatCard icon={Users} label="Unique Customers" value={uniqueCustomers} color="text-blue-400" delay={0.4} />
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
            const cfg = getVisibleStatusConfig(order)
            const StatusIcon = cfg.icon
            const payment = paymentConfig[order.paymentStatus]
            const PaymentIcon = payment.icon
            const isPaymentChecking = order.paymentStatus === 'checking'
            const isPaymentCaptured = order.paymentStatus === 'captured'
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
                    <span className={`font-black ${isPaymentCaptured ? 'text-primary' : 'text-yellow-400'}`}>${order.total}</span>
                    {isOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                    {needsPaymentReview(order) && (
                      <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                          <p>This order is not counted as paid until live PayPal shows a completed capture for this ID.</p>
                        </div>
                      </div>
                    )}
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
                              {item.artwork?.path && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void openArtworkDownload(item.artwork!).catch(error => {
                                      toast.error(error instanceof Error ? error.message : 'Could not download artwork.')
                                    })
                                  }}
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                >
                                  <ExternalLink size={12} /> Download artwork: {item.artwork.fileName}
                                </button>
                              )}
                            </div>
                            <span className="font-bold text-sm text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground break-all">PayPal ID: {order.id}</p>
                        <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${payment.color}`}>
                          <PaymentIcon size={12} className={isPaymentChecking ? 'animate-spin' : ''} />
                          {payment.label}
                        </div>
                        {order.paypalCaptureId && (
                          <p className="text-xs text-muted-foreground break-all">Capture ID: {order.paypalCaptureId}</p>
                        )}
                        {order.paymentCheckedAt && (
                          <p className="text-xs text-muted-foreground">
                            Checked {new Date(order.paymentCheckedAt).toLocaleString()}
                          </p>
                        )}
                        {order.paymentIssue && (
                          <p className="text-xs text-yellow-200 max-w-xl">{order.paymentIssue}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { void verifyPayment(order.id) }}
                          disabled={isPaymentChecking}
                          className="text-xs px-3 py-1.5 bg-secondary border border-border rounded-lg text-foreground hover:border-primary/40 disabled:opacity-50"
                        >
                          {isPaymentChecking ? 'Checking...' : 'Recheck PayPal'}
                        </button>
                        <label htmlFor={`status-${order.id}`} className="text-xs text-muted-foreground">Job Status:</label>
                        <select id={`status-${order.id}`} value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                          className="text-xs px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
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

// ─── Inquiries Tab ───────────────────────────────────────────────────────────

function InquiriesTab() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const fetchInquiries = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    else setRefreshing(true)
    setLoadError('')
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('id,name,email,phone,service,message,source,created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInquiries((data || []) as ContactInquiry[])
      setLastUpdated(new Date())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase error'
      setLoadError(`Could not load inquiries: ${message}`)
      if (showLoader) setInquiries([])
    } finally {
      if (showLoader) setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void fetchInquiries()

    const intervalId = window.setInterval(() => {
      void fetchInquiries(false)
    }, ADMIN_BACKGROUND_REFRESH_INTERVAL_MS)

    const channel = supabase
      .channel('admin-inquiries-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_submissions' }, () => {
        void fetchInquiries(false)
      })
      .subscribe()

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void fetchInquiries(false)
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      void supabase.removeChannel(channel)
    }
  }, [fetchInquiries])

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`)
    }
  }

  const normalizedSearch = search.trim().toLowerCase()
  const services = Array.from(new Set(inquiries.map(i => i.service).filter(Boolean) as string[])).sort()
  const sources = Array.from(new Set(inquiries.map(i => i.source).filter(Boolean) as string[])).sort()
  const filtered = inquiries.filter(inquiry => {
    if (serviceFilter !== 'all' && inquiry.service !== serviceFilter) return false
    if (sourceFilter !== 'all' && inquiry.source !== sourceFilter) return false
    if (!normalizedSearch) return true
    return [
      inquiry.name,
      inquiry.email,
      inquiry.phone || '',
      inquiry.service || '',
      inquiry.source || '',
      inquiry.message,
    ].some(value => value.toLowerCase().includes(normalizedSearch))
  })
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentCount = inquiries.filter(i => new Date(i.created_at).getTime() >= weekAgo).length
  const uniqueEmails = new Set(inquiries.map(i => i.email.toLowerCase())).size
  const quoteCount = inquiries.filter(i => (i.source || '').includes('quote') || (i.service || '').toLowerCase().includes('quote')).length

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading inquiries...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Live Supabase inquiries / updated {formatRefreshTime(lastUpdated)}</span>
        {refreshing && <span className="inline-flex items-center gap-1 text-primary"><Loader2 size={12} className="animate-spin" /> Refreshing</span>}
      </div>

      {loadError && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
            <p>{loadError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Send} label="Total Inquiries" value={inquiries.length} delay={0.1} />
        <StatCard icon={Clock} label="Last 7 Days" value={recentCount} color="text-blue-400" delay={0.2} />
        <StatCard icon={Users} label="Unique Emails" value={uniqueEmails} color="text-green-400" delay={0.3} />
        <StatCard icon={Mail} label="Quote Leads" value={quoteCount} color="text-yellow-400" delay={0.4} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone, service, message..."
              className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All services</option>
            {services.map(service => <option key={service} value={service}>{service}</option>)}
          </select>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All sources</option>
            {sources.map(source => <option key={source} value={source}>{source}</option>)}
          </select>
          <button
            type="button"
            onClick={() => { void fetchInquiries(false) }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-bold text-foreground hover:border-primary/40"
          >
            {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />} Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Send size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{inquiries.length === 0 ? 'No inquiries found.' : 'No inquiries match those filters.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry, i) => {
            const isOpen = expanded === inquiry.id
            const date = new Date(inquiry.created_at)
            return (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : inquiry.id)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold truncate">{inquiry.name}</p>
                      {inquiry.service && (
                        <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                          {inquiry.service}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{inquiry.email}{inquiry.phone ? ` / ${inquiry.phone}` : ''}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {inquiry.source ? ` / ${inquiry.source}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-sm text-muted-foreground line-clamp-1 max-w-xs">{inquiry.message}</span>
                    {isOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Contact</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={`mailto:${inquiry.email}`} className="text-sm text-primary hover:underline">{inquiry.email}</a>
                          <button type="button" onClick={() => copyText(inquiry.email, 'Email')} className="text-muted-foreground hover:text-foreground" aria-label="Copy email">
                            <Copy size={14} />
                          </button>
                        </div>
                        {inquiry.phone && (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <a href={`tel:${inquiry.phone}`} className="text-sm text-primary hover:underline">{inquiry.phone}</a>
                            <button type="button" onClick={() => copyText(inquiry.phone || '', 'Phone')} className="text-muted-foreground hover:text-foreground" aria-label="Copy phone">
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Lead Source</h4>
                        <p className="text-sm">{inquiry.source || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.service || 'No service selected'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Message</h4>
                      <p className="whitespace-pre-wrap rounded-xl bg-muted/30 p-4 text-sm leading-relaxed">{inquiry.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: Your Sticker Smith quote request`)}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:brightness-110">
                        <Mail size={14} /> Reply
                      </a>
                      <button type="button" onClick={() => copyText(`${inquiry.name}\n${inquiry.email}\n${inquiry.phone || ''}\n${inquiry.service || ''}\n\n${inquiry.message}`, 'Inquiry')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs font-bold text-foreground hover:border-primary/40">
                        <Copy size={14} /> Copy Inquiry
                      </button>
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('stickers')
  const [subTab, setSubTab] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    loadPricing()
      .then((remoteConfig) => {
        if (active) setConfig(remoteConfig)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const getSubTab = (id: string) => subTab[id] || 'pricing'
  const setSubTabFor = (id: string, val: string) => setSubTab(prev => ({ ...prev, [id]: val }))

  const updateTierPrice = (index: number, value: string) => {
    setConfig({ ...config, basePrices: config.basePrices.map((t, i) => i === index ? { ...t, price: parseFloat(value) || 0 } : t) })
  }
  const updateMultiplier = (index: number, value: string) => {
    setConfig({ ...config, materialMultipliers: config.materialMultipliers.map((m, i) => i === index ? { ...m, multiplier: parseFloat(value) || 1 } : m) })
  }
  const updateSizeMultiplier = (index: number, value: string) => {
    setConfig({ ...config, sizeMultipliers: config.sizeMultipliers.map((s, i) => i === index ? { ...s, multiplier: parseFloat(value) || 1 } : s) })
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

  const handleSave = async () => {
    setSaving(true)
    try {
      await savePricing(config)
      setSaved(true)
      toast.success('Pricing saved store-wide')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Could not save pricing to Supabase')
    } finally {
      setSaving(false)
    }
  }
  const handleReset = async () => {
    setConfig(defaultPricing)
    setSaving(true)
    try {
      await savePricing(defaultPricing)
      setSaved(true)
      toast.success('Pricing reset store-wide')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Could not reset pricing in Supabase')
    } finally {
      setSaving(false)
    }
  }

  const tierLabels = ['1–50', '51–100', '101–250', '251–500', '501–1000', '1000+']
  const activeProduct = categoryTabs.find(t => t.id === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-primary" />
          <h2 className="text-xl font-bold">Pricing Manager</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} disabled={saving} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 disabled:opacity-50">
            <RotateCcw size={14} /> Reset All
          </button>
          <button onClick={handleSave} disabled={saving || loading} className={`flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 ${saved ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:brightness-110'}`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saved ? 'Saved!' : loading ? 'Loading...' : 'Save Changes'}
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
          <SubTabs active={getSubTab('stickers')} tabs={[{ id: 'pricing', label: 'Quantity Pricing' }, { id: 'sizes', label: 'Sizes' }, { id: 'materials', label: 'Materials' }]} onChange={v => setSubTabFor('stickers', v)} />
          {getSubTab('stickers') === 'pricing' && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-1">Base Price Per Sticker</h3>
              <p className="text-sm text-muted-foreground mb-4">Price per unit at each quantity tier</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {config.basePrices.map((tier, i) => (
                  <PriceInput key={i} label={`${tierLabels[i]} pcs`} value={tier.price} onChange={v => updateTierPrice(i, v)} />
                ))}
              </div>
            </div>
          )}
          {getSubTab('stickers') === 'sizes' && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-1">Size Multipliers</h3>
              <p className="text-sm text-muted-foreground mb-4">Price multiplier per sticker size (1.0x = base price at 2"×2")</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {config.sizeMultipliers.map((s, i) => (
                  <div key={s.name} className="bg-muted/30 rounded-xl p-3">
                    <label className="block text-xs font-medium text-foreground mb-1.5">{s.name}</label>
                    <div className="relative">
                      <input type="number" step="0.1" min="0.1" value={s.multiplier} onChange={e => updateSizeMultiplier(i, e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">x</span>
                    </div>
                  </div>
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

type AnalyticsTable = 'page_views' | 'click_events' | 'orders'

type PageViewRow = {
  path: string
  visitor_id: string | null
  created_at: string
}

type ClickEventRow = {
  element: string | null
  path: string | null
  created_at: string
}

type OrderAnalyticsRow = {
  total: number | string | null
  payment_status: string | null
  created_at: string
}

async function fetchLiveAnalyticsRows<T>(
  table: AnalyticsTable,
  columns: string,
  since: string,
  excludeInternalPaths = false,
) {
  const rows: T[] = []
  let exactCount: number | null = null

  for (let from = 0; from < ANALYTICS_MAX_ROWS; from += ANALYTICS_PAGE_SIZE) {
    const to = Math.min(from + ANALYTICS_PAGE_SIZE - 1, ANALYTICS_MAX_ROWS - 1)
    let query = supabase
      .from(table)
      .select(columns, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (since) query = query.gte('created_at', since)
    if (excludeInternalPaths) {
      query = query.not('path', 'like', '/admin%').not('path', 'like', '/account%')
    }

    const { data, error, count } = await query
    if (error) throw error
    if (exactCount === null) exactCount = count ?? null

    const page = (data || []) as T[]
    rows.push(...page)
    if (page.length < ANALYTICS_PAGE_SIZE) break
  }

  return {
    rows,
    count: exactCount,
    capped: exactCount !== null ? rows.length < exactCount : rows.length >= ANALYTICS_MAX_ROWS,
  }
}

function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d')

  const fetchAnalytics = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    else setRefreshing(true)
    setLoadError('')
    try {
      const now = new Date()
      let since = ''
      if (range === 'today') since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      else if (range === '7d') since = new Date(now.getTime() - 7 * 86400000).toISOString()
      else if (range === '30d') since = new Date(now.getTime() - 30 * 86400000).toISOString()

      // Page views — drop internal/staff areas so owners see real customers only.
      const {
        rows: pageViewRows,
        count: pageViewCount,
        capped: pageViewsCapped,
      } = await fetchLiveAnalyticsRows<PageViewRow>('page_views', 'path, visitor_id, created_at', since, true)
      const views = pageViewRows.filter(v => !isInternalPath(v.path))

      const pageViews = pageViewCount ?? views.length
      const visitors = new Set(views.map(v => v.visitor_id)).size

      // Most-viewed products/services
      const productCounts: Record<string, number> = {}
      views.forEach(v => {
        if (PRODUCT_PAGE_NAMES[v.path]) productCounts[v.path] = (productCounts[v.path] || 0) + 1
      })
      const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([path, count]) => ({ name: PRODUCT_PAGE_NAMES[path], views: count }))

      // Clicks — most-clicked buttons + buy-intent count
      const {
        rows: clickRows,
        capped: clicksCapped,
      } = await fetchLiveAnalyticsRows<ClickEventRow>('click_events', 'element, path, created_at', since, true)
      const clicks = clickRows.filter(c => !isInternalPath(c.path || ''))

      const clickCounts: Record<string, number> = {}
      let ctaClicks = 0
      clicks.forEach(c => {
        const label = c.element || '—'
        clickCounts[label] = (clickCounts[label] || 0) + 1
        if (isCtaLabel(label)) ctaClicks++
      })
      const topClicks = Object.entries(clickCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([element, count]) => ({ element, count }))

      // Leads — contact / quote form submissions
      let leadQuery = supabase.from('contact_submissions').select('id', { count: 'exact', head: true })
      if (since) leadQuery = leadQuery.gte('created_at', since)
      const { count: leadCount, error: leadError } = await leadQuery
      if (leadError) throw leadError
      const leads = leadCount || 0

      // Orders + paid revenue
      const {
        rows: ordersInRange,
        count: orderCount,
        capped: ordersCapped,
      } = await fetchLiveAnalyticsRows<OrderAnalyticsRow>('orders', 'total, payment_status, created_at', since)
      const orders = orderCount ?? ordersInRange.length
      const revenue = ordersInRange
        .filter(o => o.payment_status === 'captured')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

      // Conversion funnel (unique visitors per stage; final stage = orders placed)
      const visitorsWho = (predicate: (path: string) => boolean) =>
        new Set(views.filter(v => predicate(v.path)).map(v => v.visitor_id)).size
      // All stages use unique visitors for a consistent cohort. The final stage
      // uses /order-confirmation views (only reached after a successful order)
      // rather than the raw order count, which isn't visitor-linked.
      const funnelRaw = [
        { label: 'Visited the site', count: visitors },
        { label: 'Viewed a product', count: visitorsWho(p => !!PRODUCT_PAGE_NAMES[p]) },
        { label: 'Reached the cart', count: visitorsWho(p => p === '/cart') },
        { label: 'Started checkout', count: visitorsWho(p => p === '/checkout') },
        { label: 'Completed an order', count: visitorsWho(p => p === '/order-confirmation') },
      ]
      const top = funnelRaw[0].count || 1
      const funnel = funnelRaw.map(s => ({ ...s, pct: Math.round((s.count / top) * 100) }))

      setData({
        visitors,
        pageViews,
        leads,
        orders,
        revenue,
        ctaClicks,
        topProducts,
        topClicks,
        funnel,
        capped: pageViewsCapped || clicksCapped || ordersCapped,
      })
      setLastUpdated(new Date())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase error'
      setLoadError(`Could not load live analytics: ${message}`)
      setData(current => current ?? {
        visitors: 0,
        pageViews: 0,
        leads: 0,
        orders: 0,
        revenue: 0,
        ctaClicks: 0,
        topProducts: [],
        topClicks: [],
        funnel: [],
        capped: false,
      })
    } finally {
      if (showLoader) setLoading(false)
      setRefreshing(false)
    }
  }, [range])

  useEffect(() => { void fetchAnalytics() }, [fetchAnalytics])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchAnalytics(false)
    }, ADMIN_BACKGROUND_REFRESH_INTERVAL_MS)

    const channel = supabase
      .channel(`admin-analytics-live-${range}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_submissions' }, () => {
        void fetchAnalytics(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void fetchAnalytics(false)
      })
      .subscribe()

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void fetchAnalytics(false)
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      void supabase.removeChannel(channel)
    }
  }, [fetchAnalytics, range])

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading analytics...</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 size={20} className="text-primary" /> Business Snapshot</h2>
          <p className="text-xs text-muted-foreground mt-1">Live Supabase data / updated {formatRefreshTime(lastUpdated)}. Admin and account visits are not counted.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {(['today', '7d', '30d', 'all'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {r === 'today' ? 'Today' : r === 'all' ? 'All Time' : `Last ${r}`}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { void fetchAnalytics(false) }} disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:border-primary/40 disabled:opacity-60">
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Refresh
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
            <p>{loadError}</p>
          </div>
        </div>
      )}

      {data.capped && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-100">
          Analytics is reading the newest {ANALYTICS_MAX_ROWS.toLocaleString()} rows for this range. Shorten the range if you need exact visitor, funnel, product, or click breakdowns.
        </div>
      )}

      {/* Headline business numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={DollarSign} label="Revenue (paid)" value={`$${data.revenue.toFixed(2)}`} color="text-green-400" delay={0.05} />
        <StatCard icon={ShoppingCart} label="Orders" value={data.orders} color="text-green-400" delay={0.1} />
        <StatCard icon={Send} label="Leads (quotes)" value={data.leads} color="text-yellow-400" delay={0.15} />
        <StatCard icon={Target} label="Buy-intent clicks" value={data.ctaClicks} color="text-orange-400" delay={0.2} />
        <StatCard icon={Users} label="Visitors" value={data.visitors} color="text-blue-400" delay={0.25} />
      </div>

      {/* Conversion funnel */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-1 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Where customers go (and drop off)</h3>
        <p className="text-xs text-muted-foreground mb-4">How visitors move from browsing toward buying. Big drops show where sales are leaking.</p>
        {data.funnel[0]?.count === 0 ? <p className="text-sm text-muted-foreground">No visitor activity yet for this period.</p> : (
          <div className="space-y-3">
            {data.funnel.map((s, i) => {
              const prev = i > 0 ? data.funnel[i - 1].count : s.count
              const dropPct = prev > 0 ? Math.round(((prev - s.count) / prev) * 100) : 0
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{s.count}</span> ({s.pct}%)
                      {i > 0 && dropPct > 0 && <span className="text-red-400 ml-2">−{dropPct}%</span>}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(s.pct, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Eye size={16} className="text-primary" /> Most-viewed products</h3>
          {data.topProducts.length === 0 ? <p className="text-sm text-muted-foreground">No product views yet.</p> : (
            <div className="space-y-2">
              {data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <span className="text-sm truncate">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><MousePointer size={16} className="text-primary" /> Most-clicked buttons</h3>
          {data.topClicks.length === 0 ? <p className="text-sm text-muted-foreground">No clicks yet.</p> : (
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
      </div>
    </div>
  )
}

// ─── SEO Rankings Tab ────────────────────────────────────────────────────────

interface SeoRanking {
  id: string; query: string; city: string | null; device: string
  rank: number | null; ranking_url: string | null; local_pack: boolean
  serp_feature: string | null; source: string; notes: string | null; checked_at: string
}

interface GscRow { query: string; clicks: number; impressions: number; ctr: number; position: number; variants?: number }
interface GscResult { configured: boolean; error?: string; range?: { start: string; end: string }; rows?: GscRow[]; grouped?: GscRow[] }

function SeoTab() {
  const [rows, setRows] = useState<SeoRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [gsc, setGsc] = useState<GscResult | null>(null)

  const fetchRankings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('seo_rankings').select('*').order('checked_at', { ascending: false })
      setRows((data || []) as SeoRanking[])
    } catch { setRows([]) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchRankings() }, [fetchRankings])

  // Live Google Search Console data (only returns rows once GSC env vars are set).
  useEffect(() => {
    let active = true
    adminApiFetch('/api/seo/gsc')
      .then(async r => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data.error || 'Could not load Search Console data')
        return data
      })
      .then(d => { if (active) setGsc(d as GscResult) })
      .catch(error => {
        if (active) setGsc({ configured: true, error: error instanceof Error ? error.message : 'Could not load Search Console data' })
      })
    return () => { active = false }
  }, [])

  const keyOf = (r: SeoRanking) => `${r.query}|||${r.city || ''}|||${r.device}`

  // rows are newest-first: first non-baseline row per key = current; first baseline row = comparison.
  const latest = new Map<string, SeoRanking>()
  const baseline = new Map<string, SeoRanking>()
  for (const r of rows) {
    const k = keyOf(r)
    if (r.source === 'baseline') { if (!baseline.has(k)) baseline.set(k, r) }
    else if (!latest.has(k)) latest.set(k, r)
  }
  const allKeys = Array.from(new Set([...latest.keys(), ...baseline.keys()]))
  const rankSort = (n: number | null) => (n == null ? 9999 : n)
  const current = allKeys
    .map(k => latest.get(k) || baseline.get(k)!)
    .sort((a, b) => rankSort(a.rank) - rankSort(b.rank) || a.query.localeCompare(b.query))

  const top3 = current.filter(r => r.rank != null && r.rank <= 3).length
  const top10 = current.filter(r => r.rank != null && r.rank <= 10).length
  const notRanking = current.filter(r => r.rank == null).length
  const lastChecked = rows.find(r => r.source !== 'baseline')?.checked_at || rows[0]?.checked_at || null

  // change vs baseline: positive = moved up, NEW = newly ranking, DROP = fell out
  const changeFor = (r: SeoRanking): { kind: 'up' | 'down' | 'new' | 'drop' | 'flat'; val: number } | null => {
    const b = baseline.get(keyOf(r))
    if (!b || b.id === r.id) return null
    if (r.rank == null && b.rank == null) return { kind: 'flat', val: 0 }
    if (r.rank == null) return { kind: 'drop', val: 0 }
    if (b.rank == null) return { kind: 'new', val: 0 }
    const d = b.rank - r.rank
    if (d > 0) return { kind: 'up', val: d }
    if (d < 0) return { kind: 'down', val: -d }
    return { kind: 'flat', val: 0 }
  }

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading rankings...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><Search size={20} className="text-primary" /> Google Rankings</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Where the site ranks for target searches. Auto-updated weekly by the SEO monitor.
          {lastChecked && <> Last checked {new Date(lastChecked).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.</>}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Search} label="Tracked searches" value={current.length} delay={0.05} />
        <StatCard icon={Target} label="Ranking top 3" value={top3} color="text-green-400" delay={0.1} />
        <StatCard icon={TrendingUp} label="Ranking top 10" value={top10} color="text-blue-400" delay={0.15} />
        <StatCard icon={AlertCircle} label="Not ranking yet" value={notRanking} color="text-orange-400" delay={0.2} />
      </div>

      {current.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Search size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No rankings recorded yet. The weekly SEO monitor will populate this.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Search term</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Area</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Change</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Local pack</th>
                </tr>
              </thead>
              <tbody>
                {current.map(r => {
                  const change = changeFor(r)
                  return (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.query}</div>
                        {r.notes && <div className="text-xs text-muted-foreground mt-0.5 max-w-md">{r.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.city || 'General'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {r.rank == null
                          ? <span className="text-muted-foreground">Not top 20</span>
                          : <span className={`font-bold ${r.rank <= 3 ? 'text-green-400' : r.rank <= 10 ? 'text-blue-400' : 'text-foreground'}`}>#{r.rank}</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                        {!change ? <span className="text-muted-foreground">—</span>
                          : change.kind === 'up' ? <span className="text-green-400">▲ {change.val}</span>
                          : change.kind === 'down' ? <span className="text-red-400">▼ {change.val}</span>
                          : change.kind === 'new' ? <span className="text-green-400">NEW</span>
                          : change.kind === 'drop' ? <span className="text-red-400">Dropped</span>
                          : <span className="text-muted-foreground">No change</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.local_pack
                          ? <span className="px-2 py-0.5 rounded-lg text-xs bg-green-500/10 text-green-400 border border-green-500/20">Yes</span>
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Live Google Search Console */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-1 flex items-center gap-2"><Globe size={16} className="text-primary" /> Google Search Console (live)</h3>
        <p className="text-xs text-muted-foreground mb-4">Real clicks, impressions, and average position straight from Google — last 28 days. Different word orders of the same search are combined.</p>
        {(() => {
          const gscRows = gsc?.grouped ?? gsc?.rows ?? []
          if (!gsc) return <p className="text-sm text-muted-foreground">Loading…</p>
          if (!gsc.configured) return <p className="text-sm text-muted-foreground">Not connected yet. Once Google Search Console access is set up, real Google performance appears here automatically.</p>
          if (gsc.error) return <p className="text-sm text-red-400">Couldn't load Search Console data: {gsc.error}</p>
          if (gscRows.length === 0) return <p className="text-sm text-muted-foreground">Connected — no query data for the last 28 days yet.</p>
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Search query</th>
                    <th className="text-right px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Clicks</th>
                    <th className="text-right px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Impressions</th>
                    <th className="text-right px-3 py-2 text-xs font-bold uppercase text-muted-foreground">CTR</th>
                    <th className="text-right px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Avg position</th>
                  </tr>
                </thead>
                <tbody>
                  {gscRows.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2">
                        {r.query}
                        {r.variants && r.variants > 1 ? <span className="ml-2 text-xs text-muted-foreground">+{r.variants - 1} variant{r.variants > 2 ? 's' : ''}</span> : null}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-primary">{r.clicks}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{r.impressions}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{(r.ctr * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right font-medium">{r.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}
      </div>

      <p className="text-xs text-muted-foreground">
        Weekly-monitor change is measured against the 5/31 baseline. Google rank varies by searcher location and device — treat these as directional, not absolute.
      </p>
    </div>
  )
}

// ─── CRM / Referrals Tab ────────────────────────────────────────────────────

function CRMTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [referrals, setReferrals] = useState<CRMReferral[]>([])
  const [lastOrderByEmail, setLastOrderByEmail] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'customers' | 'referrals'>('customers')
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<CustomerTag | 'all'>('all')
  const [tags, setTags] = useState<Record<string, CustomerTag>>(getCustomerTags())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: custData }, { data: refData }, { data: orderData }] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('referrals').select('*, referrer:referrer_id(email, first_name), referred:referred_id(email, first_name)').order('created_at', { ascending: false }),
        supabase.from('orders').select('customer_email, created_at').order('created_at', { ascending: false }),
      ])
      if (custData) setCustomers(custData as Customer[])
      if (refData) setReferrals(refData as CRMReferral[])
      if (orderData) {
        // Most recent order per customer email (query is already newest-first).
        const map: Record<string, string> = {}
        for (const o of orderData as { customer_email: string | null; created_at: string }[]) {
          const email = o.customer_email?.toLowerCase()
          if (email && !map[email]) map[email] = o.created_at
        }
        setLastOrderByEmail(map)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

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
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Last Order</th>
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
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {lastOrderByEmail[c.email?.toLowerCase()]
                          ? new Date(lastOrderByEmail[c.email.toLowerCase()]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
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

// ─── Email List Tab ─────────────────────────────────────────────────────────

function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all')

  useEffect(() => { fetchSubscribers() }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscribers((data || []) as EmailSubscriber[])
    } catch {
      toast.error('Could not load email list')
      setSubscribers([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = subscribers.filter(sub => filter === 'all' || sub.status === filter)
  const activeCount = subscribers.filter(sub => sub.status === 'subscribed').length
  const quoteLeadCount = subscribers.filter(sub => (sub.tags || []).some(tag => tag.includes('quote') || tag.includes('estimate'))).length
  const sources = new Set(subscribers.map(sub => sub.source).filter(Boolean)).size

  const copyEmails = () => {
    const emails = filtered.map(sub => sub.email).join(', ')
    if (!emails) return
    navigator.clipboard.writeText(emails)
    toast.success('Subscriber emails copied')
  }

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading email list...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Mail} label="Total Subscribers" value={subscribers.length} delay={0.1} />
        <StatCard icon={CheckCircle} label="Subscribed" value={activeCount} color="text-green-400" delay={0.2} />
        <StatCard icon={Tag} label="Quote Leads" value={quoteLeadCount} color="text-yellow-400" delay={0.3} />
        <StatCard icon={MousePointer} label="Sources" value={sources} color="text-blue-400" delay={0.4} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'subscribed', 'unsubscribed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {f === 'all' ? `All (${subscribers.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${subscribers.filter(sub => sub.status === f).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={copyEmails}
          disabled={filtered.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground disabled:opacity-50"
        >
          <Copy size={14} /> Copy Emails
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Mail size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No email subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Subscriber</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <motion.tr key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{sub.name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{sub.email}</p>
                      {sub.phone ? <p className="text-xs text-muted-foreground">{sub.phone}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.service_interest || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-lg text-xs bg-muted/50 text-muted-foreground">{sub.source || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {(sub.tags || []).length > 0 ? sub.tags?.map(tag => (
                          <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{tag}</span>
                        )) : <span className="text-muted-foreground">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${sub.status === 'subscribed' ? 'text-green-400 bg-green-400/10' : 'text-muted-foreground bg-muted/50'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(sub.created_at || sub.consented_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Square Tab ──────────────────────────────────────────────────────────────

function SquareTab() {
  const [status, setStatus] = useState<SquareConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [sendingInvoice, setSendingInvoice] = useState(false)
  const [invoiceResult, setInvoiceResult] = useState<{ publicUrl?: string; invoiceNumber?: string; status?: string } | null>(null)
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    title: 'Custom print invoice',
    description: '',
    amount: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  })

  const authHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Admin session expired')
    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/square/status', { headers: await authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load Square status')
      setStatus(data as SquareConnectionStatus)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load Square status')
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const squareResult = params.get('square')
    if (squareResult === 'connected') toast.success('Square connected')
    if (squareResult === 'error') toast.error(`Square connection failed${params.get('message') ? `: ${params.get('message')}` : ''}`)
    if (squareResult) window.history.replaceState(null, '', '/admin')
    fetchStatus()
  }, [fetchStatus])

  const startConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/square/connect', { method: 'POST', headers: await authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start Square connection')
      window.location.href = data.authorizationUrl
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start Square connection')
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    if (!window.confirm('Disconnect Square from this admin portal?')) return
    setDisconnecting(true)
    try {
      const res = await fetch('/api/square/disconnect', { method: 'POST', headers: await authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not disconnect Square')
      toast.success('Square disconnected')
      await fetchStatus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not disconnect Square')
    } finally {
      setDisconnecting(false)
    }
  }

  const sendInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setInvoiceResult(null)
    setSendingInvoice(true)
    try {
      const res = await fetch('/api/square/create-invoice', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({
          ...invoiceForm,
          amount: Number(invoiceForm.amount),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create Square invoice')
      setInvoiceResult(data.invoice)
      toast.success('Square invoice sent')
      setInvoiceForm(prev => ({ ...prev, amount: '', description: '' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create Square invoice')
    } finally {
      setSendingInvoice(false)
    }
  }

  const connected = !!status?.connected
  const missing = status?.missing || []

  if (loading) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading Square...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={CreditCard} label="Square Status" value={connected ? 'Connected' : 'Not Connected'} color={connected ? 'text-green-400' : 'text-yellow-400'} delay={0.1} />
        <StatCard icon={MapPin} label="Location" value={status?.connection?.location_name || '-'} color="text-blue-400" delay={0.2} />
        <StatCard icon={Clock} label="Token" value={status?.connection?.token_expires_at ? 'Auto-refresh' : '-'} color="text-primary" delay={0.3} />
      </div>

      {missing.length > 0 && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-yellow-400" />
            <div>
              <h3 className="font-bold text-yellow-300">Square server setup is missing</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add these Vercel environment variables before Calvin connects Square:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missing.map(item => <code key={item} className="rounded bg-background px-2 py-1 text-xs text-foreground">{item}</code>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard size={20} className="text-primary" /> Square Connection</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Calvin connects his Square account once. Staff use TSS admin logins after that.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Callback URL:</span> <code className="break-all rounded bg-muted/50 px-2 py-1 text-xs text-foreground">{status?.redirectUri || 'https://tssprint.com/api/square/callback'}</code></p>
              {status?.connection?.merchant_id ? <p><span className="text-muted-foreground">Merchant:</span> {status.connection.merchant_id}</p> : null}
              {status?.connection?.connected_at ? <p><span className="text-muted-foreground">Connected:</span> {new Date(status.connection.connected_at).toLocaleString()}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {connected ? (
              <button onClick={disconnect} disabled={disconnecting} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50">
                {disconnecting ? <Loader2 size={16} className="animate-spin" /> : <Unplug size={16} />} Disconnect
              </button>
            ) : (
              <button onClick={startConnect} disabled={connecting || missing.length > 0} className="btn-primary text-sm disabled:opacity-50">
                {connecting ? <><Loader2 size={16} className="animate-spin" /> Opening Square...</> : <><CreditCard size={16} /> Connect Square</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={sendInvoice} className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Send size={20} className="text-primary" /> Send Square Invoice</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manual first version for custom quotes, deposits, and one-off jobs.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sq-name" className="block text-xs font-medium text-muted-foreground mb-1.5">Customer Name *</label>
              <input id="sq-name" value={invoiceForm.customerName} onChange={e => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div>
              <label htmlFor="sq-email" className="block text-xs font-medium text-muted-foreground mb-1.5">Email *</label>
              <input id="sq-email" type="email" value={invoiceForm.customerEmail} onChange={e => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div>
              <label htmlFor="sq-phone" className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
              <input id="sq-phone" value={invoiceForm.customerPhone} onChange={e => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label htmlFor="sq-amount" className="block text-xs font-medium text-muted-foreground mb-1.5">Amount *</label>
              <input id="sq-amount" type="number" min="1" step="0.01" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div>
              <label htmlFor="sq-title" className="block text-xs font-medium text-muted-foreground mb-1.5">Invoice Title *</label>
              <input id="sq-title" value={invoiceForm.title} onChange={e => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div>
              <label htmlFor="sq-due" className="block text-xs font-medium text-muted-foreground mb-1.5">Due Date</label>
              <input id="sq-due" type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div>
            <label htmlFor="sq-description" className="block text-xs font-medium text-muted-foreground mb-1.5">Description / Job Notes</label>
            <textarea id="sq-description" rows={4} value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <button type="submit" disabled={!connected || sendingInvoice || missing.length > 0} className="btn-primary text-sm disabled:opacity-50">
            {sendingInvoice ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Create & Send Invoice</>}
          </button>
          {invoiceResult && (
            <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-sm">
              <p className="font-bold text-green-300">Invoice sent{invoiceResult.invoiceNumber ? `: ${invoiceResult.invoiceNumber}` : ''}</p>
              {invoiceResult.publicUrl ? <a href={invoiceResult.publicUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-primary hover:underline">Open Square invoice <ExternalLink size={13} /></a> : null}
            </div>
          )}
        </form>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-3">Team Login Model</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Calvin', 'Owner: Square connection, pricing, users'],
              ['DeeDee', 'Store lead: invoices, leads, daily operations'],
              ['Arman', 'Outreach: follow-ups, marketing, lead queue'],
              ['JP', 'Technical admin: site, integrations, automations'],
            ].map(([name, role]) => (
              <div key={name} className="rounded-xl bg-muted/30 p-3">
                <p className="font-bold">{name}</p>
                <p className="text-muted-foreground">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Work Log Tab ─────────────────────────────────────────────────────────────
// A plain-language record of every build session on the site so the owner can
// see exactly what's been done from launch to now. Reconstructed from the build
// history. Read-only — to add an entry, prepend it to WORK_LOG below.

type WorkLogEntry = { date: string; cat: string; title: string; detail: string; items: string[] }

const WORK_LOG_CATS: Record<string, string> = {
  Launch:    'bg-primary/10 text-primary border-primary/20',
  Design:    'bg-purple-400/10 text-purple-400 border-purple-400/20',
  Store:     'bg-blue-400/10 text-blue-400 border-blue-400/20',
  Backend:   'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Mobile:    'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  Pricing:   'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  Imagery:   'bg-pink-400/10 text-pink-400 border-pink-400/20',
  Content:   'bg-orange-400/10 text-orange-400 border-orange-400/20',
  Forms:     'bg-teal-400/10 text-teal-400 border-teal-400/20',
  SEO:       'bg-green-400/10 text-green-400 border-green-400/20',
  Analytics: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Admin:     'bg-primary/10 text-primary border-primary/20',
  Fixes:     'bg-slate-400/10 text-slate-400 border-slate-400/20',
}

const WORK_LOG: WorkLogEntry[] = [
  { date: '2026-06-16', cat: 'Admin', title: 'Cart tracking + this Work Log', detail: 'Fixed cart tracking so every cart is captured, added cross-device cart restore, and built this Work Log so you can see everything that’s been done.', items: [
    'Fixed cart tracking so every cart is captured — removed the email step that was blocking it',
    'Added cross-device cart restore — a customer’s cart follows them when they sign in by email',
    'Removed the leftover email-capture popup from the cart',
    'Connected the weekly Google-ranking check into the SEO tab',
    'Built this Work Log',
  ] },
  { date: '2026-06-15', cat: 'Admin', title: 'Owner dashboard + artwork uploads', detail: 'Big owner-tools day — artwork uploads on orders, a plain-English business snapshot, and a live SEO rankings view.', items: [
    'Customers can now upload artwork with their order — you download the files straight from the order',
    'Rebuilt Analytics into a plain-English business snapshot: revenue, orders, leads, top products, buy-intent clicks',
    'Added an SEO Rankings tab showing where you rank for target keywords',
    'Set up an automatic weekly Google-ranking check (runs every Monday) that feeds that tab',
    'Added a "Last Order" column to the CRM',
    'Did a Hayward local-SEO pass across the service pages',
    'Connected Google Search Console for live search data',
    'Replaced the remaining AI images with real photos of your work',
    'Fixed deploy issues so image updates ship reliably',
  ] },
  { date: '2026-06-12', cat: 'Analytics', title: 'Search indexing + sales tracking', detail: 'Released the search-indexing updates and set up full analytics so we can see what brings people in and what they buy.', items: [
    'Released the search-indexing updates',
    'Set up Google Analytics (GA4) with checkout tracking',
    'Added search attribution — see which Google searches bring people in',
  ] },
  { date: '2026-05-24', cat: 'SEO', title: 'Google Business match', detail: 'Matched the site to your Google Business Profile and fixed a deploy bug.', items: [
    'Matched the site’s business name, address and phone exactly to your Google Business Profile (Google rewards consistency)',
    'Fixed a deploy bug that could blank the page',
  ] },
  { date: '2026-05-23', cat: 'SEO', title: 'Local SEO foundation', detail: 'Laid the search-engine foundation — pre-rendering, local-business data, and 8 East Bay city pages.', items: [
    'Pre-rendered every page so Google reads the full content, not an empty shell',
    'Added local-business structured data (helps you show in local results)',
    'Built 8 East Bay city pages (Hayward and nearby) to rank in those areas',
    'Verified the site in Google Search Console',
  ] },
  { date: '2026-05-22', cat: 'SEO', title: 'Per-page SEO + store polish', detail: 'Per-page search titles, deep-linked homepage tiles, and a rebuilt printer intro.', items: [
    'Gave every page its own search title and description',
    'Deep-linked the homepage category tiles straight into the price configurator',
    'Rebuilt the printer intro animation with a status sequence and crop marks',
    'Synced the product mockups with the order widget and fixed add-on pricing',
    'Inverted the favicon to black so it shows on Google’s white background',
    'Moved the logo marquee above the project gallery',
  ] },
  { date: '2026-05-18', cat: 'Forms', title: 'File uploads on forms', detail: 'Added artwork upload to the contact forms with reliable delivery.', items: [
    'Added a file-upload field to the contact forms so customers can send artwork',
    'Made email delivery reliable whether or not a file is attached',
  ] },
  { date: '2026-05-16', cat: 'Forms', title: 'Contact form going live', detail: 'Wired the contact form to send you real emails.', items: [
    'Wired the contact form to send you real emails when someone reaches out',
  ] },
  { date: '2026-05-15', cat: 'Content', title: 'Real client work showcase', detail: 'Swapped stock for real client work, with project pop-ups and video.', items: [
    'Added click-to-open project pop-ups',
    'Pulled real client work in from Instagram',
    'Added hero and services videos',
    'Swapped stock images for real client jobs, including the Cleopatra Ink wall poster',
  ] },
  { date: '2026-05-10', cat: 'Store', title: 'Audit + flow polish (via Codex)', detail: 'A full site audit and polish pass run through Codex — tightened the homepage flow, printer intro, pricing, and previews.', items: [
    'Ran a full audit of the live site and listed what to fix',
    'Improved the homepage flow',
    'Made the printer intro smoother and lower-friction',
    'Fixed the product price tiers',
    'Sharpened the product mockup previews',
  ] },
  { date: '2026-04-25', cat: 'Imagery', title: 'Realistic product mockups', detail: 'Built cleaner, more realistic product mockup shapes.', items: [
    'Built realistic mockup shapes — die-cut stickers, jars, pouches, and card stacks',
  ] },
  { date: '2026-04-24', cat: 'Imagery', title: 'Real studio photography', detail: 'Replaced dark/AI photos with clean, bright studio shots across the whole site.', items: [
    'Replaced the dark/AI sticker photos with clean, bright studio shots',
    'Replaced 22 moody mockup backgrounds with bright daylit surfaces',
    'Restored the "PRESS PRINT" intro gate and unified the dark hero across pages',
    'Added clean product mockups built in code (stay sharp at any size)',
    'Added the real phone number to Contact and the footer',
    'Swapped the About hero to a real photo of the storefront',
  ] },
  { date: '2026-04-23', cat: 'Fixes', title: 'Mobile + projects cleanup', detail: 'Mobile audit fixes and merged case studies into Projects.', items: [
    'Mobile audit fixes across the site',
    'Merged the case studies into the Projects page so it’s all in one place',
  ] },
  { date: '2026-04-22', cat: 'Store', title: 'Major storefront build', detail: 'The biggest build day — the printer intro, quote tools, mockup previews, case studies, and the first-order discount.', items: [
    'Added service-card photography for all 6 services',
    'Built the cinematic printer intro animation — CMYK droplets, crop marks, sound',
    'Reworked the mobile hero to show stickers above the fold',
    'Trimmed the homepage from 11 sections to 9 and merged promo + referral',
    'Added per-service quote forms with live estimates',
    'Added a bulk-quote tool, a square-foot calculator, and save-as-quote',
    'Added artwork mockup previews on every product page',
    'Shipped customer case studies — Safeway, Bhogal, Atlas Pizza',
    'Added an automatic first-order discount and an exit-intent offer',
    'Set sticker minimum quantities and tuned pricing on resold items',
  ] },
  { date: '2026-04-21', cat: 'Pricing', title: 'Pricing overhaul + About page', detail: 'Overhauled sticker pricing and rebuilt the About page with real projects.', items: [
    'Overhauled sticker pricing — proper size tiers, healthier margins, flatter volume curve',
    'Corrected the material pricing (paper, embossed, UV)',
    'Rebuilt the About page with full content and added 7 projects to the gallery',
    'Replaced product images with original artwork as true transparent PNGs',
    'Updated the hero to "Bay Area’s Full-Service Print & Branding Studio"',
    'Renamed Event Canopies to Event Displays and fixed page routing + the promo banner timing',
  ] },
  { date: '2026-03-11', cat: 'Mobile', title: 'Mobile + referral tiers', detail: 'Optimized the whole site for phones and added referral commission tiers.', items: [
    'Optimized the whole site for phones — responsive text, faster-loading images, carousel and footer fixes',
    'Added referral commission tiers — 5% standard, 10% partner',
  ] },
  { date: '2026-03-10', cat: 'Backend', title: 'Accounts, CRM & referrals', detail: 'Connected the backend and added customer accounts, the referral system, CRM, reviews, and order emails.', items: [
    'Connected the database backend with proper validation and error handling',
    'Added customer accounts — login, order history, personal referral dashboard',
    'Built the referral and rewards system with promo codes',
    'Added CRM customer tagging — Admin / VIP / Customer',
    'Added a Google Reviews carousel',
    'Added the FAQ section',
    'Added order email notifications',
    'Added a sticky promo-code banner and a homepage promo section',
  ] },
  { date: '2026-03-03', cat: 'Store', title: 'Admin, checkout & catalog', detail: 'Built the admin dashboard, checkout, pricing config, and the full product catalog with a smart calculator.', items: [
    'Built the admin dashboard',
    'Built the checkout flow',
    'Built the pricing configuration, organized by category with tabs',
    'Added the full product catalog across every service page',
    'Added a smart price calculator with size tiers and add-ons',
    'Added a product search bar and category filter buttons',
    'Redesigned the Order Stickers page with a 4-column layout',
  ] },
  { date: '2026-02-25', cat: 'Design', title: 'Service pages & branding', detail: 'Built out the dedicated service pages and the blue brand identity across the site.', items: [
    'Built the dedicated service pages (stickers, mylar, business print, vehicle graphics, window film, signage)',
    'Refined the hero wording and gave the title more space',
    'Added the blue brand frame and page banners across the site',
    'Made the phone number required on the contact form',
    'Renamed the project gallery to "More Than Stickers"',
  ] },
  { date: '2026-02-22', cat: 'Launch', title: 'Project kickoff', detail: 'First build of the Sticker Smith website.', items: [
    'First build of the Sticker Smith website',
    'Homepage with hero photography',
    'Category cards with product images',
    'Project gallery',
    'Sample-pack call-to-action',
  ] },
]

function WorkLogTab() {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const toggle = (i: number) => setOpen(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })
  const days = new Set(WORK_LOG.map(e => e.date)).size
  const months = new Set(WORK_LOG.map(e => e.date.slice(0, 7))).size
  const first = WORK_LOG[WORK_LOG.length - 1]?.date
  const last = WORK_LOG[0]?.date
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtShort = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const stats = [
    { label: 'Build sessions', value: days, icon: History },
    { label: 'Months active', value: months, icon: Clock },
    { label: 'Updates shipped', value: WORK_LOG.length, icon: CheckCircle },
    { label: 'First build', value: first ? fmtShort(first) : '—', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-2xl font-black mb-1">Work Log</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Everything that’s been built and improved on the Sticker Smith site, from launch to now
          {first && last ? ` (${fmt(first)} – ${fmt(last)})` : ''}. Newest first.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2"><s.icon size={16} /><span className="text-xs font-medium">{s.label}</span></div>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {WORK_LOG.map((e, i) => {
          const isOpen = open.has(i)
          return (
            <motion.div
              key={e.date + i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="border-b border-border/50 last:border-b-0"
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-24 shrink-0 pt-0.5">
                  <p className="text-sm font-semibold">{fmtShort(e.date)}</p>
                  <p className="text-xs text-muted-foreground">{e.date.slice(0, 4)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${WORK_LOG_CATS[e.cat] || 'bg-muted/50 text-muted-foreground border-border'}`}>{e.cat}</span>
                    <p className="font-bold">{e.title}</p>
                    <span className="text-[10px] text-muted-foreground">· {e.items.length} {e.items.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{e.detail}</p>
                </div>
                <ChevronDown size={18} className={`shrink-0 mt-0.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-4 pl-[7.75rem] space-y-1.5 overflow-hidden"
                >
                  {e.items.map((it, j) => (
                    <li key={j} className="flex gap-2 text-sm text-foreground/90 leading-relaxed">
                      <CheckCircle size={14} className="shrink-0 mt-1 text-primary/70" />
                      <span>{it}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </motion.div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">Tap any day to see the full breakdown. Maintained by JP — always current.</p>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const mainTabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'inquiries', label: 'Inquiries', icon: Send },
  { id: 'worklog', label: 'Work Log', icon: History },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'promos', label: 'Promos', icon: Tag },
  { id: 'carts', label: 'Carts', icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'subscribers', label: 'Email List', icon: Mail },
  { id: 'square', label: 'Square', icon: CreditCard },
  { id: 'referrals', label: 'Referrals', icon: Share2 },
] as const

type MainTab = (typeof mainTabs)[number]['id']

function getInitialAdminTab(): MainTab {
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  if (mainTabs.some(item => item.id === tab)) return tab as MainTab
  return params.has('square') ? 'square' : 'orders'
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<MainTab>(getInitialAdminTab)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('tss-admin-theme') as 'dark' | 'light') || 'dark'
  )
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('tss-admin-theme', next)
      return next
    })
  }

  const changeTab = (tab: MainTab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url.toString())
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <section className={`py-8 md:py-16 min-h-screen ${theme === 'light' ? 'admin-light' : ''}`}>
      <div className="section-container max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black">
            Admin Dashboard
          </motion.h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button onClick={logout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Sign out">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-8 scrollbar-hide" role="tablist" aria-label="Admin sections">
          {mainTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => changeTab(tab.id)} role="tab" aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}>
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'inquiries' && <InquiriesTab />}
        {activeTab === 'worklog' && <WorkLogTab />}
        {activeTab === 'pricing' && <PricingTab />}
        {activeTab === 'promos' && <PromoCodeManager />}
        {activeTab === 'carts' && <CartsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'seo' && <SeoTab />}
        {activeTab === 'crm' && <CRMTab />}
        {activeTab === 'subscribers' && <SubscribersTab />}
        {activeTab === 'square' && <SquareTab />}
        {activeTab === 'referrals' && <ReferralsTab />}
      </div>
    </section>
  )
}

// ─── Referrals Tab ──────────────────────────────────────────────────────────

function ReferralsTab() {
  const [referrers, setReferrers] = useState<Referrer[]>(() => getReferrers())
  const [logs] = useState(getReferralLog)
  const [view, setView] = useState<'referrers' | 'conversions'>('referrers')

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

  // Once confirmed as an admin, flag this browser as staff so the owner's own
  // browsing is excluded from the customer-facing analytics.
  useEffect(() => { if (authed) markStaffDevice() }, [authed])

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
