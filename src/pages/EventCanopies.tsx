import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Tent, CheckCircle } from 'lucide-react'

const features = [
  'Custom Printed Canopy Tents',
  'Feather & Teardrop Flags',
  'Retractable Banner Stands',
  'Table Covers & Throws',
  'Backdrop Displays',
  'Pop-Up Event Kits',
]

const benefits = [
  { title: 'Stand Out at Events', description: 'Eye-catching displays that draw crowds to your booth at markets, fairs, and trade shows.' },
  { title: 'Easy Setup & Portable', description: 'Lightweight, collapsible designs that set up in minutes and fit in your car.' },
  { title: 'Durable & Reusable', description: 'Heavy-duty frames and fade-resistant prints built to withstand outdoor conditions.' },
]

export default function EventCanopies() {
  return (
    <section className="py-8 md:py-16">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Tent className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Event Canopies & Displays</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Custom tents, feather flags, table covers, retractable banners, and everything you need to dominate your next event.
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
