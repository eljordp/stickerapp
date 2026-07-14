import { Link, useLocation } from 'react-router-dom'
import { Images, MessageSquare, ShoppingCart, Sticker } from 'lucide-react'

// Routes where the sticky mobile bar competes with a primary on-page CTA — hide it there
const HIDE_ON = new Set([
  '/cart',
  '/checkout',
  '/contact',
  '/order-confirmation',
  '/account',
])

const BAR_COPY: Record<string, {
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}> = {
  '/stickers': {
    primaryLabel: 'Configure',
    primaryHref: '#configure',
    secondaryLabel: 'Quote',
    secondaryHref: '/contact?service=Custom+Stickers',
  },
  '/services/business-signage': {
    primaryLabel: 'Shop Signs',
    primaryHref: '#shop',
    secondaryLabel: 'Custom Quote',
    secondaryHref: '#quote',
  },
  '/services/event-displays': {
    primaryLabel: 'Shop Displays',
    primaryHref: '#shop',
    secondaryLabel: 'Event Quote',
    secondaryHref: '#quote',
  },
  '/services/business-print': {
    primaryLabel: 'Shop Print',
    primaryHref: '#shop',
    secondaryLabel: 'Bulk Quote',
    secondaryHref: '#quote',
  },
  '/mylar': {
    primaryLabel: 'Price Mylar',
    primaryHref: '#configure',
    secondaryLabel: 'Bulk Quote',
    secondaryHref: '#quote',
  },
  '/services/vehicle-graphics': {
    primaryLabel: 'Get Quote',
    primaryHref: '#quote',
    secondaryLabel: 'See Work',
    secondaryHref: '#portfolio',
  },
  '/services/window-film': {
    primaryLabel: 'Get Quote',
    primaryHref: '#quote',
    secondaryLabel: 'See Work',
    secondaryHref: '#portfolio',
  },
  '/die-cut-stickers': {
    primaryLabel: 'Configure',
    primaryHref: '/stickers?product=die-cut-stickers#configure',
    secondaryLabel: 'Quote',
    secondaryHref: '/contact?service=Die-Cut+Stickers',
  },
  '/sticker-sheets': {
    primaryLabel: 'Configure',
    primaryHref: '/stickers?product=sticker-sheets#configure',
    secondaryLabel: 'Quote',
    secondaryHref: '/contact?service=Sticker+Sheets',
  },
  '/roll-labels': {
    primaryLabel: 'Configure',
    primaryHref: '/stickers?product=roll-labels#configure',
    secondaryLabel: 'Quote',
    secondaryHref: '/contact?service=Roll+Labels',
  },
  '/holographic-stickers': {
    primaryLabel: 'Configure',
    primaryHref: '/stickers?product=holographic-stickers&material=Holographic#configure',
    secondaryLabel: 'Quote',
    secondaryHref: '/contact?service=Holographic+Stickers',
  },
  '/custom-labels': {
    primaryLabel: 'Configure',
    primaryHref: '/stickers?product=custom-labels#configure',
    secondaryLabel: 'Quote',
    secondaryHref: '/contact?service=Custom+Labels',
  },
}

function MobileAction({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

export default function MobileBar() {
  const { pathname } = useLocation()
  if (HIDE_ON.has(pathname)) return null
  const pageCopy = BAR_COPY[pathname]
  const primaryIcon = pageCopy?.primaryLabel.includes('Quote') ? <MessageSquare size={18} /> : <ShoppingCart size={18} />
  const secondaryIcon = pageCopy?.secondaryLabel.includes('Work') ? <Images size={18} /> : <MessageSquare size={18} />

  if (pageCopy) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex">
          <MobileAction href={pageCopy.primaryHref} className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold text-sm">
            {primaryIcon}{pageCopy.primaryLabel}
          </MobileAction>
          <MobileAction href={pageCopy.secondaryHref} className="flex-1 flex items-center justify-center gap-2 py-4 bg-secondary text-secondary-foreground font-bold text-sm border-l border-border">
            {secondaryIcon}{pageCopy.secondaryLabel}
          </MobileAction>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex">
        <Link to="/stickers" className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold text-sm">
          <Sticker size={18} />Make Stickers
        </Link>
        <Link to="/contact" className="flex-1 flex items-center justify-center gap-2 py-4 bg-secondary text-secondary-foreground font-bold text-sm border-l border-border">
          <MessageSquare size={18} />Get Quote
        </Link>
      </div>
    </div>
  )
}
