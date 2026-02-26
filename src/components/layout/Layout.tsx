import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col relative border-x-4 border-b-4 border-primary/50">
      <Header />
      <main className="flex-1 pt-16 md:pt-18 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
    </div>
  )
}
