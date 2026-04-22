import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function SamplePackCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card"
        >
          {/* Solid backdrop with subtle accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative p-8 md:p-16 text-center max-w-3xl mx-auto">
            <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Not sure where to start?</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Get a Free Quote
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Tell us about your project and we'll send you a custom quote within 24 hours. Every order includes a free digital proof — you approve before we produce.
            </p>
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">
              Request a Quote
              <ArrowRight size={20} />
            </Link>

            {/* Material tags */}
            <div className="flex flex-wrap gap-2 mt-8 justify-center">
              {['Matte', 'Glossy', 'Clear', 'Holographic', 'Paper', 'Embossed'].map((mat) => (
                <span
                  key={mat}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-background/60 border border-border text-muted-foreground"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
