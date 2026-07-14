import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, MessageSquare, Shield, Star, Sticker } from 'lucide-react'
import Hero from '@/components/home/Hero'
import ProductCategories from '@/components/home/ProductCategories'
import HowItWorks from '@/components/home/HowItWorks'

const TrustedBy = lazy(() => import('@/components/home/TrustedBy'))
const ProjectGallery = lazy(() => import('@/components/home/ProjectGallery'))
const ServicesOverview = lazy(() => import('@/components/home/ServicesOverview'))
const Reviews = lazy(() => import('@/components/home/Reviews'))
const HomeCTA = lazy(() => import('@/components/home/HomeCTA'))

function useDesktopHomeSections() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isPrerender = Boolean((window as unknown as { __prerender?: boolean }).__prerender)
    const desktop = window.matchMedia('(min-width: 1024px)')
    const update = () => setShow(!isPrerender && desktop.matches)

    update()
    desktop.addEventListener('change', update)

    return () => desktop.removeEventListener('change', update)
  }, [])

  return show
}

function MobileTrustStrip() {
  const items = [
    { icon: Clock, label: '24hr proof' },
    { icon: MapPin, label: 'Bay Area pickup' },
    { icon: Star, label: '5.0 Google' },
    { icon: Shield, label: 'Quality checked' },
  ]

  return (
    <section className="border-y border-border/50 bg-card/35 py-4 lg:hidden">
      <div className="section-container grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <item.icon size={16} className="text-primary" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function MobileQuoteBridge() {
  const quoteServices = ['Signs', 'Wraps', 'Packaging', 'Business print']

  return (
    <section className="border-t border-border/50 bg-background py-9 lg:hidden">
      <div className="section-container">
        <div className="space-y-4">
          <p className="text-primary font-bold text-xs uppercase tracking-widest">Need more than stickers?</p>
          <h2 className="text-2xl font-black leading-tight">We also quote signs, wraps, packaging, and business print.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Keep ordering stickers here. Send bigger jobs as a quote request and we will point you to the right material, size, and turnaround.
          </p>
          <div className="flex flex-wrap gap-2">
            {quoteServices.map((service) => (
              <span key={service} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                {service}
              </span>
            ))}
          </div>
          <div className="grid gap-3 pt-1">
            <Link to="/stickers" className="btn-primary w-full justify-center">
              <Sticker size={18} />
              Order Stickers
              <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-secondary w-full justify-center">
              <MessageSquare size={18} />
              Get a Custom Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function LocalStickerDiscovery() {
  const links = [
    { label: 'Custom stickers in Hayward', href: '/hayward' },
    { label: 'Bay Area custom stickers', href: '/stickers' },
    { label: 'Custom product labels', href: '/custom-labels' },
    { label: 'Die-cut stickers', href: '/die-cut-stickers' },
  ]

  return (
    <section className="border-t border-border/50 bg-card/35 py-9">
      <div className="section-container max-w-5xl">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-widest">Printed in Hayward</p>
            <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
              Custom stickers and labels for Bay Area businesses, brands, and events.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Approve a digital proof before production, then pick up from our Hayward print shop or have the finished order shipped.
            </p>
          </div>
          <Link to="/stickers" className="btn-primary w-full justify-center md:w-auto">
            Order Custom Stickers <ArrowRight size={18} />
          </Link>
        </div>
        <nav aria-label="Local sticker and label pages" className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-full border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}

export default function Home() {
  const showDesktopSections = useDesktopHomeSections()

  return (
    <div className="relative">
      {/* Grid backdrop — runs the full height of the homepage */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.02,
        }}
      />
      <div className="relative">
        <Hero />
        <MobileTrustStrip />
        <ProductCategories />
        <HowItWorks />
        <LocalStickerDiscovery />
        <MobileQuoteBridge />
        {showDesktopSections && (
          <Suspense fallback={null}>
            <TrustedBy />
            <ProjectGallery />
            <ServicesOverview />
            <Reviews />
            <HomeCTA />
          </Suspense>
        )}
      </div>
    </div>
  )
}
