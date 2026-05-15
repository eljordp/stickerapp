import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, MapPin, Shield } from 'lucide-react'
import FirstOrderChip from '@/components/FirstOrderChip'

import heroPrinter from '@/assets/hero-printer.jpg'

const HERO_VIDEO = '/videos/flight-risk-holographic.mp4'
const HERO_POSTER = '/videos/flight-risk-holographic.jpg'


export default function Hero() {
  return (
    <section className="relative overflow-hidden py-5 sm:py-10 lg:min-h-[78vh] lg:flex lg:items-center lg:py-12">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.02 }} />

      {/* Content */}
      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-6 lg:gap-12 items-center">
          {/* Printer hero visual — shows above text on mobile, right side on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative w-full aspect-square max-w-[230px] sm:max-w-sm lg:max-w-md mx-auto">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl border border-white/10 ring-1 ring-primary/10">
                <video
                  src={HERO_VIDEO}
                  poster={HERO_POSTER}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Holographic stickers fresh off the printer"
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <img src={heroPrinter} alt="Large-format printer mid-job" className="w-full h-full object-cover" />
                </video>
                {/* Subtle cyan rim glow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
              </div>
              {/* Ambient glow behind */}
              <div className="absolute inset-0 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/10 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Text */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <div className="mb-3 sm:mb-4 flex justify-center lg:justify-start">
              <FirstOrderChip />
            </div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-[2rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-6 tracking-tight">
              <span className="text-gradient">Bay Area's</span>{' '}
              <br />
              Full-Service Print & Branding Studio
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-5 md:mb-8">
              Custom stickers, labels, packaging, signage, and vehicle graphics.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-8 max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              <Link to="/stickers" className="btn-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4">Make Stickers<ArrowRight size={20} /></Link>
              <Link to="/contact" className="btn-secondary hidden sm:inline-flex text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4">Get a Quote</Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 border border-border rounded-full px-3 py-1.5 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                <Clock size={14} className="text-primary" />24hr Proof
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-border rounded-full px-3 py-1.5 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                <MapPin size={14} className="text-primary" />Bay Area Pickup
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
