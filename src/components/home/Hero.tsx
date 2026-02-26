import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, MapPin, Shield } from 'lucide-react'

import stickerGroup from '@/assets/stickers/sticker-group.png'
import stickerPack from '@/assets/stickers/sticker-pack.png'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Content */}
      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          {/* Left: Text */}
          <div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              The Sticker Smith
              <br />
              <span className="text-gradient">The Bay's Trusted</span>
              <br />
              Print & Branding
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
              Serving Bay Area businesses with custom stickers, labels, packaging, signage, and vehicle graphics.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/order" className="btn-primary text-lg px-10 py-4">Order Stickers<ArrowRight size={20} /></Link>
              <Link to="/contact" className="btn-secondary text-lg px-10 py-4">Start My Project</Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">
                <Clock size={16} className="text-primary" />24hr Proof Turnaround
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">
                <MapPin size={16} className="text-primary" />Free Shipping Available
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">
                <Shield size={16} className="text-primary" />Quality Guaranteed
              </div>
            </motion.div>
          </div>

          {/* Right: Sticker showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Main sticker group - centered */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <img src={stickerGroup} alt="Custom sticker collection" className="w-full h-auto drop-shadow-2xl" />
              </motion.div>

              {/* Sticker pack accent */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-4 -left-8 w-[40%] z-30"
              >
                <img src={stickerPack} alt="Sticker pack" className="w-full h-auto drop-shadow-xl" />
              </motion.div>

              {/* Decorative glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
