import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Search, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import SearchModal from '@/components/SearchModal'
import tssLogo from '@/assets/tss-logo-new.png'

const navLinks = [
  { label: 'Order Stickers', href: '/stickers' },
  {
    label: 'Services',
    href: '/services',
    submenu: [
      { label: 'Vehicle Graphics', href: '/services/vehicle-graphics', products: ['Full Vehicle Wraps', 'Partial Wraps & Accents', 'Fleet Branding', 'Door & Spot Graphics', 'Perforated Window Graphics', 'Vinyl Lettering & Decals'] },
      { label: 'Business Signage', href: '/services/business-signage', products: ['Storefront & Building Signs', 'Wall Graphics & Murals', 'A-Frame Sidewalk Signs', 'Retractable Banners', 'Acrylic & Metal Signs', 'LED & Illuminated Signs'] },
      { label: 'Event Displays', href: '/services/event-displays', products: ['Custom Canopy Tents', 'Backdrop Displays', 'Table Covers & Throws', 'Feather & Teardrop Flags', 'Retractable Banner Stands'] },
      { label: 'Business Print', href: '/services/business-print', products: ['Business Cards', 'Flyers', 'Door Hangers', 'Postcards & Mailers', 'Vehicle Magnets'] },
      { label: 'Window Film & Tint', href: '/services/window-film', products: ['Frosted Privacy Film', 'Solar & Heat Rejection', 'Security & Safety Film', 'Decorative Graphics', 'Custom Cut Logos'] },
      { label: 'Mylar Packaging', href: '/mylar', products: ['Eighths (3"×5")', 'Quarters (4"×6")', 'Ounce Bags (5"×8")', 'Half Pound (10"×12")', 'Pound Bags (14"×16")', '2oz Jar + Label'] },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
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
    setHoveredService(null)
    setIsSearchOpen(false)
  }, [location])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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
                <div key={link.label} className="relative" onMouseEnter={() => { if (link.submenu) setOpenDropdown(link.label) }} onMouseLeave={() => { setOpenDropdown(null); setHoveredService(null) }}>
                  <Link to={link.href} className={`nav-link flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/5 ${location.pathname === link.href ? 'active' : ''}`}>
                    {link.label}
                    {link.submenu && <ChevronDown size={14} className="opacity-50" />}
                  </Link>
                  {link.submenu && (
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl overflow-hidden shadow-lg z-50">
                          {link.submenu.map((sub) => (
                            <div key={sub.label} className="relative" onMouseEnter={() => setHoveredService(sub.label)} onMouseLeave={() => setHoveredService(null)}>
                              <Link to={sub.href} className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${hoveredService === sub.label ? 'text-foreground bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                                {sub.label}
                                {sub.products && <ChevronDown size={12} className="opacity-40 -rotate-90" />}
                              </Link>
                              {sub.products && (
                                <AnimatePresence>
                                  {hoveredService === sub.label && (
                                    <motion.div
                                      initial={{ opacity: 0, x: -4 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -4 }}
                                      transition={{ duration: 0.12 }}
                                      className="absolute left-full top-0 ml-1 w-52 bg-card border border-border rounded-xl overflow-hidden shadow-lg z-50"
                                    >
                                      <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{sub.label}</p>
                                      {sub.products.map(product => (
                                        <Link key={product} to={sub.href} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">{product}</Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => setIsSearchOpen(true)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5" aria-label="Search">
                <Search size={20} />
              </button>
              <Link to="/account" className={`p-2.5 transition-colors rounded-lg hover:bg-white/5 ${user ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} aria-label="Account">
                <User size={20} />
              </Link>
              <Link to="/cart" className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5" aria-label="Shopping cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>
              <Link to="/contact" className="btn-primary text-sm px-6 py-2.5">Start My Project</Link>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search size={20} />
              </button>
              <Link to="/account" className={`p-2 transition-colors ${user ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} aria-label="Account">
                <User size={20} />
              </Link>
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
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
