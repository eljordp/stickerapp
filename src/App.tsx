import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import Layout from '@/components/layout/Layout'
import PrinterIntro from '@/components/PrinterIntro'
import { trackPageView, setupClickTracking } from '@/lib/analytics'
import { captureReferralCode } from '@/lib/referrals'
import Home from '@/pages/Home'
import Order from '@/pages/Order'
import Services from '@/pages/Services'
import VehicleGraphics from '@/pages/VehicleGraphics'
import BusinessSignage from '@/pages/BusinessSignage'
import EventDisplays from '@/pages/EventDisplays'
import BusinessPrint from '@/pages/BusinessPrint'
import WindowFilm from '@/pages/WindowFilm'
import MylarPackaging from '@/pages/MylarPackaging'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import OrderConfirmation from '@/pages/OrderConfirmation'
import Contact from '@/pages/Contact'
import About from '@/pages/About'
import Projects from '@/pages/Projects'
import CaseStudyDetail from '@/pages/CaseStudyDetail'
import Referral from '@/pages/Referral'
import Account from '@/pages/Account'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'
import CityPage from '@/pages/CityPage'
import { cityBySlug } from '@/lib/cities'
import { getStructuredData, SITE_URL } from '@/lib/structuredData'
import StickerSupportPage from '@/pages/StickerSupportPage'
import { stickerSupportPageBySlug } from '@/lib/stickerSupportPages'

const DEFAULT_DESCRIPTION = 'Premium custom stickers, labels, decals, signage, vehicle graphics & packaging in the Bay Area. Fast turnaround, proof-based printing, and local pickup available.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

type PageMeta = {
  title: string
  description: string
  image?: string
  imageAlt?: string
}

const pageMeta: Record<string, PageMeta> = {
  '/': {
    title: 'The Sticker Smith | Custom Stickers, Labels & Printing - Bay Area',
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    imageAlt: 'The Sticker Smith print work and custom stickers',
  },
  '/stickers': {
    title: 'Custom Stickers Bay Area | Die-Cut, Labels & Fast Proofs',
    description: 'Order Bay Area custom stickers, die-cut vinyl, sticker sheets, holographic stickers, and roll labels from Hayward with free proofs and local pickup.',
  },
  '/services': {
    title: 'Print & Branding Services | The Sticker Smith',
    description: 'Explore vehicle graphics, storefront signage, event displays, business print, window film, mylar packaging, and custom branding services.',
  },
  '/services/vehicle-graphics': {
    title: 'Vehicle Graphics Hayward & Bay Area | The Sticker Smith',
    description: 'Custom vehicle graphics in Hayward CA: wraps, fleet branding, decals, vinyl lettering, door graphics, and work truck graphics for Bay Area businesses.',
  },
  '/services/business-signage': {
    title: 'Business Signs Hayward | Storefront Signs & A-Frames',
    description: 'Custom business signs in Hayward and the Bay Area: storefront signs, wall graphics, A-frames, banners, window graphics, and branded installs.',
  },
  '/services/event-displays': {
    title: 'Custom Canopies Hayward & Bay Area | The Sticker Smith',
    description: 'Custom canopies in Hayward CA, plus printed canopy tents, banners, table covers, feather flags, backdrops, and event displays for Bay Area businesses.',
  },
  '/services/business-print': {
    title: 'Custom Printing in Hayward | Business Cards, Flyers & Stationery | The Sticker Smith',
    description: 'Custom printing company in Hayward and the Bay Area. Business cards, flyers, postcards, stationery, menus, and marketing materials on premium stock with a free proof before we print.',
  },
  '/services/window-film': {
    title: 'Window Film, Tint & Graphics | The Sticker Smith',
    description: 'Frosted film, solar tint, security film, privacy film, and custom window graphics for offices and storefronts.',
  },
  '/mylar': {
    title: 'Custom Mylar Bags Hayward & Bay Area | The Sticker Smith',
    description: 'Order custom mylar bags in Hayward CA, plus pouch packaging, jar labels, and product labels with digital proofs, bulk quotes, and Bay Area pickup.',
  },
  '/cart': {
    title: 'Cart | The Sticker Smith',
    description: 'Review your custom sticker and print order, apply discounts, save a quote, or continue to checkout.',
  },
  '/checkout': {
    title: 'Checkout | The Sticker Smith',
    description: 'Complete your Sticker Smith order with proof-based production, shipping, or Bay Area pickup.',
  },
  '/order-confirmation': {
    title: 'Order Confirmation | The Sticker Smith',
    description: 'Your Sticker Smith order has been received. Watch for your digital proof and next steps.',
  },
  '/contact': {
    title: 'Contact & Free Quote | The Sticker Smith',
    description: 'Request a free quote, ask a print question, or contact The Sticker Smith for custom stickers, signage, wraps, and packaging.',
  },
  '/quote': {
    title: 'Fast Print Quote | Stickers, Signs, Wraps & Event Displays',
    description: 'Request a fast quote from The Sticker Smith for custom stickers, business signage, vehicle graphics, event displays, mylar packaging, and print projects.',
  },
  '/about': {
    title: 'About The Sticker Smith | Bay Area Print Studio',
    description: 'Meet The Sticker Smith, a Bay Area print and branding studio helping creators and businesses brand every surface.',
  },
  '/projects': {
    title: 'Print Projects & Portfolio | The Sticker Smith',
    description: 'See recent sticker, signage, vehicle graphics, event display, and business branding work from The Sticker Smith.',
  },
  '/referral': {
    title: 'Referral Program | The Sticker Smith',
    description: 'Share The Sticker Smith with friends, creators, and businesses and earn referral rewards on new print orders.',
  },
  '/account': {
    title: 'Account | The Sticker Smith',
    description: 'Manage your Sticker Smith account, referral code, profile, and order details.',
  },
  '/admin': {
    title: 'Admin | The Sticker Smith',
    description: 'The Sticker Smith admin dashboard.',
  },
}

function getPageMeta(pathname: string): PageMeta {
  if (pathname.startsWith('/case-studies/')) {
    return {
      title: 'Project Case Study | The Sticker Smith',
      description: 'A detailed look at a Sticker Smith print, branding, signage, or vehicle graphics project.',
    }
  }
  const citySlug = pathname.replace(/^\//, '')
  const city = cityBySlug[citySlug]
  if (city) {
    return { title: city.metaTitle, description: city.metaDescription }
  }
  const stickerPage = stickerSupportPageBySlug[citySlug]
  if (stickerPage) {
    return {
      title: stickerPage.metaTitle,
      description: stickerPage.metaDescription,
      image: DEFAULT_OG_IMAGE,
      imageAlt: stickerPage.imageAlt,
    }
  }
  return pageMeta[pathname] ?? {
    title: 'Page Not Found | The Sticker Smith',
    description: 'This Sticker Smith page could not be found. Browse custom stickers, print services, projects, or contact the studio.',
  }
}

function setMeta(selector: string, attribute: 'content' | 'href', value: string, create?: () => HTMLElement) {
  let element = document.head.querySelector(selector) as HTMLElement | null
  if (!element && create) {
    element = create()
    document.head.appendChild(element)
  }
  element?.setAttribute(attribute, value)
}

function setStructuredData(pathname: string) {
  const id = 'structured-data'
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.text = JSON.stringify(getStructuredData(pathname))
}

function HeadManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = getPageMeta(pathname)
    const canonicalPath = pathname === '/' ? '' : pathname
    const canonicalUrl = `${SITE_URL}${canonicalPath}`
    const image = meta.image ?? DEFAULT_OG_IMAGE
    const imageAlt = meta.imageAlt ?? 'The Sticker Smith — custom stickers, labels, decals and vehicle graphics, Bay Area'

    document.title = meta.title
    setMeta('meta[name="description"]', 'content', meta.description, () => {
      const element = document.createElement('meta')
      element.setAttribute('name', 'description')
      return element
    })
    setMeta('meta[name="robots"]', 'content', 'index,follow,max-image-preview:large', () => {
      const element = document.createElement('meta')
      element.setAttribute('name', 'robots')
      return element
    })
    setMeta('meta[property="og:title"]', 'content', meta.title)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl)
    setMeta('meta[property="og:image"]', 'content', image)
    setMeta('meta[property="og:image:width"]', 'content', '1200', () => {
      const element = document.createElement('meta')
      element.setAttribute('property', 'og:image:width')
      return element
    })
    setMeta('meta[property="og:image:height"]', 'content', '630', () => {
      const element = document.createElement('meta')
      element.setAttribute('property', 'og:image:height')
      return element
    })
    setMeta('meta[property="og:image:type"]', 'content', 'image/jpeg', () => {
      const element = document.createElement('meta')
      element.setAttribute('property', 'og:image:type')
      return element
    })
    setMeta('meta[property="og:image:alt"]', 'content', imageAlt, () => {
      const element = document.createElement('meta')
      element.setAttribute('property', 'og:image:alt')
      return element
    })
    setMeta('meta[name="twitter:title"]', 'content', meta.title)
    setMeta('meta[name="twitter:description"]', 'content', meta.description)
    setMeta('meta[name="twitter:image"]', 'content', image)
    setMeta('meta[name="twitter:image:alt"]', 'content', imageAlt, () => {
      const element = document.createElement('meta')
      element.setAttribute('name', 'twitter:image:alt')
      return element
    })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
    setStructuredData(pathname)
  }, [pathname])

  return null
}

function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  useEffect(() => {
    captureReferralCode()
    setupClickTracking()
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <PrinterIntro />
      <Analytics />
      <HeadManager />
      <AnalyticsTracker />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/stickers" element={<Order />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/vehicle-graphics" element={<VehicleGraphics />} />
              <Route path="/services/business-signage" element={<BusinessSignage />} />
              <Route path="/services/event-displays" element={<EventDisplays />} />
              <Route path="/services/business-print" element={<BusinessPrint />} />
              <Route path="/services/window-film" element={<WindowFilm />} />
              <Route path="/mylar" element={<MylarPackaging />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/quote" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/case-studies" element={<Navigate to="/projects" replace />} />
              <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<Admin />} />
              {Object.keys(stickerSupportPageBySlug).map((slug) => (
                <Route key={slug} path={`/${slug}`} element={<StickerSupportPage slug={slug} />} />
              ))}
              {Object.keys(cityBySlug).map((slug) => (
                <Route key={slug} path={`/${slug}`} element={<CityPage slug={slug} />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
