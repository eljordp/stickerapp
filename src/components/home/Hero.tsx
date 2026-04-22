import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, MapPin, Shield } from 'lucide-react'

import heroPrinter from '@/assets/hero-printer.jpg'


export default function Hero() {
  return (
    <section className="relative min-h-[92vh] lg:min-h-[90vh] flex items-center overflow-hidden pt-6 pb-10 lg:py-0">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.02 }} />

      {/* Content */}
      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-12 items-center">
          {/* Printer hero visual — shows above text on mobile, right side on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative w-full aspect-square max-w-[300px] sm:max-w-sm lg:max-w-md mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-primary/10">
                <img
                  src={heroPrinter}
                  alt="Large-format printer mid-job"
                  className="w-full h-full object-cover"
                />
                {/* Subtle cyan rim glow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
              </div>
              {/* Ambient glow behind */}
              <div className="absolute inset-0 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/10 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Text */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-[2.25rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight">
              <span className="text-gradient">Bay Area's</span>
              <br />
              Full-Service Print & Branding Studio
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 md:mb-8">
              Custom stickers, labels, packaging, signage, and vehicle graphics.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 mb-8 max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              <Link to="/stickers" className="btn-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4">Order Stickers<ArrowRight size={20} /></Link>
              <Link to="/contact" className="btn-secondary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4">Start My Project</Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 border border-border rounded-full px-3 py-1.5 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                <Clock size={14} className="text-primary" />24hr Proof
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-border rounded-full px-3 py-1.5 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                <MapPin size={14} className="text-primary" />Free Shipping
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-border rounded-full px-3 py-1.5 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                <Shield size={14} className="text-primary" />Quality Guaranteed
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
