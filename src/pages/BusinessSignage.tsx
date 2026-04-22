import { motion } from 'framer-motion'
import { Store, CheckCircle, Clock, Shield, Wrench, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'

const features = [
  'Storefront & Building Signs',
  'Wall Graphics & Murals',
  'A-Frame Sidewalk Signs',
  'Retractable Banners',
  'Acrylic & Metal Signs',
  'LED & Illuminated Signs',
]

const specs = [
  { icon: Shield, label: 'Materials', value: 'Vinyl, acrylic, aluminum, PVC, coroplast' },
  { icon: Clock, label: 'Turnaround', value: '3-7 business days depending on type' },
  { icon: Wrench, label: 'Installation', value: 'Professional install available (Bay Area)' },
  { icon: Zap, label: 'Durability', value: '3-10 years depending on material' },
]

const process = [
  { step: '1', title: 'Measure & Plan', desc: 'Share your space dimensions, photos, and branding. We\'ll recommend the best signage solution.' },
  { step: '2', title: 'Design & Proof', desc: 'We create a digital mockup showing how your sign will look in your actual space.' },
  { step: '3', title: 'Production', desc: 'Cut, printed, and finished with premium materials. Quality inspected before delivery.' },
  { step: '4', title: 'Install or Ship', desc: 'Bay Area: we install it for you. Nationwide: shipped flat or rolled, ready to mount.' },
]

export default function BusinessSignage() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <Store className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Business Signage</h1>
          <p className="text-white/80 text-lg">Storefront signs, wall graphics, A-frames, banners, and more.</p>
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

          <ProductOrder categoryNames={['Storefront Graphics', 'A-Frame Signs', 'Retractable Banners', 'Wall Graphics']} />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <EstimateForm
            service="Business Signage"
            title="Get a Custom Signage Estimate"
            subtitle="Storefront, wall, window — tell us the scope and we'll send a tailored estimate in 24 hours."
            fields={[
              {
                name: 'signageType',
                label: 'Signage type',
                type: 'select',
                required: true,
                options: ['Storefront / Exterior', 'Wall Graphics / Mural', 'Window Graphics', 'A-Frame / Sidewalk Sign', 'Retractable Banner', 'Multiple / Not sure'],
              },
              { name: 'size', label: 'Approximate size (sq ft or dimensions)', type: 'text', placeholder: "e.g. 8'x4'  or  ~30 sq ft" },
              { name: 'location', label: 'Install location / city', type: 'text', placeholder: 'San Leandro, CA' },
              {
                name: 'install',
                label: 'Do you need us to install it?',
                type: 'select',
                options: ["Yes — need professional install", "No — just print, I'll install", 'Not sure'],
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
