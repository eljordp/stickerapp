import { Link, useLocation } from 'react-router-dom'
import { Sticker, MessageSquare } from 'lucide-react'

// Routes where the sticky mobile bar competes with a primary on-page CTA — hide it there
const HIDE_ON = new Set([
  '/cart',
  '/checkout',
  '/contact',
  '/order-confirmation',
  '/account',
])

export default function MobileBar() {
  const { pathname } = useLocation()
  if (HIDE_ON.has(pathname)) return null
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
