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
  { image: vehicleGraphics, title: 'Vehicle Graphics', description: 'Wraps, fleet branding & door graphics', href: '/services/vehicle-graphics' },
  { image: eventDisplays, title: 'Event Displays', description: 'Tents, flags, banners & displays', href: '/services/event-displays' },
  { image: businessPrint, title: 'Business Print', description: 'Cards, flyers & marketing materials', href: '/services/business-print' },
  { image: businessSignage, title: 'Business Signage', description: 'Storefront, wall graphics & A-frames', href: '/services/business-signage' },
  { image: windowFilm, title: 'Window Film', description: 'Frosted, solar, security & graphics', href: '/services/window-film' },
  { image: mylarPackaging, title: 'Mylar Packaging', description: 'Custom branded packaging bags', href: '/mylar' },
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
                  <img src={service.image} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
