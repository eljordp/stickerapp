import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Gift, Share2, Copy, Check, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'
import { registerReferrer, findReferrerByEmail, getReferralShareUrl, type Referrer } from '@/lib/referralRewards'

export default function Referral() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [referrer, setReferrer] = useState<Referrer | null>(null)
  const [copied, setCopied] = useState(false)
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupResult, setLookupResult] = useState<Referrer | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [tab, setTab] = useState<'signup' | 'dashboard'>('signup')

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    const ref = registerReferrer(name, email, phone)
    setReferrer(ref)
  }

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupEmail.trim()) return
    const found = findReferrerByEmail(lookupEmail)
    if (found) {
      setLookupResult(found)
      setLookupError('')
    } else {
      setLookupResult(null)
      setLookupError('No referral account found with that email. Sign up above!')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { icon: Users, title: 'Sign Up', desc: 'Register with your name & email to get your unique referral code' },
    { icon: Share2, title: 'Share Your Code', desc: 'Send your code or link to friends, family, or anyone you know' },
    { icon: Gift, title: 'They Save', desc: 'When they use your code at checkout, they get 10% off their order' },
    { icon: DollarSign, title: 'You Earn', desc: 'You earn 5% commission on every order placed with your code' },
  ]

  const activeReferrer = referrer || lookupResult

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-5xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
            <Gift size={16} /> Referral Program
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Share & Earn
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get your own unique code. When someone uses it to place an order, <strong className="text-foreground">they save 10%</strong> and <strong className="text-foreground">you earn 5% commission</strong> on the sale.
          </p>
        </motion.div>

        {/* How It Works */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon size={24} className="text-primary" />
              </div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Step {i + 1}</div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Active referrer dashboard (shown after sign-up or lookup) */}
        {activeReferrer ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-16">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border p-8 text-center">
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Your Referral Code</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl md:text-5xl font-black tracking-widest">{activeReferrer.code}</span>
                  <button
                    onClick={() => handleCopy(activeReferrer.code)}
                    className="p-3 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
                <p className="text-muted-foreground mb-6">Share this code — anyone who uses it gets 10% off!</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => handleCopy(getReferralShareUrl(activeReferrer.code))}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Share2 size={16} /> Copy Share Link
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 break-all">{getReferralShareUrl(activeReferrer.code)}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-primary">{activeReferrer.clicks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Link Clicks</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-green-400">{activeReferrer.conversions}</p>
                  <p className="text-xs text-muted-foreground mt-1">Orders Made</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-yellow-400">${activeReferrer.totalEarned.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Commission Earned</p>
                </div>
              </div>

              {/* Reward codes */}
              {activeReferrer.rewardCodes.length > 0 && (
                <div className="border-t border-border p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><Gift size={16} className="text-primary" /> Your Reward Codes</h3>
                  <div className="space-y-2">
                    {activeReferrer.rewardCodes.map(rc => (
                      <div key={rc} className="flex items-center justify-between bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                        <code className="font-bold tracking-wider">{rc}</code>
                        <button onClick={() => handleCopy(rc)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Use these codes at checkout (min $25 order)</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Sign Up / Lookup tabs */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <div className="max-w-lg mx-auto">
              <div className="flex gap-1 mb-6">
                {(['signup', 'dashboard'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {t === 'signup' ? 'Join the Program' : 'Check My Stats'}
                  </button>
                ))}
              </div>

              {tab === 'signup' ? (
                <form onSubmit={handleSignUp} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone <span className="text-xs opacity-60">(optional)</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4">
                    Get My Referral Code <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-muted-foreground text-center">Your code will be generated instantly. Start sharing right away.</p>
                </form>
              ) : (
                <form onSubmit={handleLookup} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <p className="text-muted-foreground text-sm">Already signed up? Enter your email to see your code and stats.</p>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Your Email</label>
                    <input
                      type="email"
                      value={lookupEmail}
                      onChange={e => { setLookupEmail(e.target.value); setLookupError('') }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <TrendingUp size={16} /> View My Dashboard
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-black mb-2">No Limit on Earnings</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            You earn 5% commission on every order placed with your code. The more you share, the more you earn. No cap, no limits.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
