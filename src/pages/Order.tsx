import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, FileUp, Check, Clock, MapPin, Shield, Zap, Palette, Droplets, Sticker as StickerIcon, Hand, PanelsTopLeft, ScrollText } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { trackAddToCart } from '@/lib/analytics'
import { getPricing, loadPricing, getBasePrice, getMaterialMultiplier, getSizeMultiplier } from '@/lib/pricing'
import { cities } from '@/lib/cities'
import { projects } from '@/lib/projects'
import PageHero from '@/components/PageHero'
import StudioMockup from '@/components/StudioMockup'
import stickerHeroImg from '@/assets/projects/stickers-die-cut-stack.jpg'

const stickerSpecs = [
  { icon: Droplets, label: 'Material', value: 'Premium 3M & Avery cast vinyl' },
  { icon: Clock, label: 'Turnaround', value: '3-5 business days + 24hr proof' },
  { icon: Shield, label: 'Durability', value: '3-5 years outdoor · waterproof' },
  { icon: MapPin, label: 'Shipping', value: 'Free US shipping · Bay pickup' },
]

const shapeData = [
  { name: 'Die-Cut', value: 'Die-Cut' },
  { name: 'Kiss-Cut', value: 'Kiss-Cut' },
  { name: 'Square', value: 'Square' },
  { name: 'Circle', value: 'Circle' },
  { name: 'Rectangle', value: 'Rectangle' },
]

// Order-level add-ons (per-piece material upgrades are handled by Material column)
const ADDON_RUSH = { id: 'rush', label: 'Rush (2-day)', description: 'Skip the line — 2-day production', icon: Zap, price: 65 }
const ADDON_DESIGN = { id: 'design', label: 'Design Assist', description: 'Our designer helps shape your artwork', icon: Palette, price: 75 }

interface ArtworkAttachment {
  bucket: string
  path: string
  fileName: string
  contentType: string
  size: number
  uploadedAt: string
}

const materialData = [
  { value: 'Matte Vinyl', label: 'Matte', bg: 'radial-gradient(circle at 35% 35%, #f0ece8, #ccc7c0)' },
  { value: 'Glossy Vinyl', label: 'Gloss', bg: 'radial-gradient(circle at 35% 35%, #e0e0e4, #b0b0b6)' },
  { value: 'Clear', label: 'Clear', bg: 'radial-gradient(circle at 35% 35%, #bbbbc0, #88888e)' },
  { value: 'Holographic', label: 'Holographic', bg: 'linear-gradient(135deg, #e4c8f8, #c4b5fd, #93c5fd)' },
  { value: 'Paper', label: 'Paper', bg: 'radial-gradient(circle at 35% 35%, #f5e8a0, #d4c060)' },
  { value: 'Embossed/UV', label: 'Embossed/UV', bg: 'radial-gradient(circle at 35% 35%, #ffffff, #d8d8d8)' },
]

// Square-presets — used for Die-Cut, Kiss-Cut, Square (these shapes have equal W and H)
const SQUARE_SIZES = ['2" x 2"', '3" x 3"', '4" x 4"', '5" x 5"', '6" x 6"', '7" x 7"']
// Circle uses the same square presets internally (diameter = W = H), but the
// label is rendered as a single diameter ('2"', '3"', etc.) since "2" x 2"" is
// nonsensical for a circle.
const CIRCLE_LABELS: Record<string, string> = {
  '2" x 2"': '2" diameter',
  '3" x 3"': '3" diameter',
  '4" x 4"': '4" diameter',
  '5" x 5"': '5" diameter',
  '6" x 6"': '6" diameter',
  '7" x 7"': '7" diameter',
}
// Rectangle gets its own set of W×H presets
const RECT_SIZES = ['3" x 2"', '4" x 2"', '4" x 3"', '5" x 3"', '6" x 3"', '6" x 4"', '8" x 4"']

function getSizesForShape(shape: string): string[] {
  if (shape === 'Rectangle') return RECT_SIZES
  return SQUARE_SIZES
}

function formatSizeForShape(size: string, shape: string): string {
  if (shape === 'Circle') return CIRCLE_LABELS[size] ?? size
  return size
}

const qtyOptions = [50, 100, 250, 500, 1000, 2500]
const MIN_QTY = 50
const stickerFormats = [
  { value: 'handheld', label: 'Individual', cartLabel: 'Individual stickers', icon: Hand },
  { value: 'sheet', label: 'Sheets', cartLabel: 'Sticker sheets', icon: PanelsTopLeft },
  { value: 'roll', label: 'Rolls', cartLabel: 'Roll labels', icon: ScrollText },
] as const

const stickerFormatLinks = [
  { label: 'Die-cut vinyl stickers', href: '/die-cut-stickers', detail: 'Custom contour cuts for logos, art, and brand drops.' },
  { label: 'Sticker sheets', href: '/sticker-sheets', detail: 'Multiple kiss-cut designs on one branded sheet.' },
  { label: 'Roll labels', href: '/roll-labels', detail: 'Packaging labels for bottles, jars, bags, and product runs.' },
  { label: 'Holographic stickers', href: '/holographic-stickers', detail: 'Rainbow-shift vinyl for merch, packaging, and events.' },
  { label: 'Custom product labels', href: '/custom-labels', detail: 'Labels sized and proofed for retail packaging.' },
  { label: 'Clear decals', href: '/stickers?material=Clear#configure', detail: 'Transparent vinyl with a clean printed finish.' },
]

const stickerFaqs = [
  {
    q: 'Do you print custom stickers in the Bay Area?',
    a: 'Yes. The Sticker Smith prints custom stickers and labels in Hayward for Bay Area brands, artists, shops, events, and packaging projects, with local pickup available.',
  },
  {
    q: 'What sticker types can I order?',
    a: 'You can order die-cut stickers, kiss-cut stickers, sticker sheets, roll labels, holographic stickers, clear decals, matte stickers, and waterproof vinyl stickers.',
  },
  {
    q: 'Do I get a proof before printing?',
    a: 'Yes. Every custom sticker order includes a digital proof before production so cut lines, bleed, sizing, material, and artwork quality can be checked before anything prints.',
  },
]

const cityLinks = cities.slice(0, 8)
const stickerProofSlugs = [
  'fremontgear-stickers',
  'tastedeeztreatz-stiiizy',
  'fuegofamilyfarms-circle',
  'floodline-sticker',
  'brothersbroadleaf-halloween',
  'elevated925-mystery-snack-pack',
]
const stickerProofProjects = stickerProofSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is (typeof projects)[number] => Boolean(project))

type StickerFormat = (typeof stickerFormats)[number]['value']

function canPreviewArtwork(file: File) {
  return file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')
}

function ShapeIcon({ shape }: { shape: string }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {shape === 'Square' && <rect x="5" y="5" width="14" height="14" rx="1" />}
      {shape === 'Circle' && <circle cx="12" cy="12" r="7" />}
      {shape === 'Rectangle' && <rect x="3" y="7" width="18" height="10" rx="1" />}
      {shape === 'Die-Cut' && <path d="M12 3L21 12L12 21L3 12Z" />}
      {shape === 'Kiss-Cut' && <path d="M12 3L21 12L12 21L3 12Z" strokeDasharray="3 2" />}
    </svg>
  )
}

// Render a single sticker (as placeholder or real artwork)
function Sticker({ shape, artworkUrl, size = 96, dashed = false }: { shape: string; artworkUrl: string; size?: number; dashed?: boolean }) {
  const isCircle = shape === 'Circle'
  const isRect = shape === 'Rectangle'
  const w = isRect ? size * 1.4 : size
  const h = isRect ? size * 0.85 : size
  const radius = isCircle ? '50%' : shape === 'Die-Cut' ? '24%' : shape === 'Kiss-Cut' ? '18%' : '8%'
  return (
    <div
      className={`relative flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.45)] overflow-hidden ${dashed ? 'border-2 border-dashed border-white/30' : ''}`}
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: artworkUrl ? undefined : 'linear-gradient(135deg, hsl(199 89% 64% / 0.18), hsl(199 89% 40% / 0.08))',
      }}
    >
      {artworkUrl ? (
        <img src={artworkUrl} alt="Artwork" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] text-white/50 font-semibold leading-tight text-center px-1">Your<br/>Design</span>
      )}
    </div>
  )
}

function StickerMockup({ shape, artworkUrl, variant }: { shape: string; artworkUrl: string; variant: 'single' | 'sheet' | 'roll' }) {
  if (variant === 'single') {
    return (
      <div className="relative flex flex-col items-center">
        <Sticker shape={shape} artworkUrl={artworkUrl} size={130} />
        {/* Soft floor shadow */}
        <div className="mt-4 w-28 h-3 rounded-full bg-black/50 blur-md opacity-60" />
      </div>
    )
  }
  if (variant === 'sheet') {
    return (
      <div
        className="relative p-3 rounded-md bg-gradient-to-b from-white/95 to-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        style={{ transform: 'perspective(800px) rotateX(18deg)' }}
      >
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Sticker key={i} shape={shape} artworkUrl={artworkUrl} size={38} dashed />
          ))}
        </div>
      </div>
    )
  }
  // roll
  return (
    <div className="relative flex items-center" style={{ transform: 'perspective(600px) rotateY(-10deg)' }}>
      {/* Roll edge */}
      <div className="relative w-5 h-20 rounded-l-full bg-neutral-800 border border-neutral-700 shadow-inner">
        <div className="absolute inset-y-2 left-1.5 w-0.5 rounded-full bg-neutral-500/40" />
      </div>
      {/* Paper strip with stickers */}
      <div className="flex items-center gap-1 bg-gradient-to-r from-white/90 via-white to-white/70 px-2 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Sticker key={i} shape={shape} artworkUrl={artworkUrl} size={48} />
        ))}
      </div>
      {/* Soft end shadow */}
      <div className="w-6 h-16 bg-gradient-to-l from-transparent to-black/10" />
    </div>
  )
}

export default function Order() {
  const { addItem } = useCart()
  const [searchParams] = useSearchParams()
  const [shape, setShape] = useState('Die-Cut')
  const [material, setMaterial] = useState('Matte Vinyl')
  const [quantity, setQuantity] = useState(50)
  const [customQty, setCustomQty] = useState('')
  const [size, setSize] = useState('2" x 2"')
  const [mockupView, setMockupView] = useState<StickerFormat>('handheld')
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkUrl, setArtworkUrl] = useState('')
  const [artworkUpload, setArtworkUpload] = useState<ArtworkAttachment | null>(null)
  const [artworkStatus, setArtworkStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle')
  const [artworkError, setArtworkError] = useState('')
  const [added, setAdded] = useState(false)
  const [rushAddon, setRushAddon] = useState(false)
  const [designAddon, setDesignAddon] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [pricingConfig, setPricingConfig] = useState(() => getPricing())
  const queryString = searchParams.toString()

  useEffect(() => {
    let active = true
    loadPricing().then((config) => {
      if (active) setPricingConfig(config)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!queryString) return
    const params = new URLSearchParams(queryString)
    const product = (params.get('product') || '').toLowerCase()
    const format = (params.get('format') || '').toLowerCase()
    const nextFormat =
      format === 'sheet' || product.includes('sheet') ? 'sheet'
        : format === 'roll' || product.includes('roll') || product.includes('label') ? 'roll'
          : format === 'individual' || format === 'handheld' || product.includes('die-cut') || product.includes('sample') ? 'handheld'
            : null

    if (nextFormat) setMockupView(nextFormat)

    const shapeParam = params.get('shape')
    const nextShape =
      product.includes('sheet') ? 'Kiss-Cut'
        : product.includes('roll') || product.includes('label') ? 'Rectangle'
          : product.includes('die-cut') || product.includes('sample') ? 'Die-Cut'
            : shapeData.find(s => s.value.toLowerCase() === shapeParam?.toLowerCase())?.value
    if (nextShape) {
      setShape(nextShape)
      const validSizes = getSizesForShape(nextShape)
      const sizeParam = params.get('size')
      setSize(sizeParam && validSizes.includes(sizeParam) ? sizeParam : validSizes[0])
    }

    const materialParam = params.get('material')
    const nextMaterial = materialData.find(m => m.value.toLowerCase() === materialParam?.toLowerCase())?.value
    if (nextMaterial) setMaterial(nextMaterial)
    if (product.includes('sample')) setMaterial('Holographic')

    const qtyParam = Number(params.get('qty'))
    if (Number.isFinite(qtyParam) && qtyParam >= MIN_QTY) {
      if (qtyOptions.includes(qtyParam)) {
        setQuantity(qtyParam)
        setCustomQty('')
      } else {
        setCustomQty(String(qtyParam))
      }
    }
  }, [queryString])

  const effectiveQty = customQty ? (parseInt(customQty) || 50) : quantity
  const basePrice = getBasePrice(effectiveQty, pricingConfig)
  const matMult = getMaterialMultiplier(material, pricingConfig)
  const sizeMult = getSizeMultiplier(size, pricingConfig)
  const stickerSubtotal = +(basePrice * matMult * sizeMult * effectiveQty).toFixed(2)
  const addonsTotal = (rushAddon ? ADDON_RUSH.price : 0) + (designAddon ? ADDON_DESIGN.price : 0)
  const totalPrice = +(stickerSubtotal + addonsTotal).toFixed(2)
  const perUnit = +(basePrice * matMult * sizeMult).toFixed(3)

  const refPerUnit = getBasePrice(50, pricingConfig) * matMult * sizeMult
  const getDiscount = (qty: number) => {
    const pu = getBasePrice(qty, pricingConfig) * matMult * sizeMult
    return Math.round((1 - pu / refPerUnit) * 100)
  }
  const getQtyTotal = (qty: number) => +(getBasePrice(qty, pricingConfig) * matMult * sizeMult * qty).toFixed(0)

  const materialLabel = materialData.find(m => m.value === material)?.label || material
  const shapeLabel = shapeData.find(s => s.value === shape)?.name || shape
  const formatLabel = stickerFormats.find(f => f.value === mockupView)?.cartLabel || 'Individual stickers'
  const cartProductName =
    mockupView === 'sheet' ? `${materialLabel} Sticker Sheets`
      : mockupView === 'roll' ? `${materialLabel} Roll Labels`
        : `${shapeLabel} ${materialLabel} Stickers`

  const uploadArtwork = async (file: File) => {
    setArtworkStatus('uploading')
    setArtworkError('')
    setArtworkUpload(null)

    try {
      const response = await fetch('/api/uploads/create-artwork-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not prepare artwork upload.')

      const { error } = await supabase.storage
        .from(data.bucket)
        .uploadToSignedUrl(data.path, data.token, file, {
          contentType: file.type || data.contentType || 'application/octet-stream',
        })
      if (error) throw error

      setArtworkUpload({
        bucket: data.bucket,
        path: data.path,
        fileName: data.fileName || file.name,
        contentType: file.type || data.contentType || 'application/octet-stream',
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
      setArtworkStatus('uploaded')
    } catch (error) {
      setArtworkStatus('error')
      setArtworkError(error instanceof Error ? error.message : 'Artwork upload failed.')
    }
  }

  const handleFile = (file: File) => {
    setArtworkFile(file)
    setArtworkUrl(canPreviewArtwork(file) ? URL.createObjectURL(file) : '')
    void uploadArtwork(file)
  }

  useEffect(() => {
    return () => {
      if (artworkUrl) URL.revokeObjectURL(artworkUrl)
    }
  }, [artworkUrl])

  const handleAddToCart = () => {
    if (effectiveQty < MIN_QTY) return
    if (artworkFile && artworkStatus !== 'uploaded') return
    const addOns: { name: string; price: number }[] = []
    if (rushAddon) addOns.push({ name: ADDON_RUSH.label, price: ADDON_RUSH.price })
    if (designAddon) addOns.push({ name: ADDON_DESIGN.label, price: ADDON_DESIGN.price })
    const cartItem = {
      id: `sticker-${Date.now()}`,
      name: cartProductName,
      size,
      option: `${effectiveQty} pcs · ${formatLabel}`,
      price: stickerSubtotal,
      quantity: 1,
      material,
      shape,
      dimensions: size,
      addOns: addOns.length > 0 ? addOns : undefined,
      artwork: artworkUpload || undefined,
    }
    addItem(cartItem)
    trackAddToCart({
      item: cartItem,
      value: totalPrice,
      category: 'Custom Stickers',
      source: 'sticker_configurator',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <PageHero
        eyebrow="Custom Stickers"
        title="Bay Area custom stickers, printed in Hayward."
        subtitle="Die-cut, kiss-cut, holographic, matte, clear, sticker sheets, and roll labels. Free digital proof in 24 hours, 3–5 day turnaround, and local Bay Area pickup."
        image={stickerHeroImg}
        imageAlt="Stack of custom die-cut stickers"
        icon={StickerIcon}
        primaryCta={{ label: 'Configure Stickers', href: '#configure' }}
        secondaryCta={{ label: 'See Sticker Work', href: '#portfolio' }}
      />

      <section id="configure" className="py-8 md:py-12 scroll-mt-24">
        <div className="section-container">
          {/* 4-column configurator — first thing after the hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-10"
          >
            {/* Shape */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">Shape</h3>
              <div className="space-y-2">
                {shapeData.map(s => (
                  <button
                    key={s.value}
                    onClick={() => {
                      setShape(s.value)
                      // If current size isn't valid for the new shape, snap to that shape's first preset
                      const validSizes = getSizesForShape(s.value)
                      if (!validSizes.includes(size)) setSize(validSizes[0])
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium border transition-all text-left ${
                      shape === s.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <ShapeIcon shape={s.value} />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">Material</h3>
              <div className="grid grid-cols-2 gap-3">
                {materialData.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMaterial(m.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      material === m.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full shadow-inner"
                      style={{ background: m.bg, boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.15)' }}
                    />
                    <span className={`text-xs font-medium ${material === m.value ? 'text-primary' : 'text-muted-foreground'}`}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">
                {shape === 'Circle' ? 'Diameter' : shape === 'Rectangle' ? 'Size, inch (W × H)' : 'Size, inch (W × H)'}
              </h3>
              <div className="space-y-2">
                {getSizesForShape(shape).map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium border transition-all text-left ${
                      size === s
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {formatSizeForShape(s, shape)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">Quantity</h3>
              <div className="space-y-2">
                {qtyOptions.map(q => {
                  const total = getQtyTotal(q)
                  const disc = getDiscount(q)
                  const isActive = !customQty && quantity === q
                  return (
                    <button
                      key={q}
                      onClick={() => { setQuantity(q); setCustomQty('') }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
                        isActive
                          ? 'border-primary bg-primary text-white'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span>{q} pcs</span>
                      <span className="flex items-center gap-2">
                        <span className="font-bold">${total}</span>
                        {disc > 0 && (
                          <span className={`text-xs font-semibold ${isActive ? 'text-white/70' : 'text-green-400'}`}>
                            -{disc}%
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
                {/* Custom quantity */}
                <div className={`rounded-xl border transition-all ${customQty ? (effectiveQty < MIN_QTY ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-primary bg-primary/10') : 'border-border'}`}>
                  <p className="text-xs text-muted-foreground text-center pt-3 pb-1.5">Custom quantity · min {MIN_QTY}</p>
                  <div className="flex items-center gap-2 px-3 pb-3">
                    <input
                      type="number"
                      min={MIN_QTY}
                      placeholder={`Enter qty (${MIN_QTY}+)`}
                      value={customQty}
                      onChange={e => setCustomQty(e.target.value)}
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm font-bold">
                      ${customQty ? getQtyTotal(parseInt(customQty) || MIN_QTY) : getQtyTotal(quantity)}
                    </span>
                  </div>
                  {customQty && effectiveQty < MIN_QTY && (
                    <p className="text-[11px] text-yellow-500 px-3 pb-3 -mt-1">
                      Minimum {MIN_QTY} pieces per order.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom 3-column section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Artwork card */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <h3 className="font-bold text-lg mb-1">Do you have artwork ready?</h3>
              <p className="text-sm text-muted-foreground mb-6">Let us know so we can help you best</p>
              <div className="space-y-3 w-full max-w-xs">
                <button
                  onClick={() => setDesignAddon(!designAddon)}
                  className={`w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl border text-sm font-medium transition-all ${
                    designAddon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'bg-muted border-border hover:border-primary/30'
                  }`}
                >
                  <Sparkles size={16} className={designAddon ? 'text-primary' : 'text-primary'} />
                  {designAddon ? <span>Design help added · +${ADDON_DESIGN.price}</span> : <span>I need a design · +${ADDON_DESIGN.price}</span>}
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl bg-muted border border-border text-sm font-medium hover:border-primary/30 transition-all"
                >
                  <FileUp size={16} className="text-primary" /> I have a design
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf,.ai,.eps,.svg"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                {artworkFile && (
                  <p className="text-xs text-primary font-medium mt-2">
                    &#10003; {artworkFile.name}
                  </p>
                )}
                {artworkStatus === 'uploading' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading artwork so it stays with the order...
                  </p>
                )}
                {artworkStatus === 'uploaded' && (
                  <p className="text-xs text-green-400 mt-1">
                    Artwork saved with this cart item.
                  </p>
                )}
                {artworkStatus === 'error' && (
                  <p className="text-xs text-destructive mt-1">
                    {artworkError}
                  </p>
                )}
                {artworkFile && !artworkUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    File received for proof. Upload PNG, JPG, or SVG for live preview.
                  </p>
                )}
              </div>
            </div>

            {/* Mockup preview */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center">
              {/* View toggle */}
              <div className="flex gap-1 bg-muted/60 p-1 rounded-full mb-6">
                {stickerFormats.map(format => {
                  const FormatIcon = format.icon
                  return (
                    <button
                      key={format.value}
                      onClick={() => setMockupView(format.value)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        mockupView === format.value
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <FormatIcon size={13} /> {format.label}
                    </button>
                  )
                })}
              </div>

              {/* Preview area */}
              <div className="flex-1 flex items-center justify-center w-full min-h-[240px] py-4">
                {mockupView === 'handheld' && (
                  <StickerMockup
                    shape={shape}
                    artworkUrl={artworkUrl}
                    variant="single"
                  />
                )}
                {mockupView === 'sheet' && (
                  <StickerMockup
                    shape={shape}
                    artworkUrl={artworkUrl}
                    variant="sheet"
                  />
                )}
                {mockupView === 'roll' && (
                  <StickerMockup
                    shape={shape}
                    artworkUrl={artworkUrl}
                    variant="roll"
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {artworkUrl ? 'Preview of your design' : 'Upload artwork to see your design applied'}
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-center text-muted-foreground mb-4">
                Order Summary
              </h3>
              <div className="text-center mb-4">
                <p className="text-xl font-black">{effectiveQty} stickers</p>
                <p className="text-sm text-muted-foreground">{shapeLabel} &middot; {formatSizeForShape(size, shape)}</p>
                <p className="text-sm text-muted-foreground">{materialLabel}</p>
                <p className="text-sm text-primary">{formatLabel}</p>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-border/60 pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{effectiveQty} × ${basePrice.toFixed(2)} base</span>
                  <span className="tabular-nums">${(basePrice * effectiveQty).toFixed(2)}</span>
                </div>
                {sizeMult !== 1 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{formatSizeForShape(size, shape)} size (×{sizeMult.toFixed(1)})</span>
                    <span className="tabular-nums">+${(basePrice * effectiveQty * (sizeMult - 1)).toFixed(2)}</span>
                  </div>
                )}
                {matMult !== 1 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{materialLabel} (×{matMult.toFixed(1)})</span>
                    <span className="tabular-nums">+${(basePrice * effectiveQty * sizeMult * (matMult - 1)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border/40 mt-1">
                  <span>Stickers subtotal</span>
                  <span className="font-semibold tabular-nums">${stickerSubtotal.toFixed(2)}</span>
                </div>
                {rushAddon && (
                  <div className="flex justify-between text-primary">
                    <span>+ Rush (2-day)</span>
                    <span className="tabular-nums">+${ADDON_RUSH.price}</span>
                  </div>
                )}
                {designAddon && (
                  <div className="flex justify-between text-primary">
                    <span>+ Design Assist</span>
                    <span className="tabular-nums">+${ADDON_DESIGN.price}</span>
                  </div>
                )}
              </div>

              {/* Rush toggle inline */}
              <button
                onClick={() => setRushAddon(!rushAddon)}
                className={`mt-4 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  rushAddon
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap size={13} />
                  Add Rush · 2-day production
                </span>
                <span className="tabular-nums">+${ADDON_RUSH.price}</span>
              </button>

              <div className="border-t border-border pt-4 mt-4 text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total</p>
                <p className="text-4xl font-black">${totalPrice.toFixed(2)}</p>
                <p className="text-xs text-primary mt-1.5">&asymp; ${perUnit.toFixed(3)}/ea</p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={effectiveQty < MIN_QTY || (Boolean(artworkFile) && artworkStatus !== 'uploaded')}
                className={`btn-primary w-full mt-5 ${added ? 'bg-green-600' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:!transform-none`}
              >
                {effectiveQty < MIN_QTY ? (
                  <>Minimum {MIN_QTY} to add</>
                ) : artworkFile && artworkStatus === 'uploading' ? (
                  <>Saving artwork...</>
                ) : artworkFile && artworkStatus === 'error' ? (
                  <>Fix artwork upload first</>
                ) : added ? (
                  <><Check size={18} /> Added to Cart!</>
                ) : (
                  <><ShoppingCart size={18} /> Add to Cart</>
                )}
              </button>
              {effectiveQty > 2500 && (
                <a
                  href={`/contact?service=Bulk+Sticker+Order&qty=${effectiveQty}&size=${encodeURIComponent(size)}&material=${encodeURIComponent(material)}`}
                  className="block mt-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-3 text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    Bulk quote available
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {effectiveQty.toLocaleString()}+ pieces? We'll beat this price — request a custom quote →
                  </p>
                </a>
              )}
              <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                Digital proof within 24 hours. Nothing prints until you approve.
              </p>
            </div>
          </motion.div>

          {/* Specs grid — trust signal, small, under the cart not blocking it */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {stickerSpecs.map((s) => (
              <div key={s.label} className="bg-card/60 border border-border rounded-xl p-4">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-xs font-semibold leading-snug">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
                Bay Area sticker printing
              </p>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Custom stickers for Bay Area brands, artists, shops, and events.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The Sticker Smith prints custom stickers in Hayward for customers across the East Bay and the wider Bay Area. If you need a small run for a launch, waterproof vinyl for packaging, or a fast reorder before an event, you can approve your proof online and pick up locally at the shop.
                </p>
                <p>
                  Every order gets a real digital proof before production. We check cut lines, bleed, sizing, material choice, and whether your artwork will hold up as a sticker before anything hits the printer.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {cityLinks.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/${city.slug}`}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {city.name} stickers
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-3"
            >
              {stickerFormatLinks.map((type) => (
                <Link key={type.label} to={type.href} className="group bg-card/70 border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                  <StickerIcon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{type.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {type.detail}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    See details <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-12 md:py-16 border-t border-border/50 bg-card scroll-mt-24">
        <div className="section-container max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Real Sticker Work</p>
            <h2 className="text-3xl md:text-4xl font-black">Proof from Bay Area sticker and packaging projects.</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              From local brand drops to product packaging, these are real Sticker Smith projects: printed stickers, die-cut artwork, circular labels, and custom mylar packaging that uses sticker-style branding on retail bags.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stickerProofProjects.map((project) => (
              <Link
                key={project.slug}
                to="/projects"
                className="group bg-background border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black">
                  <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90 mb-1">{project.category}</p>
                  <h3 className="font-bold text-sm mb-1">{project.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{project.scope || project.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/projects" className="btn-secondary text-sm">See More Sticker Projects</Link>
            <Link to="/mylar" className="text-sm font-bold text-primary hover:underline">Custom mylar packaging</Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Sticker FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black">Bay Area custom sticker questions</h2>
          </div>
          <div className="grid gap-4">
            {stickerFaqs.map((faq) => (
              <div key={faq.q} className="bg-card/70 border border-border rounded-xl p-5">
                <h3 className="font-bold text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container">
          <StudioMockup
            service="Sticker"
            title="Preview the sticker shape before you order."
            subtitle="Upload artwork to see it as a die-cut, circle, square, or rectangle sticker."
            scenes={[
              { key: 'die-cut', label: 'Die-Cut', shape: 'sticker-die-cut' },
              { key: 'circle', label: 'Circle', shape: 'sticker-circle' },
              { key: 'square', label: 'Square', shape: 'sticker-square' },
              { key: 'rect', label: 'Rectangle', shape: 'sticker-rect' },
            ]}
          />
        </div>
      </section>

    </>
  )
}
