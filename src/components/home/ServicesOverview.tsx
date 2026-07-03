import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import vehicleGraphics from '@/assets/optimized/services/vehicle-graphics-800.webp'
import eventDisplays from '@/assets/optimized/services/event-displays-800.webp'
import businessPrint from '@/assets/optimized/services/business-print-800.webp'
import businessSignage from '@/assets/optimized/services/business-signage-800.webp'
import windowFilm from '@/assets/optimized/services/window-film-800.webp'
import mylarPackaging from '@/assets/optimized/services/mylar-packaging-800.webp'

const services = [
  { image: vehicleGraphics, title: 'Bay Area Vehicle Graphics', description: 'Wraps, fleet branding & door graphics', href: '/services/vehicle-graphics#quote' },
  { image: eventDisplays, title: 'Custom Canopies & Banners', description: 'Tents, flags, banners & event displays', href: '/services/event-displays#shop' },
  { image: businessPrint, title: 'Business Print Materials', description: 'Cards, flyers & marketing materials', href: '/services/business-print#shop' },
  { image: businessSignage, title: 'Business Signs & Signage', description: 'Storefront signs, wall graphics & A-frames', href: '/services/business-signage#shop' },
  { image: windowFilm, title: 'Window Film & Graphics', description: 'Frosted, solar, security & decorative film', href: '/services/window-film#quote' },
  { image: mylarPackaging, title: 'Custom Mylar Packaging', description: 'Branded packaging bags & labels', href: '/mylar#configure' },
]

export default function ServicesOverview() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Beyond Stickers</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Everything you need branded.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Wraps, signage, packaging, print, window film. One studio, every surface — built for Bay Area brands.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {services.map((service, index) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}>
              <Link to={service.href} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={service.image} alt={service.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                </div>
                <div className="p-4 md:p-5 text-center">
                  <h3 className="font-bold text-sm md:text-base mb-1">{service.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">{service.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/services" className="btn-primary">View All Services<ArrowRight size={18} /></Link>
          <Link to="/projects" className="btn-secondary">See Our Work</Link>
        </motion.div>
      </div>
    </section>
  )
}
