import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
import Referral from '@/pages/Referral'
import Account from '@/pages/Account'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

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
      <AnalyticsTracker />
      <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/vehicle-graphics" element={<VehicleGraphics />} />
            <Route path="/services/business-signage" element={<BusinessSignage />} />
            <Route path="/services/event-displays" element={<EventDisplays />} />
            <Route path="/services/event-canopies" element={<EventDisplays />} />
            <Route path="/services/business-print" element={<BusinessPrint />} />
            <Route path="/services/window-film" element={<WindowFilm />} />
            <Route path="/services/mylar-packaging" element={<MylarPackaging />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
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
