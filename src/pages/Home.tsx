import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, MessageSquare, Shield, Star, Sticker } from 'lucide-react'
import Hero from '@/components/home/Hero'
import ProductCategories from '@/components/home/ProductCategories'
import HowItWorks from '@/components/home/HowItWorks'
import mobileStickers from '@/assets/projects/stickers-die-cut-stack.jpg'
import mobileSignage from '@/assets/optimized/projects/atlas-pizza-signage-800.webp'
import mobileEvent from '@/assets/projects/event-booth-sticker-smith.jpeg'

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

function MobileProjectProof() {
  const projects = [
    { src: mobileStickers, alt: 'Finished die-cut sticker stack', label: 'Custom stickers' },
    { src: mobileSignage, alt: 'Installed Atlas Pizza storefront signage', label: 'Storefront signage' },
    { src: mobileEvent, alt: 'Sticker Smith branded event booth', label: 'Event displays' },
  ]

  return (
    <section className="border-t border-border/50 bg-card/25 py-9 lg:hidden">
      <div className="section-container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Real finished work</p>
            <h2 className="mt-1 text-2xl font-black">See what actually gets delivered.</h2>
          </div>
          <Link to="/projects" className="shrink-0 text-sm font-bold text-primary">All projects</Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {projects.map(project => (
            <Link key={project.label} to="/projects" className="group overflow-hidden rounded-xl border border-border bg-card focus-visible:ring-2 focus-visible:ring-primary">
              <img src={project.src} alt={project.alt} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
              <p className="px-2 py-2 text-[11px] font-bold leading-tight">{project.label}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
          <div className="rounded-xl border border-border bg-background/60 p-3">Digital proof before production</div>
          <div className="rounded-xl border border-border bg-background/60 p-3">Shipping or Hayward pickup</div>
        </div>
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
        <MobileProjectProof />
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
