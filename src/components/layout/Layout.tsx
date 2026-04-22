import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import PromoBanner from './PromoBanner'
export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBanner />
      <Header />
      <main className="flex-1 pt-16 md:pt-18 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
    </div>
  )
}
