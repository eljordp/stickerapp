import { motion } from 'framer-motion'
import { Car, CheckCircle, Clock, Shield, Wrench, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'

const features = [
  'Full Vehicle Wraps',
  'Partial Wraps & Accents',
  'Fleet Branding & Graphics',
  'Door & Spot Graphics',
  'Perforated Window Graphics',
  'Vinyl Lettering & Decals',
]

const specs = [
  { icon: Shield, label: 'Material', value: 'Premium 3M & Avery cast vinyl' },
  { icon: Clock, label: 'Turnaround', value: '5-10 business days (design + print + install)' },
  { icon: Wrench, label: 'Installation', value: 'Professional install included (Bay Area)' },
  { icon: Zap, label: 'Durability', value: '5-7 year outdoor rating with laminate' },
]

const process = [
  { step: '1', title: 'Consultation', desc: 'Tell us about your vehicle, branding goals, and budget. We\'ll recommend the right solution.' },
  { step: '2', title: 'Design & Proof', desc: 'Our team creates a digital mockup on your exact vehicle model. Revisions until you love it.' },
  { step: '3', title: 'Production', desc: 'Printed on premium vinyl with protective laminate. Quality checked before install.' },
  { step: '4', title: 'Installation', desc: 'Professional installation at our Bay Area shop. Most wraps completed in 1-2 days.' },
]

export default function VehicleGraphics() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <Car className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Vehicle Graphics</h1>
          <p className="text-white/80 text-lg">Full wraps, partial wraps, fleet branding, and custom decals.</p>
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

          <ProductOrder categoryNames={['Decals & Lettering', 'Full Wraps', 'Partial Wraps']} />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <EstimateForm
            service="Vehicle Graphics"
            title="Get a Custom Vehicle Wrap Estimate"
            subtitle="Every vehicle is different. Tell us the details and we'll send a tailored estimate with turnaround in 24 hours."
            fields={[
              { name: 'vehicle', label: 'Vehicle (year, make, model)', type: 'text', required: true, placeholder: '2023 Ford Transit 250' },
              {
                name: 'wrapType',
                label: 'Wrap type',
                type: 'select',
                required: true,
                options: ['Full Wrap', 'Partial Wrap (half, quarter)', 'Decals / Lettering / Door Graphics', 'Fleet (multiple vehicles)', 'Not sure yet'],
              },
              {
                name: 'timeline',
                label: 'Timeline',
                type: 'select',
                options: ['ASAP / Within 2 weeks', '2–4 weeks', '1–2 months', 'Flexible'],
              },
              { name: 'inspiration', label: 'Reference links (Dropbox, Google Drive, Instagram)', type: 'text', placeholder: 'Paste a link' },
            ]}
          />
        </div>
      </section>
    </>
  )
}
