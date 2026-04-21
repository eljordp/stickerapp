import { Link } from 'react-router-dom'
import tssLogo from '@/assets/tss-logo-new.png'

const footerLinks = {
  products: [
    { label: 'Die-Cut Stickers', href: '/order' },
    { label: 'Kiss-Cut Stickers', href: '/order' },
    { label: 'Sticker Sheets', href: '/order' },
    { label: 'Holographic Stickers', href: '/order' },
  ],
  services: [
    { label: 'Vehicle Graphics', href: '/services/vehicle-graphics' },
    { label: 'Event Canopies', href: '/services/event-canopies' },
    { label: 'Business Print', href: '/services/business-print' },
    { label: 'Business Signage', href: '/services/business-signage' },
    { label: 'Window Film & Tint', href: '/services/window-film' },
    { label: 'Mylar Packaging', href: '/services/mylar-packaging' },
  ],
  support: [
    { label: 'Get a Quote', href: '/contact' },
    { label: 'About Us', href: '/about' },
    { label: 'Our Projects', href: '/projects' },
    { label: 'Contact', href: '/contact' },
    { label: 'Referral Program', href: '/referral' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-surface-overlay border-t border-border pb-20 md:pb-0">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={tssLogo} alt="The Sticker Smith" className="h-12 w-auto" />
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              The Sticker Smith is a Bay Area sticker and print company for creators, brands, and dreamers.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/thestickersmith" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com/thestickersmith" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://tiktok.com/@thestickersmith" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all" aria-label="TikTok">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.13a8.16 8.16 0 004.77 1.52v-3.44a4.85 4.85 0 01-.81-.06 4.8 4.8 0 01-2.38-.88v7.08"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-foreground">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (<li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-foreground">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (<li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-foreground">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (<li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link></li>))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6">
            <p className="text-muted-foreground text-xs md:text-sm text-center">&copy; {new Date().getFullYear()} The Sticker Smith. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
              <span className="text-[10px] md:text-xs text-muted-foreground mr-1">We accept</span>
              {['Visa', 'MC', 'Amex', 'PayPal', 'Apple Pay'].map((m) => (<div key={m} className="px-1.5 md:px-2 py-1 rounded bg-white/5 border border-border text-[9px] md:text-[10px] text-muted-foreground font-medium">{m}</div>))}
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-muted-foreground">Website by</span>
              <a href="https://www.jdlo.site" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:brightness-110 transition-all">JDLO</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
