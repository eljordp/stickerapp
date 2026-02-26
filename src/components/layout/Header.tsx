import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import tssLogo from '@/assets/tss-logo-new.png'

const navLinks = [
  { label: 'Order Stickers', href: '/order' },
  {
    label: 'Services',
    href: '/services',
    submenu: [
      { label: 'Sticker Sheets', href: '/services/sticker-sheets' },
      { label: 'Vehicle Graphics', href: '/services/vehicle-graphics' },
      { label: 'Business Signage', href: '/services/business-signage' },
      { label: 'Event Canopies', href: '/services/event-canopies' },
      { label: 'Business Print', href: '/services/business-print' },
      { label: 'Window Film & Tint', href: '/services/window-film' },
      { label: 'Mylar Packaging', href: '/services/mylar-packaging' },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()
  const { items } = useCart()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [location])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-background/80 backdrop-blur-sm'}`}>
        <div className="section-container">
          <nav className="flex items-center justify-between h-16 md:h-18">
            <Link to="/" className="flex items-center group">
              <img src={tssLogo} alt="The Sticker Smith" className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105" />
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.label} className="relative" onMouseEnter={() => link.submenu && setOpenDropdown(link.label)} onMouseLeave={() => setOpenDropdown(null)}>
                  <Link to={link.href} className={`nav-link flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/5 ${location.pathname === link.href ? 'active' : ''}`}>
                    {link.label}
                    {link.submenu && <ChevronDown size={14} className="opacity-50" />}
                  </Link>
                  {link.submenu && (
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl overflow-hidden shadow-lg z-50">
                          {link.submenu.map((sub) => (
                            <Link key={sub.label} to={sub.href} className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">{sub.label}</Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/cart" className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5" aria-label="Shopping cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>
              <Link to="/contact" className="btn-primary text-sm px-6 py-2.5">Start My Project</Link>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Shopping cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>
              <button className="p-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>
      </header>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/98 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="relative pt-20 px-6 flex flex-col gap-1 max-h-screen overflow-y-auto pb-32">
              {navLinks.map((link, index) => (
                <motion.div key={link.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={link.href} className={`block text-xl font-semibold py-3 border-b border-border/30 transition-colors ${location.pathname === link.href ? 'text-primary' : 'text-foreground hover:text-primary'}`}>{link.label}</Link>
                  {link.submenu && (
                    <div className="pl-4 py-1">
                      {link.submenu.map((sub) => (
                        <Link key={sub.label} to={sub.href} className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">{sub.label}</Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
                <Link to="/contact" className="btn-primary w-full text-center">Start My Project</Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
