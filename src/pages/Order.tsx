import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, FileUp, Check, Clock, MapPin, Shield, Zap, Palette, Droplets, Sticker as StickerIcon, CheckCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getPricing, getBasePrice, getMaterialMultiplier, getSizeMultiplier } from '@/lib/pricing'
import PortfolioStrip from '@/components/PortfolioStrip'
import stkDieCut from '@/assets/projects/stickers-die-cut-stack.jpg'
import stkHolo from '@/assets/projects/stickers-holographic.jpg'
import stkLaptop from '@/assets/projects/stickers-on-laptop.jpg'
import stkSheet from '@/assets/projects/stickers-sheet.jpg'
import stkRoll from '@/assets/projects/stickers-roll.jpg'
import stkMatte from '@/assets/projects/stickers-matte-detail.jpg'

const stickerFeatures = [
  'Die-Cut & Kiss-Cut',
  'Sheets & Rolls',
  'Custom Shapes + Sizes',
  'Matte, Gloss, Clear, Holographic',
  'Paper, Embossed & UV Finish',
  'Weatherproof + UV-Resistant',
]

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

const materialData = [
  { value: 'Matte Vinyl', label: 'Matte', bg: 'radial-gradient(circle at 35% 35%, #f0ece8, #ccc7c0)' },
  { value: 'Glossy Vinyl', label: 'Gloss', bg: 'radial-gradient(circle at 35% 35%, #e0e0e4, #b0b0b6)' },
  { value: 'Clear', label: 'Clear', bg: 'radial-gradient(circle at 35% 35%, #bbbbc0, #88888e)' },
  { value: 'Holographic', label: 'Holographic', bg: 'linear-gradient(135deg, #e4c8f8, #c4b5fd, #93c5fd)' },
  { value: 'Paper', label: 'Paper', bg: 'radial-gradient(circle at 35% 35%, #f5e8a0, #d4c060)' },
  { value: 'Embossed/UV', label: 'Embossed/UV', bg: 'radial-gradient(circle at 35% 35%, #ffffff, #d8d8d8)' },
]

const sizeOptions = ['2" x 2"', '3" x 3"', '4" x 4"', '5" x 5"', '6" x 6"', '7" x 7"']
const qtyOptions = [50, 100, 250, 500, 1000, 2500]

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
  const [shape, setShape] = useState('Die-Cut')
  const [material, setMaterial] = useState('Matte Vinyl')
  const [quantity, setQuantity] = useState(50)
  const [customQty, setCustomQty] = useState('')
  const [size, setSize] = useState('2" x 2"')
  const [mockupView, setMockupView] = useState<'handheld' | 'sheet' | 'roll'>('handheld')
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkUrl, setArtworkUrl] = useState('')
  const [added, setAdded] = useState(false)
  const [rushAddon, setRushAddon] = useState(false)
  const [designAddon, setDesignAddon] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const pricingConfig = useMemo(() => getPricing(), [])

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

  const handleFile = (file: File) => {
    setArtworkFile(file)
    setArtworkUrl(URL.createObjectURL(file))
  }

  const handleAddToCart = () => {
    const addOns: { name: string; price: number }[] = []
    if (rushAddon) addOns.push({ name: ADDON_RUSH.label, price: ADDON_RUSH.price })
    if (designAddon) addOns.push({ name: ADDON_DESIGN.label, price: ADDON_DESIGN.price })
    addItem({
      id: `sticker-${Date.now()}`,
      name: `${shapeLabel} ${materialLabel} Stickers`,
      size,
      option: `${effectiveQty} pcs`,
      price: stickerSubtotal,
      quantity: 1,
      material,
      shape,
      dimensions: size,
      addOns: addOns.length > 0 ? addOns : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="relative -mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`, backgroundSize: '60px 60px', opacity: 0.02 }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <StickerIcon className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Custom Stickers</h1>
          <p className="text-white/80 text-lg">Die-cut, kiss-cut, holographic, matte — all on premium vinyl, with a proof before we print.</p>
        </motion.div>
      </div>

      {/* What We Offer + Specs */}
      <section className="py-8 md:py-12">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-6"
          >
            <h2 className="text-2xl font-black mb-6">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {stickerFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stickerSpecs.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-sm font-semibold leading-snug">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="section-container">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8">Build your order</h2>
          {/* 4-column configurator */}
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
                    onClick={() => setShape(s.value)}
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
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">Size, inch (WxH)</h3>
              <div className="space-y-2">
                {sizeOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium border transition-all text-left ${
                      size === s
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {s}
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
                <div className={`rounded-xl border transition-all ${customQty ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <p className="text-xs text-muted-foreground text-center pt-3 pb-1.5">Custom quantity</p>
                  <div className="flex items-center gap-2 px-3 pb-3">
                    <input
                      type="number"
                      min={1}
                      placeholder="Enter qty"
                      value={customQty}
                      onChange={e => setCustomQty(e.target.value)}
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm font-bold">
                      ${customQty ? getQtyTotal(parseInt(customQty) || 50) : getQtyTotal(quantity)}
                    </span>
                  </div>
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
                  accept="image/*,.pdf,.ai,.svg"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                {artworkFile && (
                  <p className="text-xs text-primary font-medium mt-2">
                    &#10003; {artworkFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Mockup preview */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center">
              {/* View toggle */}
              <div className="flex gap-1 bg-muted/60 p-1 rounded-full mb-6">
                {(['handheld', 'sheet', 'roll'] as const).map(v => {
                  const icons: Record<string, string> = { handheld: '\u270B', sheet: '\uD83D\uDCCB', roll: '\uD83D\uDCDC' }
                  const labels: Record<string, string> = { handheld: 'Hand-held', sheet: 'Sheet', roll: 'Roll' }
                  return (
                    <button
                      key={v}
                      onClick={() => setMockupView(v)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        mockupView === v
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-[11px]">{icons[v]}</span> {labels[v]}
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
                <p className="text-sm text-muted-foreground">{shapeLabel} &middot; {size}</p>
                <p className="text-sm text-muted-foreground">{materialLabel}</p>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-border/60 pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{effectiveQty} × ${basePrice.toFixed(2)} base</span>
                  <span className="tabular-nums">${(basePrice * effectiveQty).toFixed(2)}</span>
                </div>
                {sizeMult !== 1 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{size} size (×{sizeMult.toFixed(1)})</span>
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
                className={`btn-primary w-full mt-5 ${added ? 'bg-green-600' : ''}`}
              >
                {added ? (
                  <><Check size={18} /> Added to Cart!</>
                ) : (
                  <><ShoppingCart size={18} /> Add to Cart</>
                )}
              </button>
              {effectiveQty >= 2000 && (
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

        </div>
      </section>

      {/* Portfolio */}
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <PortfolioStrip
            title="Sticker Work"
            subtitle="Die-cut, holographic, sheets, rolls — we've printed them all."
            projects={[
              { src: stkDieCut, alt: 'Die-cut sticker stack', caption: 'Die-cut vinyl' },
              { src: stkHolo, alt: 'Holographic stickers', caption: 'Holographic' },
              { src: stkLaptop, alt: 'Stickers on laptop', caption: 'In the wild' },
              { src: stkSheet, alt: 'Sticker sheet', caption: 'Kiss-cut sheets' },
              { src: stkRoll, alt: 'Sticker roll', caption: 'Rolls for retail' },
              { src: stkMatte, alt: 'Matte sticker detail', caption: 'Matte detail' },
            ]}
          />
        </div>
      </section>
    </>
  )
}
