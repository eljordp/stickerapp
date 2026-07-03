import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import PageHero from '@/components/PageHero'
import vehicleGraphics from '@/assets/optimized/services/vehicle-graphics-800.webp'
import eventDisplays from '@/assets/optimized/services/event-displays-800.webp'
import businessPrint from '@/assets/optimized/services/business-print-800.webp'
import businessSignage from '@/assets/optimized/services/business-signage-800.webp'
import windowFilm from '@/assets/optimized/services/window-film-800.webp'
import mylarPackaging from '@/assets/optimized/services/mylar-packaging-800.webp'

const SHOP_VIDEO = '/videos/epic-rane-print.mp4'
const SHOP_POSTER = '/videos/epic-rane-print.jpg'

const services = [
  { image: vehicleGraphics, title: 'Bay Area Vehicle Graphics', description: 'Full wraps, partial wraps, fleet branding, and door/spot graphics.', href: '/services/vehicle-graphics#quote' },
  { image: eventDisplays, title: 'Custom Canopy Tents & Banners', description: 'Printed tents, feather flags, table covers, retractable banners, and booth displays.', href: '/services/event-displays#shop' },
  { image: businessPrint, title: 'Business Print Materials', description: 'Business cards, flyers, brochures, postcards, and marketing collateral.', href: '/services/business-print#shop' },
  { image: businessSignage, title: 'Hayward Business Signs & Signage', description: 'Storefront signs, wall graphics, A-frames, banners, and window graphics.', href: '/services/business-signage#shop' },
  { image: windowFilm, title: 'Window Film & Graphics', description: 'Frosted film, solar film, security film, decorative graphics.', href: '/services/window-film#quote' },
  { image: mylarPackaging, title: 'Custom Mylar Packaging', description: 'Custom branded mylar bags, product labels, and retail packaging.', href: '/mylar#configure' },
]

export default function Services() {
  const [playShopVideo, setPlayShopVideo] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isPrerender = Boolean((window as unknown as { __prerender?: boolean }).__prerender)
    const update = () => setPlayShopVideo(!isPrerender && desktop.matches && !reducedMotion.matches)

    update()
    desktop.addEventListener('change', update)
    reducedMotion.addEventListener('change', update)

    return () => {
      desktop.removeEventListener('change', update)
      reducedMotion.removeEventListener('change', update)
    }
  }, [])

  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Full-service print & branding"
        subtitle="Stickers, wraps, signage, packaging, print, window film. One studio, every surface — built for Bay Area brands."
        primaryCta={{ label: 'Get a Quote', href: '/contact' }}
        secondaryCta={{ label: 'See Our Work', href: '/projects' }}
      />

      {/* Print process b-roll */}
      <section className="py-6 md:py-10 border-b border-border/40">
        <div className="section-container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-center"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-xl">
              {playShopVideo ? (
                <video
                  src={SHOP_VIDEO}
                  poster={SHOP_POSTER}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Large-format printer running custom stickers"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={SHOP_POSTER}
                  alt="Large-format printer running custom stickers"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">In The Shop</p>
              <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3">Printed in-house. No middleman.</h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Every order runs through our own large-format printer and cutter — we own the process from proof to peel. That's how we hold deadlines, match colors, and ship clean every time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Link to={service.href} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={service.image} alt={service.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
