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

const SITE_URL = 'https://tssprint.com'
const DEFAULT_DESCRIPTION = 'Premium custom stickers, labels, decals, signage, vehicle graphics & packaging in the Bay Area. Fast turnaround, proof-based printing, and local pickup available.'

type PageMeta = {
  title: string
  description: string
}

const pageMeta: Record<string, PageMeta> = {
  '/': {
    title: 'The Sticker Smith | Custom Stickers, Labels & Printing - Bay Area',
    description: DEFAULT_DESCRIPTION,
  },
  '/stickers': {
    title: 'Custom Stickers & Labels | The Sticker Smith',
    description: 'Design and order die-cut, kiss-cut, holographic, matte, clear, sheet, and roll stickers with free digital proofs and Bay Area pickup.',
  },
  '/services': {
    title: 'Print & Branding Services | The Sticker Smith',
    description: 'Explore vehicle graphics, storefront signage, event displays, business print, window film, mylar packaging, and custom branding services.',
  },
  '/services/vehicle-graphics': {
    title: 'Vehicle Graphics & Fleet Wraps | The Sticker Smith',
    description: 'Custom vehicle graphics, wraps, fleet branding, decals, and door graphics for Bay Area businesses.',
  },
  '/services/business-signage': {
    title: 'Business Signage | The Sticker Smith',
    description: 'Storefront signs, wall graphics, A-frames, acrylic signs, window graphics, and branded signage for local businesses.',
  },
  '/services/event-displays': {
    title: 'Event Displays, Tents & Banners | The Sticker Smith',
    description: 'Custom event tents, flags, banners, table covers, displays, and branded booth materials for Bay Area events.',
  },
  '/services/business-print': {
    title: 'Business Print Materials | The Sticker Smith',
    description: 'Business cards, flyers, postcards, menus, rack cards, and printed marketing materials for Bay Area brands.',
  },
  '/services/window-film': {
    title: 'Window Film, Tint & Graphics | The Sticker Smith',
    description: 'Frosted film, solar tint, security film, privacy film, and custom window graphics for offices and storefronts.',
  },
  '/mylar': {
    title: 'Custom Mylar Packaging | The Sticker Smith',
    description: 'Custom branded mylar bags, pouch packaging, labels, and print-ready packaging options for retail products.',
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
  return pageMeta[pathname] ?? {
    title: 'Page Not Found | The Sticker Smith',
    description: 'This Sticker Smith page could not be found. Browse custom stickers, print services, projects, or contact the studio.',
  }
}

function setMeta(selector: string, attribute: 'content' | 'href', value: string) {
  const element = document.head.querySelector(selector)
  element?.setAttribute(attribute, value)
}

function HeadManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = getPageMeta(pathname)
    const canonicalPath = pathname === '/' ? '' : pathname
    const canonicalUrl = `${SITE_URL}${canonicalPath}`

    document.title = meta.title
    setMeta('meta[name="description"]', 'content', meta.description)
    setMeta('meta[property="og:title"]', 'content', meta.title)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl)
    setMeta('meta[name="twitter:title"]', 'content', meta.title)
    setMeta('meta[name="twitter:description"]', 'content', meta.description)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
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
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/case-studies" element={<Navigate to="/projects" replace />} />
              <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
