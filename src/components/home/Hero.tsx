import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'

import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import plu2o from '@/assets/projects/plu2o-dispensary.jpg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'
import curated from '@/assets/projects/curated-barbershop.jpeg'

const heroImages = [eventBooth, plu2o, elevated, curated]

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image collage */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-1 opacity-[0.15]">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: i * 0.2 }}
              className="relative overflow-hidden"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
      </div>

      {/* Content */}
      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 out of 5 · Bay Area's Trusted Print Shop</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl md:text-7xl lg:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
              The Sticker Smith<br /><span className="text-gradient">The Bay's Trusted</span><br />Print & Branding
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
              Serving Bay Area businesses with custom stickers, labels, packaging, signage, and vehicle graphics.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/order" className="btn-primary text-lg px-10 py-4">Order Stickers<ArrowRight size={20} /></Link>
              <Link to="/contact" className="btn-secondary text-lg px-10 py-4">Start My Project</Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" />24hr Proof Turnaround</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" />Free Shipping Available</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" />Quality Guaranteed</div>
            </motion.div>
          </div>

          {/* Right: Image showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main large image */}
              <div className="absolute top-0 right-0 w-[75%] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-border shadow-2xl z-20">
                <img src={eventBooth} alt="Custom stickers at event booth" className="w-full h-full object-cover" />
              </div>
              {/* Secondary image */}
              <div className="absolute bottom-4 left-0 w-[55%] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-border shadow-2xl z-30">
                <img src={plu2o} alt="Custom dispensary branding" className="w-full h-full object-cover" />
              </div>
              {/* Small accent image */}
              <div className="absolute top-8 left-8 w-[35%] aspect-square rounded-xl overflow-hidden border-2 border-border shadow-xl z-10">
                <img src={curated} alt="Barbershop signage" className="w-full h-full object-cover" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/15 rounded-full blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
