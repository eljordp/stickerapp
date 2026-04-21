import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import PromoBanner from './PromoBanner'
import sideStrip from '@/assets/side-strip-2.png'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Side strips - desktop only */}
      <div className="hidden md:block fixed top-0 left-0 bottom-0 w-[72px] z-50" style={{ backgroundImage: `url(${sideStrip})`, backgroundSize: '144px', backgroundRepeat: 'repeat' }} />
      <div className="hidden md:block fixed top-0 right-0 bottom-0 w-[72px] z-50" style={{ backgroundImage: `url(${sideStrip})`, backgroundSize: '144px', backgroundRepeat: 'repeat' }} />
      {/* Bottom strip */}
      <div className="hidden md:block fixed bottom-0 left-[72px] right-[72px] h-[36px] z-50" style={{ backgroundImage: `url(${sideStrip})`, backgroundSize: '144px', backgroundRepeat: 'repeat' }} />
      {/* Content with margin for strips */}
      <div className="md:ml-[72px] md:mr-[72px] md:mb-[36px]">
        <PromoBanner />
        <Header />
        <main className="flex-1 pt-16 md:pt-18 pb-16 md:pb-0">
          <Outlet />
        </main>
        <Footer />
        <MobileBar />
      </div>
    </div>
  )
}
