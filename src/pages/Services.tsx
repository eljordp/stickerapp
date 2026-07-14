import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, MessageSquare, ShoppingCart } from 'lucide-react'

import PageHero from '@/components/PageHero'
import stickerGroup from '@/assets/optimized/stickers/sticker-group-512.webp'
import vehicleGraphics from '@/assets/optimized/services/vehicle-graphics-800.webp'
import eventDisplays from '@/assets/optimized/services/event-displays-800.webp'
import businessPrint from '@/assets/optimized/services/business-print-800.webp'
import businessSignage from '@/assets/optimized/services/business-signage-800.webp'
import windowFilm from '@/assets/optimized/services/window-film-800.webp'
import mylarPackaging from '@/assets/optimized/services/mylar-packaging-800.webp'

const SHOP_VIDEO = '/videos/epic-rane-print.mp4'
const SHOP_POSTER = '/videos/epic-rane-print.jpg'

const services = [
  {
    image: stickerGroup,
    title: 'Custom Stickers & Labels',
    description: 'Die-cut stickers, sticker sheets, roll labels, holographic stickers, and product labels.',
    href: '/stickers#configure',
    action: 'Configure online',
    price: 'from 50 pcs',
    intent: 'Buy online',
    bullets: ['Proof before print', 'Upload artwork', 'Local pickup or shipping'],
  },
  {
    image: businessPrint,
    title: 'Business Print Materials',
    description: 'Business cards, flyers, postcards, door hangers, and vehicle magnets.',
    href: '/services/business-print#shop',
    action: 'Shop print',
    price: 'priced online',
    intent: 'Buy online',
    bullets: ['Print-ready files', 'Bulk quote option', 'Premium stocks'],
  },
  {
    image: businessSignage,
    title: 'Business Signs & Signage',
    description: 'Storefront graphics, A-frames, wall graphics, banners, and window graphics.',
    href: '/services/business-signage#shop',
    action: 'Shop signs',
    price: 'order or quote',
    intent: 'Buy or inquire',
    bullets: ['Standard products online', 'Install quoted', 'Proofed before production'],
  },
  {
    image: eventDisplays,
    title: 'Canopies, Banners & Event Displays',
    description: 'Printed tents, feather flags, table covers, retractable banners, and booth displays.',
    href: '/services/event-displays#shop',
    action: 'Shop displays',
    price: 'date-based',
    intent: 'Buy or inquire',
    bullets: ['Event-date planning', 'Hardware options', 'Booth kits'],
  },
  {
    image: mylarPackaging,
    title: 'Custom Mylar Packaging',
    description: 'Branded mylar bags, pouch packaging, jar labels, and product launch packaging.',
    href: '/mylar#configure',
    action: 'Price packaging',
    price: 'instant estimate',
    intent: 'Buy or bulk quote',
    bullets: ['Upload artwork', 'Bulk runs', 'Labels or full bags'],
  },
  {
    image: vehicleGraphics,
    title: 'Vehicle Graphics',
    description: 'Full wraps, partial wraps, fleet branding, door graphics, decals, and vinyl lettering.',
    href: '/services/vehicle-graphics#quote',
    action: 'Request quote',
    price: 'quote required',
    intent: 'Inquire first',
    bullets: ['Vehicle details needed', 'Photos help pricing', 'Install planning'],
  },
  {
    image: windowFilm,
    title: 'Window Film & Glass Graphics',
    description: 'Frosted privacy film, solar film, security film, storefront graphics, and auto tint.',
    href: '/services/window-film#quote',
    action: 'Request quote',
    price: 'quote required',
    intent: 'Inquire first',
    bullets: ['Film type matters', 'Window count helps', 'Install included'],
  },
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
        eyebrow="Print Services"
        title="Order the print you need or request the right quote."
        subtitle="Stickers, labels, signs, event displays, mylar packaging, business print, vehicle graphics, and window film from one Bay Area shop."
        primaryCta={{ label: 'Order Stickers & Labels', href: '/stickers#configure' }}
        secondaryCta={{ label: 'Request a Custom Quote', href: '/contact' }}
      />

      <section className="py-8 md:py-14">
        <div className="section-container">
          <div className="mx-auto mb-7 max-w-3xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Pick The Path</p>
            <h2 className="text-2xl font-black md:text-4xl">Buy standard items online. Quote custom jobs fast.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              If the job has standard sizing, start with the shop module. If it needs install, measurements, a deadline, or unusual specs, send a quote request.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => {
              const isQuote = service.intent === 'Inquire first'
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    to={service.href}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/35"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                        {service.intent}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black leading-tight">{service.title}</h3>
                          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">{service.price}</p>
                        </div>
                        <div className={`rounded-full p-2 ${isQuote ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'}`}>
                          {isQuote ? <MessageSquare size={16} /> : <ShoppingCart size={16} />}
                        </div>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                      <div className="mb-5 grid gap-2">
                        {service.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-2">
                        {service.action}<ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 py-10 md:py-14">
        <div className="section-container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black shadow-xl">
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
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <img
                  src={SHOP_POSTER}
                  alt="Large-format printer running custom stickers"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">In The Shop</p>
              <h2 className="mb-3 text-2xl font-black leading-tight md:text-3xl">Printed in-house. Proofed before production.</h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                The video is proof, not a detour: your order runs through the shop’s own print and finishing workflow, which helps keep deadlines, proofs, pickup, and color checks under one roof.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
