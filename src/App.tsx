import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Order from '@/pages/Order'
import Services from '@/pages/Services'
import VehicleGraphics from '@/pages/VehicleGraphics'
import BusinessSignage from '@/pages/BusinessSignage'
import EventCanopies from '@/pages/EventCanopies'
import BusinessPrint from '@/pages/BusinessPrint'
import WindowFilm from '@/pages/WindowFilm'
import MylarPackaging from '@/pages/MylarPackaging'
import StickerSheets from '@/pages/StickerSheets'
import Cart from '@/pages/Cart'
import Contact from '@/pages/Contact'
import About from '@/pages/About'
import Projects from '@/pages/Projects'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/vehicle-graphics" element={<VehicleGraphics />} />
            <Route path="/services/business-signage" element={<BusinessSignage />} />
            <Route path="/services/event-canopies" element={<EventCanopies />} />
            <Route path="/services/business-print" element={<BusinessPrint />} />
            <Route path="/services/window-film" element={<WindowFilm />} />
            <Route path="/services/mylar-packaging" element={<MylarPackaging />} />
            <Route path="/services/sticker-sheets" element={<StickerSheets />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
