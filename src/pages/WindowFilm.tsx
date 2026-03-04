import { motion } from 'framer-motion'
import { Film, CheckCircle } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'

const features = [
  'Frosted Privacy Film',
  'Solar & Heat Rejection Film',
  'Security & Safety Film',
  'Decorative Window Graphics',
  'Custom Cut Logos & Lettering',
  'Anti-Graffiti Film',
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-12">
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

          <ProductOrder categoryNames={['Frosted & Decorative', 'Solar & UV Protection', 'Security Film']} />
        </div>
      </section>
    </>
  )
}
