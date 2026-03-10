import { motion } from 'framer-motion'
import { Film, CheckCircle, Clock, Shield, Wrench, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'

const features = [
  'Frosted Privacy Film',
  'Solar & Heat Rejection Film',
  'Security & Safety Film',
  'Decorative Window Graphics',
  'Custom Cut Logos & Lettering',
  'Anti-Graffiti Film',
  'Automotive Window Tint',
]

const specs = [
  { icon: Shield, label: 'Materials', value: '3M, LLumar, SunTek premium films' },
  { icon: Clock, label: 'Turnaround', value: '1-3 days for auto tint, 3-7 for commercial' },
  { icon: Wrench, label: 'Installation', value: 'Professional install included (Bay Area)' },
  { icon: Zap, label: 'Benefits', value: 'UV blocking, heat reduction, privacy, security' },
]

const process = [
  { step: '1', title: 'Consult', desc: 'Tell us about your space or vehicle. We\'ll recommend the right film for your needs — privacy, heat, security, or style.' },
  { step: '2', title: 'Quote & Schedule', desc: 'Get a transparent quote based on window count and film type. We\'ll schedule your install at a convenient time.' },
  { step: '3', title: 'Install', desc: 'Our certified installers apply the film with precision. Clean, bubble-free results guaranteed.' },
  { step: '4', title: 'Warranty', desc: 'All installations come with manufacturer warranty. Residential, commercial, and automotive.' },
]

export default function WindowFilm() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <Film className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Window Film & Tint</h1>
          <p className="text-white/80 text-lg">Frosted film, solar film, security film, and decorative graphics.</p>
        </motion.div>
      </div>
      <section className="py-8 md:py-16">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-black mb-6">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {specs.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-12">
            <h2 className="text-2xl font-black mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map(p => (
                <div key={p.step}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black mb-3">{p.step}</div>
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <ProductOrder categoryNames={['Frosted & Decorative', 'Solar & UV Protection', 'Security Film', 'Automotive Window Tint']} />
        </div>
      </section>
    </>
  )
}
