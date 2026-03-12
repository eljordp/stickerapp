import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  User, Package, Share2, Settings, LogOut, Loader2, Eye, EyeOff,
  Copy, Check, Gift, ExternalLink, ArrowRight, TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  registerReferrer, findReferrerByEmail, getReferralShareUrl,
  type Referrer,
} from '@/lib/referralRewards'
import { toast } from 'sonner'

// ─── Auth Forms ─────────────────────────────────────────────────────────────

function AuthForms() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const res = await signIn(email, password)
      if (res.error) setError(res.error)
      else toast.success('Welcome back!')
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
      const res = await signUp(email, password, name, phone)
      if (res.error) setError(res.error)
      else {
        setRegistered(true)
        toast.success('Account created!')
      }
    }
    setLoading(false)
  }

  if (registered) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-black mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it to activate your account, then come back and log in.
            </p>
            <button onClick={() => { setRegistered(false); setMode('login') }} className="btn-primary">
              Back to Login
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-black mb-6 text-center">
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </h1>

          <div className="flex gap-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:text-foreground'}`}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="John Doe" required autoComplete="name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone <span className="text-xs opacity-60">(optional)</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="(555) 123-4567" autoComplete="tel" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="you@email.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> {mode === 'login' ? 'Logging in...' : 'Creating account...'}</> : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === 'login'
              ? <>Don&apos;t have an account? <button onClick={() => setMode('register')} className="text-primary font-bold">Sign up</button></>
              : <>Already have an account? <button onClick={() => setMode('login')} className="text-primary font-bold">Log in</button></>
            }
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function AccountDashboard() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<'orders' | 'referral' | 'profile'>('orders')
  const [orders, setOrders] = useState<Array<{ id: string; date: string; total: string; status: string; items: Array<{ name: string; quantity: number }> }>>([])
  const [referrer, setReferrer] = useState<Referrer | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(true)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer'
  const userEmail = user?.email || ''
  const userPhone = user?.user_metadata?.phone || ''

  useEffect(() => {
    // Load orders from Supabase
    const loadOrders = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, created_at, total, status, items, customer_email')
          .eq('customer_email', userEmail)
          .order('created_at', { ascending: false })
        if (data) {
          setOrders(data.map(o => ({
            id: o.id,
            date: o.created_at,
            total: (o.total || 0).toFixed(2),
            status: o.status || 'completed',
            items: (o.items as Array<{ name: string; quantity: number }>) || [],
          })))
        }
      } catch { /* fallback to localStorage */ }

      // Also check localStorage orders
      try {
        const local = JSON.parse(localStorage.getItem('tss-orders') || '[]')
        const myOrders = local.filter((o: { customer?: { email?: string } }) =>
          o.customer?.email?.toLowerCase() === userEmail.toLowerCase()
        )
        if (myOrders.length > 0) {
          setOrders(prev => {
            const ids = new Set(prev.map(o => o.id))
            const newOnes = myOrders
              .filter((o: { id: string }) => !ids.has(o.id))
              .map((o: { id: string; date: string; total: string; status: string; items: Array<{ name: string; quantity: number }> }) => ({
                id: o.id, date: o.date, total: o.total, status: o.status, items: o.items || [],
              }))
            return [...prev, ...newOnes]
          })
        }
      } catch { /* silent */ }

      setLoadingOrders(false)
    }
    loadOrders()

    // Load referrer
    const ref = findReferrerByEmail(userEmail)
    setReferrer(ref ?? null)
  }, [userEmail])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const handleJoinReferral = () => {
    const ref = registerReferrer(userName, userEmail, userPhone)
    setReferrer(ref)
    toast.success('Referral code created!')
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
  }

  const tabs = [
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'referral' as const, label: 'Referral', icon: Share2 },
    { id: 'profile' as const, label: 'Profile', icon: Settings },
  ]

  return (
    <section className="py-8 md:py-16">
      <div className="section-container max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-black">My Account</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {userName}</p>
          </motion.div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingOrders ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">Place your first order and it'll show up here.</p>
                <Link to="/order" className="btn-primary inline-flex items-center gap-2">
                  Order Stickers <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="mt-3 space-y-1">
                          {order.items.slice(0, 3).map((item, j) => (
                            <p key={j} className="text-sm text-muted-foreground">{item.name} x{item.quantity}</p>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary">${order.total}</p>
                        <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          order.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                          order.status === 'processing' ? 'bg-blue-400/10 text-blue-400' :
                          'bg-yellow-400/10 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Referral Tab */}
        {tab === 'referral' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {referrer ? (
              <div className="space-y-6">
                {/* Code + Share */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border p-8 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Your Referral Code</p>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-4xl font-black tracking-widest">{referrer.code}</span>
                      <button onClick={() => handleCopy(referrer.code)}
                        className="p-3 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors">
                        {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                      </button>
                    </div>
                    <p className="text-muted-foreground mb-1">Anyone who uses this code gets 10% off their order</p>
                    <p className="text-sm font-semibold text-primary mb-4">You earn {referrer.tier === 'partner' ? '10%' : '5%'} of every sale{referrer.tier === 'partner' ? ' (Partner)' : ''}</p>
                    <button onClick={() => handleCopy(getReferralShareUrl(referrer.code))}
                      className="btn-primary inline-flex items-center gap-2">
                      <ExternalLink size={16} /> Copy Share Link
                    </button>
                    <p className="text-xs text-muted-foreground mt-3 break-all">{getReferralShareUrl(referrer.code)}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 divide-x divide-border">
                    <div className="p-6 text-center">
                      <p className="text-3xl font-black text-primary">{referrer.clicks}</p>
                      <p className="text-xs text-muted-foreground mt-1">Link Clicks</p>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-3xl font-black text-green-400">{referrer.conversions}</p>
                      <p className="text-xs text-muted-foreground mt-1">Orders Made</p>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-3xl font-black text-yellow-400">${referrer.totalEarned.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Commission Earned</p>
                    </div>
                  </div>
                </div>

                {/* Reward codes */}
                {referrer.rewardCodes.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><Gift size={16} className="text-primary" /> Your Reward Codes</h3>
                    <div className="space-y-2">
                      {referrer.rewardCodes.map(rc => (
                        <div key={rc} className="flex items-center justify-between bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                          <code className="font-bold tracking-wider">{rc}</code>
                          <button onClick={() => handleCopy(rc)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Use at checkout for $10 off (min $25 order)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Share2 size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Join the Referral Program</h3>
                <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                  Get your personal code. When friends use it, they save 10% and you earn $10 off your next order.
                </p>
                <button onClick={handleJoinReferral} className="btn-primary mt-4 inline-flex items-center gap-2">
                  <TrendingUp size={16} /> Get My Referral Code
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <ProfileTab
            user={user!}
            userName={userName}
            userEmail={userEmail}
            userPhone={userPhone}
            orderCount={orders.length}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </section>
  )
}

// ─── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab({ user, userName, userEmail, userPhone, orderCount, onSignOut }: {
  user: { created_at?: string }
  userName: string
  userEmail: string
  userPhone: string
  orderCount: number
  onSignOut: () => void
}) {
  const [editName, setEditName] = useState(userName)
  const [editPhone, setEditPhone] = useState(userPhone)
  const [editEmail, setEditEmail] = useState(userEmail)
  const [saving, setSaving] = useState(false)

  const hasChanges = editName !== userName || editPhone !== userPhone || editEmail !== userEmail

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update auth metadata (name + phone)
      const updates: { data?: { full_name?: string; phone?: string }; email?: string } = {
        data: {},
      }
      if (editName !== userName) updates.data!.full_name = editName.trim()
      if (editPhone !== userPhone) updates.data!.phone = editPhone.trim()

      if (updates.data && Object.keys(updates.data).length > 0) {
        await supabase.auth.updateUser(updates)
      }

      // Email change requires confirmation — Supabase sends a verification email
      if (editEmail !== userEmail) {
        const { error } = await supabase.auth.updateUser({ email: editEmail.trim() })
        if (error) {
          toast.error(error.message)
          setSaving(false)
          return
        }
        toast.success('Confirmation email sent to ' + editEmail.trim())
      } else {
        toast.success('Profile updated')
      }


    } catch {
      toast.error('Failed to update profile')
    }
    setSaving(false)
  }

  const inputClass = 'w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{userName}</h3>
            <p className="text-muted-foreground text-sm">{userEmail}</p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={e => { setEditName(e.target.value)}}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={e => { setEditEmail(e.target.value)}}
              className={inputClass}
              placeholder="you@email.com"
            />
            {editEmail !== userEmail && (
              <p className="text-xs text-yellow-400 mt-1">A confirmation email will be sent to verify the new address.</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
            <input
              type="tel"
              value={editPhone}
              onChange={e => { setEditPhone(e.target.value)}}
              className={inputClass}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Save button */}
        {hasChanges && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </motion.div>
        )}

        {/* Read-only info */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
            <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</p>
          </div>
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Orders</p>
            <p className="font-medium">{orderCount}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button onClick={onSignOut} className="text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2">
            <LogOut size={14} /> Sign out of your account
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Entry ──────────────────────────────────────────────────────────────────

export default function Account() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <section className="py-16 md:py-24 text-center">
        <Loader2 size={32} className="mx-auto text-primary animate-spin" />
      </section>
    )
  }

  return user ? <AccountDashboard /> : <AuthForms />
}
