import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Car, Building2, Tent, Printer, Film, Package, Star, Clock, FileCheck, MapPin, Shield, Zap, CheckCircle, Heart } from 'lucide-react'
import aboutCraft from '@/assets/pages/about-craft.jpg'
import aboutShop from '@/assets/pages/about-shop-real.jpg'
import svcVehicle from '@/assets/services/vehicle-graphics.jpg'
import svcSignage from '@/assets/services/business-signage.jpg'
import svcEvent from '@/assets/services/event-displays.jpg'
import svcPrint from '@/assets/services/business-print.jpg'
import svcFilm from '@/assets/services/window-film.jpg'
import svcMylar from '@/assets/services/mylar-packaging.jpg'

const services = [
  { icon: Car, title: 'Vehicle Graphics', description: 'Full and partial wraps, fleet branding, door and spot graphics.', image: svcVehicle, href: '/services/vehicle-graphics' },
  { icon: Building2, title: 'Business Signage', description: 'Storefront signs, wall graphics, A-frames, retractable banners.', image: svcSignage, href: '/services/business-signage' },
  { icon: Tent, title: 'Event Displays', description: 'Custom tents, feather flags, table covers, retractable banners.', image: svcEvent, href: '/services/event-displays' },
  { icon: Printer, title: 'Business Print', description: 'Business cards, flyers, brochures, and marketing collateral.', image: svcPrint, href: '/services/business-print' },
  { icon: Film, title: 'Window Film', description: 'Frosted film, solar film, security film, decorative graphics.', image: svcFilm, href: '/services/window-film' },
  { icon: Package, title: 'Custom Packaging', description: 'Branded mylar bags, labels, stickers, and product packaging.', image: svcMylar, href: '/mylar' },
]

const stats = [
  { value: '500+', label: 'Projects Completed', icon: CheckCircle },
  { value: '5.0', label: 'Google Rating', icon: Star },
  { value: '24hr', label: 'Digital Proofs', icon: Clock },
  { value: 'Bay Area', label: 'Local Business', icon: MapPin },
]

const values = [
  { icon: Shield, title: 'Premium Materials', description: '3M and Avery cast vinyl on stickers and wraps. 16pt cardstock on cards. SunTek and LLumar on tint. We don\'t cut corners on substrate.' },
  { icon: Zap, title: '3–5 Day Standard, 24hr Proof', description: 'Most jobs ship in 3–5 business days. Every order gets a free digital proof in 24 hours so you approve the file before we print.' },
  { icon: FileCheck, title: 'Trusted by Real Brands', description: 'Safeway, Albertsons, WHCI, and dozens of Bay Area businesses run their print and fleet branding through us. The list keeps growing.' },
  { icon: Heart, title: 'Bay Area, Hands-On', description: 'Local pickup, face-to-face consultations, real accountability. We install most jobs ourselves. You\'re not getting passed off to a call center.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

export default function About() {
  return (
    <>
      {/* Hero Banner — with shop photo backdrop */}
      <div className="relative -mt-16 md:-mt-18 pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutShop} alt="The Sticker Smith print shop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-background" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center section-container z-10">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">About The Sticker Smith</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Made in the Bay Area.</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">A print and branding studio built on craft, speed, and relationships.</p>
        </motion.div>
      </div>

      {/* Our Story — side-by-side photo */}
      <section className="py-12 md:py-20">
        <div className="section-container">
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-center max-w-6xl mx-auto">
            <motion.div {...fadeUp} className="relative order-1 md:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/5]">
                <img src={aboutCraft} alt="Hands working at a large-format printer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
              </div>
              <div className="absolute -inset-4 -z-10 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
            <motion.div {...fadeUp} className="order-2 md:order-2">
              <h2 className="text-3xl md:text-5xl font-black mb-8">Our Story</h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  The Sticker Smith started with a simple idea: Bay Area businesses and creators deserve better print. Not the overpriced, slow-turnaround, take-it-or-leave-it experience you get from big box shops. Real print work, done right, from people who actually care about the finished product.
                </p>
                <p>
                  We built our reputation one job at a time — wrapping vans for local fleets, printing stickers for independent brands, producing signage for storefronts across the East Bay. Every project taught us something new, and every client pushed us to get better.
                </p>
                <p>
                  Today we work with everyone from solo creators ordering their first 100 stickers to companies like Safeway and Albertsons running full fleet graphics programs. The scale changes, but the approach never does.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black">What We Do</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  to={service.href}
                  className="group block bg-background border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 h-full"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 md:py-16 border-y border-border/50 bg-card/30">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-black mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black">Why Choose Us</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to Start?</h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Tell us about your project and get a free quote. No commitments, no pressure — just honest pricing and a plan to make it happen.
            </p>
            <Link to="/contact" className="btn-primary">
              Get a Free Quote <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
