import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import weddingDisplay from '@/assets/projects/wedding-display-signage-1.jpeg'

export default function SamplePackCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={weddingDisplay}
              alt="Custom event signage"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>

          {/* Content */}
          <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-16">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Not sure where to start?</p>
              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Get a Free Quote
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md">
                Tell us about your project and we'll send you a custom quote within 24 hours. Every order includes a free digital proof — you approve before we produce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                  Request a Quote
                  <ArrowRight size={20} />
                </Link>
              </div>

              {/* Material tags */}
              <div className="flex flex-wrap gap-2 mt-8">
                {['Matte', 'Glossy', 'Clear', 'Holographic', 'Paper', 'Embossed'].map((mat) => (
                  <span
                    key={mat}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground"
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
