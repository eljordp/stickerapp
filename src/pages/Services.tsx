import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Car, Tent, Printer, Store, Film, Package, Sticker } from 'lucide-react'

const services = [
  { icon: Sticker, title: 'Custom Stickers', description: 'Die-cut, kiss-cut, clear, holographic, and vinyl stickers.', href: '/order' },
  { icon: Car, title: 'Vehicle Graphics', description: 'Full wraps, partial wraps, fleet branding, and door/spot graphics.', href: '/services/vehicle-graphics' },
  { icon: Tent, title: 'Event Canopies & Displays', description: 'Custom tents, feather flags, table covers, retractable banners.', href: '/services/event-canopies' },
  { icon: Printer, title: 'Business Print', description: 'Business cards, flyers, brochures, marketing collateral.', href: '/services/business-print' },
  { icon: Store, title: 'Business Signage', description: 'Storefront signs, wall graphics, A-frames, retractable banners.', href: '/services/business-signage' },
  { icon: Film, title: 'Window Film & Tint', description: 'Frosted film, solar film, security film, decorative graphics.', href: '/services/window-film' },
  { icon: Package, title: 'Mylar Packaging', description: 'Custom branded mylar bags for products, edibles, and retail.', href: '/services/mylar-packaging' },
]

export default function Services() {
  return (
    <section className="py-8 md:py-16">
      <div className="section-container">
        <div className="border-2 border-primary/40 rounded-3xl p-6 md:p-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4">Our Services</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Full-service print and branding for Bay Area businesses</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Link to={service.href} className="group block bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <div className="flex items-center gap-1 text-primary text-sm font-bold group-hover:gap-2 transition-all">Learn More<ArrowRight size={14} /></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
