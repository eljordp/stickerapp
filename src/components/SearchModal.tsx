import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchItem {
  name: string
  category: string
  href: string
  keywords: string[]
}

const searchItems: SearchItem[] = [
  // Stickers
  { name: 'Custom Stickers', category: 'Stickers', href: '/order', keywords: ['sticker', 'die-cut', 'kiss-cut', 'vinyl', 'matte', 'glossy', 'clear', 'holographic', 'paper', 'circle', 'square', 'rectangle', 'decal', 'label'] },
  { name: 'Gloss Finish Stickers', category: 'Stickers', href: '/order', keywords: ['gloss', 'glossy', 'shiny', 'finish'] },
  { name: 'Holographic Stickers', category: 'Stickers', href: '/order', keywords: ['holo', 'holographic', 'rainbow', 'iridescent'] },
  { name: 'UV Coating Stickers', category: 'Stickers', href: '/order', keywords: ['uv', 'coating', 'protection', 'spot uv'] },
  { name: 'Embossed Stickers', category: 'Stickers', href: '/order', keywords: ['emboss', 'embossed', 'raised', 'textured', '3d'] },
  { name: 'Paper Stickers', category: 'Stickers', href: '/order', keywords: ['paper', 'eco', 'recyclable'] },

  // Mylar Packaging
  { name: 'Mylar Bags – Eighths', category: 'Mylar Packaging', href: '/services/mylar-packaging', keywords: ['mylar', 'bag', 'eighth', '8th', '3x5', 'packaging', 'pouch'] },
  { name: 'Mylar Bags – Quarters', category: 'Mylar Packaging', href: '/services/mylar-packaging', keywords: ['mylar', 'bag', 'quarter', 'qtr', '4x6', 'packaging'] },
  { name: 'Mylar Bags – Ounce', category: 'Mylar Packaging', href: '/services/mylar-packaging', keywords: ['mylar', 'bag', 'ounce', 'oz', '5x8', 'packaging'] },
  { name: 'Mylar Bags – Half Pound', category: 'Mylar Packaging', href: '/services/mylar-packaging', keywords: ['mylar', 'bag', 'half pound', 'hp', '10x12', 'packaging'] },
  { name: 'Mylar Bags – Pound', category: 'Mylar Packaging', href: '/services/mylar-packaging', keywords: ['mylar', 'bag', 'pound', 'lb', '14x16', 'packaging'] },
  { name: 'Jar Labels', category: 'Mylar Packaging', href: '/services/mylar-packaging', keywords: ['jar', 'label', '2oz', 'container'] },

  // Event Displays
  { name: 'Custom Canopy Tents', category: 'Event Displays', href: '/services/event-displays', keywords: ['canopy', 'tent', 'popup', 'pop-up', 'event', 'booth', 'trade show', 'steel', 'aluminum', '5x5', '10x10', '10x15', '10x20'] },
  { name: 'Sidewalls & Half Walls', category: 'Event Displays', href: '/services/event-displays', keywords: ['sidewall', 'half wall', 'wall', 'tent wall', 'enclosure'] },

  // Backdrops
  { name: 'Backdrop Displays', category: 'Backdrops & Displays', href: '/services/event-displays', keywords: ['backdrop', 'display', 'banner', 'step and repeat', 'photo', 'background', 'fabric', 'vinyl', 'pop-up', 'tension'] },

  // Table Covers
  { name: 'Table Covers & Throws', category: 'Table Covers', href: '/services/event-displays', keywords: ['table', 'cover', 'throw', 'tablecloth', 'fitted', 'draped', '6ft', '8ft', 'round', 'rectangular'] },

  // Retractable Banners
  { name: 'Retractable Banners', category: 'Banners', href: '/services/business-signage', keywords: ['retractable', 'banner', 'roll up', 'pull up', 'stand', 'portable', 'display', 'economy', 'standard', 'premium', 'wide'] },

  // Business Print
  { name: 'Business Cards', category: 'Business Print', href: '/services/business-print', keywords: ['business card', 'card', 'standard', 'square', 'mini', 'soft-touch', 'spot uv', 'foil', 'rounded'] },
  { name: 'Flyers', category: 'Business Print', href: '/services/business-print', keywords: ['flyer', 'flier', 'handout', 'leaflet', '8.5x11', '5.5x8.5'] },
  { name: 'Door Hangers', category: 'Business Print', href: '/services/business-print', keywords: ['door hanger', 'hanger', 'door', 'marketing'] },
  { name: 'Postcards', category: 'Business Print', href: '/services/business-print', keywords: ['postcard', 'mailer', 'mailing', '4x6', '5x7'] },
  { name: 'Vehicle Magnets', category: 'Business Print', href: '/services/business-print', keywords: ['magnet', 'vehicle magnet', 'car magnet', 'truck magnet', 'magnetic', '12x18', '18x24', '24x36'] },

  // Other Services
  { name: 'Vehicle Graphics & Wraps', category: 'Vehicle Graphics', href: '/services/vehicle-graphics', keywords: ['vehicle', 'wrap', 'car wrap', 'truck', 'fleet', 'vinyl', 'lettering', 'decal', 'door graphic', 'perforated', 'window'] },
  { name: 'Business Signage', category: 'Business Signage', href: '/services/business-signage', keywords: ['sign', 'signage', 'storefront', 'wall graphic', 'mural', 'a-frame', 'sidewalk', 'acrylic', 'metal', 'led', 'illuminated'] },
  { name: 'Window Film & Tint', category: 'Window Film', href: '/services/window-film', keywords: ['window', 'film', 'tint', 'frosted', 'privacy', 'solar', 'heat', 'security', 'decorative', 'anti-graffiti'] },
]

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const results = query.trim().length < 2 ? [] : searchItems.filter(item => {
    const q = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    )
  })

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-20 md:pt-32 px-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search size={20} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products & services..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base focus:outline-none"
              />
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Type to search stickers, banners, cards, wraps, and more...
                </div>
              ) : results.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No results for "{query}"
                </div>
              ) : (
                <div className="py-2">
                  {Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <p className="px-5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{category}</p>
                      {items.map(item => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={onClose}
                          className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group"
                        >
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd> to close</span>
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
