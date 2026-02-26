import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Car, Tent, Printer, Store, Film, Package } from 'lucide-react'

const services = [
  { icon: Car, title: 'Vehicle Graphics', description: 'Wraps, fleet branding & door graphics', href: '/services/vehicle-graphics' },
  { icon: Tent, title: 'Event Canopies', description: 'Tents, flags, banners & displays', href: '/services/event-canopies' },
  { icon: Printer, title: 'Business Print', description: 'Cards, flyers & marketing materials', href: '/services/business-print' },
  { icon: Store, title: 'Business Signage', description: 'Storefront, wall graphics & A-frames', href: '/services/business-signage' },
  { icon: Film, title: 'Window Film', description: 'Frosted, solar, security & graphics', href: '/services/window-film' },
  { icon: Package, title: 'Mylar Packaging', description: 'Custom branded packaging bags', href: '/services/mylar-packaging' },
]

export default function ServicesOverview() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4">More Than Just Stickers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Full-service print and branding for Bay Area businesses</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {services.map((service, index) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}>
              <Link to={service.href} className="group block bg-card border border-border rounded-2xl p-5 md:p-6 text-center hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{service.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{service.description}</p>
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
