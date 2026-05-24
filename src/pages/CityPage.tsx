import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Truck, Clock, CheckCircle, Sticker, Car, Building2, Tent, Printer, Film, Package } from 'lucide-react'
import { cityBySlug, type CityConfig } from '@/lib/cities'

const services = [
  { icon: Sticker, title: 'Custom Stickers', description: 'Die-cut, kiss-cut, sheet, holographic, vinyl labels.', href: '/stickers' },
  { icon: Car, title: 'Vehicle Graphics', description: 'Full wraps, partial wraps, fleet branding, door decals.', href: '/services/vehicle-graphics' },
  { icon: Building2, title: 'Business Signage', description: 'Storefront signs, wall graphics, A-frames, window vinyl.', href: '/services/business-signage' },
  { icon: Tent, title: 'Event Displays', description: 'Tents, feather flags, banners, table covers, retractables.', href: '/services/event-displays' },
  { icon: Printer, title: 'Business Print', description: 'Cards, flyers, brochures, marketing collateral.', href: '/services/business-print' },
  { icon: Film, title: 'Window Film', description: 'Privacy, frosted, security, solar, decorative graphics.', href: '/services/window-film' },
  { icon: Package, title: 'Mylar Packaging', description: 'Custom branded mylar bags and product packaging.', href: '/mylar' },
]

function injectCitySchema(city: CityConfig) {
  const id = `schema-city-${city.slug}`
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Custom printing, stickers, signage, vehicle graphics, packaging',
    provider: {
      '@type': 'LocalBusiness',
      name: 'The Sticker Smith',
      telephone: '+1-510-634-8203',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hayward',
        addressRegion: 'CA',
        postalCode: '94545',
        addressCountry: 'US',
      },
      url: 'https://tssprint.com',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'AdministrativeArea', name: 'San Francisco Bay Area' },
    },
    url: `https://tssprint.com/${city.slug}`,
    name: `Custom Stickers, Signage & Print in ${city.name}, CA`,
    description: city.metaDescription,
  })
  document.head.appendChild(script)
}

function CityPageInner({ city }: { city: CityConfig }) {
  useEffect(() => {
    injectCitySchema(city)
    return () => {
      const el = document.getElementById(`schema-city-${city.slug}`)
      if (el) el.remove()
    }
  }, [city])

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 md:-mt-18 pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-neutral-950 border-b border-border/50">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-pink-500/[0.06] blur-3xl pointer-events-none" />
        <div className="section-container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-primary">
                {city.name} · {city.region}
                {city.distanceMiles > 0 && ` · ${city.distanceMiles} mi from our shop`}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight leading-[1.05] text-white">
              Custom stickers, signage & print in {city.name}.
            </h1>
            <p className="text-base md:text-lg text-neutral-300 max-w-2xl mb-7">{city.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">Get a {city.name} Quote <ArrowRight size={16} /></Link>
              <Link to="/stickers" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors text-sm font-semibold">Order Stickers</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why us here */}
      <section className="py-12 md:py-20">
        <div className="section-container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-start">
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Local Coverage</p>
              <h2 className="text-3xl md:text-4xl font-black mb-5">Why {city.name} businesses work with us</h2>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{city.whyHere}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-foreground">Neighborhoods we serve</h3>
              <ul className="space-y-2">
                {city.neighborhoods.map((n) => (
                  <li key={n} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Common projects */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">What we make here</p>
            <h2 className="text-3xl md:text-4xl font-black">Common {city.name} projects</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {city.commonProjects.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 bg-background border border-border rounded-xl p-5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm md:text-base text-foreground leading-relaxed">{p}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery */}
      <section className="py-12 md:py-16">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-[auto_1fr] gap-6 items-start bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2">Delivery & pickup for {city.name}</h3>
              <p className="text-muted-foreground leading-relaxed">{city.delivery}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Full Service</p>
            <h2 className="text-3xl md:text-4xl font-black">Everything we print for {city.name}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={s.href} className="group block bg-background border border-border rounded-2xl p-6 hover:border-primary/40 transition-all h-full">
                  <s.icon className="w-7 h-7 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{s.description}</p>
                  <div className="flex items-center gap-1 text-primary text-sm font-bold group-hover:gap-2 transition-all">Learn more <ArrowRight size={14} /></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20">
        <div className="section-container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Common Questions</p>
            <h2 className="text-3xl md:text-4xl font-black">{city.name} FAQ</h2>
          </motion.div>
          <div className="space-y-4">
            {city.faqs.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="font-bold text-base md:text-lg mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
            <Clock className="w-10 h-10 text-primary mx-auto mb-5" />
            <h2 className="text-3xl md:text-5xl font-black mb-6">Start your {city.name} project</h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
              Tell us what you need. Free quote, free digital proof, and an honest answer on how fast we can get it done.
            </p>
            <Link to="/contact" className="btn-primary">Get a Free Quote <ArrowRight size={18} /></Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default function CityPage({ slug }: { slug: string }) {
  const city = cityBySlug[slug]
  if (!city) return <Navigate to="/" replace />
  return <CityPageInner city={city} />
}
