import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Film, CheckCircle } from 'lucide-react'

const features = [
  'Frosted Privacy Film',
  'Solar & Heat Rejection Film',
  'Security & Safety Film',
  'Decorative Window Graphics',
  'Custom Cut Logos & Lettering',
  'Anti-Graffiti Film',
]

const benefits = [
  { title: 'Privacy & Style', description: 'Frosted and decorative films give your space a polished, professional look while keeping interiors private.' },
  { title: 'Energy Savings', description: 'Solar films block heat and UV rays, reducing energy costs and protecting furnishings.' },
  { title: 'Safety & Security', description: 'Security films hold shattered glass in place, protecting your property and people.' },
]

export default function WindowFilm() {
  return (
    <section className="py-8 md:py-16">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Film className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Window Film & Tint</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Frosted film, solar film, security film, and decorative graphics for storefronts and offices.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
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

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.08 }} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Get a Free Quote <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
