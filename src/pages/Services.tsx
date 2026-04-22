import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import vehicleGraphics from '@/assets/services/vehicle-graphics.jpg'
import eventDisplays from '@/assets/services/event-displays.jpg'
import businessPrint from '@/assets/services/business-print.jpg'
import businessSignage from '@/assets/services/business-signage.jpg'
import windowFilm from '@/assets/services/window-film.jpg'
import mylarPackaging from '@/assets/services/mylar-packaging.jpg'

const services = [
  { image: vehicleGraphics, title: 'Vehicle Graphics', description: 'Full wraps, partial wraps, fleet branding, and door/spot graphics.', href: '/services/vehicle-graphics' },
  { image: eventDisplays, title: 'Event Displays', description: 'Custom tents, feather flags, table covers, retractable banners.', href: '/services/event-displays' },
  { image: businessPrint, title: 'Business Print', description: 'Business cards, flyers, brochures, marketing collateral.', href: '/services/business-print' },
  { image: businessSignage, title: 'Business Signage', description: 'Storefront signs, wall graphics, A-frames, retractable banners.', href: '/services/business-signage' },
  { image: windowFilm, title: 'Window Film & Tint', description: 'Frosted film, solar film, security film, decorative graphics.', href: '/services/window-film' },
  { image: mylarPackaging, title: 'Mylar Packaging', description: 'Custom branded mylar bags for products, edibles, and retail.', href: '/mylar' },
]

export default function Services() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Our Services</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">Full-service print and branding for Bay Area businesses</p>
        </motion.div>
      </div>
      <section className="py-8 md:py-16">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Link to={service.href} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={service.image} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <div className="flex items-center gap-1 text-primary text-sm font-bold group-hover:gap-2 transition-all">Learn More<ArrowRight size={14} /></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
