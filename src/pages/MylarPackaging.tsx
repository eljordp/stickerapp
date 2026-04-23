import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Package, Sparkles, Box, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getPricing, type ProductCategory, type AddOn } from '@/lib/pricing'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import mylarBlack from '@/assets/projects/mylar-black-pouches.jpg'
import mylarGold from '@/assets/projects/mylar-gold-foil.jpg'
import mylarCannabis from '@/assets/projects/mylar-cannabis-style.jpg'
import mylarFood from '@/assets/projects/mylar-food-packaging.jpg'
import mylarDetail from '@/assets/projects/mylar-pouch-detail.jpg'
import mylarProduction from '@/assets/projects/mylar-production-line.jpg'
import mylarEighthBlank from '@/assets/mockups/mylar-eighth-blank.jpg'
import mylarQuarterBlank from '@/assets/mockups/mylar-quarter-blank.jpg'
import mylarJarBlank from '@/assets/mockups/mylar-jar-blank.jpg'

type MockupType = 'pouch' | 'foil' | 'jar'

function PouchMockup({ previewUrl, pouchColor, finish, scale }: { previewUrl: string | null; pouchColor: 'white' | 'black'; finish: string; scale: number }) {
  const w = 140 * scale
  const h = 200 * scale
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: `${w}px`, height: `${h}px`, background: pouchColor === 'white' ? 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 30%, #f5f5f5 50%, #e0e0e0 70%, #f0f0f0 100%)' : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 30%, #252525 50%, #1e1e1e 70%, #222 100%)' }}>
        <div className="absolute inset-0 opacity-40" style={{ background: finish === 'foil' ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.6) 25%, transparent 50%, rgba(255,255,255,0.4) 75%, transparent 100%)' : finish === 'gloss' ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 40%, transparent 60%)' : 'none' }} />
        <div className={`absolute top-3 left-3 right-3 h-1.5 rounded-full ${pouchColor === 'white' ? 'bg-zinc-300' : 'bg-zinc-600'}`} />
        <div className={`absolute top-5 left-3 right-3 h-0.5 rounded-full ${pouchColor === 'white' ? 'bg-zinc-200' : 'bg-zinc-700'}`} />
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
          {previewUrl ? <img src={previewUrl} alt="Your design" className="max-w-full max-h-full object-contain drop-shadow-lg" /> : <div className={`text-center ${pouchColor === 'white' ? 'text-zinc-400' : 'text-zinc-500'}`}><span className="text-xs">Your Design</span></div>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-2 ${pouchColor === 'white' ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-current" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-current" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-current" />
        </div>
      </div>
    </div>
  )
}

function FoilMockup({ previewUrl, scale }: { previewUrl: string | null; scale: number }) {
  const w = 140 * scale
  const h = 200 * scale
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: `${w}px`, height: `${h}px`, background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 15%, #ffd3b6 30%, #ffaaa5 45%, #ff8b94 60%, #a8e6cf 75%, #88d8b0 90%, #ffd3b6 100%)' }}>
        <div className="absolute inset-0 opacity-60" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.8) 25%, transparent 50%, rgba(255,255,255,0.6) 75%, transparent 100%)' }} />
        <div className="absolute top-3 left-3 right-3 h-1.5 rounded-full bg-white/40" />
        <div className="absolute top-5 left-3 right-3 h-0.5 rounded-full bg-white/30" />
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
          {previewUrl ? <img src={previewUrl} alt="Your design" className="max-w-full max-h-full object-contain drop-shadow-lg" /> : <div className="text-center text-white/70"><span className="text-xs">Your Design</span></div>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20" />
      </div>
    </div>
  )
}

function JarMockup({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative">
        <div className="relative w-24 h-28 rounded-lg overflow-hidden shadow-xl" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.1) 100%)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 rounded-t-lg" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)', border: '1px solid #444' }} />
          <div className="absolute top-6 left-0 right-0 bottom-3 flex items-center justify-center p-2">
            {previewUrl ? <img src={previewUrl} alt="Your label" className="max-w-full max-h-full object-contain" /> : <div className="text-center text-zinc-400"><span className="text-[10px]">Label Here</span></div>}
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)' }} />
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-zinc-700/50 flex items-center justify-center">
          <span className="text-[8px] text-zinc-400">Top Label</span>
        </div>
      </div>
    </div>
  )
}

// Scale factors for mockup sizing
const mockupScales: Record<string, number> = {
  'Eighths (3"×5")': 0.6,
  'Quarters (4"×6")': 0.75,
  'Ounce Bags (5"×8")': 0.85,
  'Half Pound (10"×12")': 1.0,
  'Pound Bags (14"×16")': 1.15,
  '2oz Jar + Custom Label': 0.7,
}

export default function MylarPackaging() {
  const { addItem } = useCart()
  const pricing = useMemo(() => getPricing(), [])
  const category = pricing.products.find(p => p.name === 'Mylar Packaging') as ProductCategory | undefined

  const [selectedItem, setSelectedItem] = useState(0)
  const [quantity, setQuantity] = useState(250)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [finish, setFinish] = useState<'matte' | 'gloss' | 'foil'>('matte')
  const [pouchColor, setPouchColor] = useState<'white' | 'black'>('white')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeMockup, setActiveMockup] = useState<MockupType>('pouch')
  const [added, setAdded] = useState(false)

  const items = category?.items ?? []
  const addOns = category?.addOns ?? []
  const item = items[selectedItem]

  // Find the right quantity tier
  const qtyTier = useMemo(() => {
    if (!item) return null
    // Find the tier where qty fits (use the closest lower tier)
    const sorted = [...item.quantities].sort((a, b) => a.qty - b.qty)
    let tier = sorted[0]
    for (const t of sorted) {
      if (quantity >= t.qty) tier = t
    }
    return tier
  }, [item, quantity])

  const unitPrice = qtyTier?.price ?? 0
  const addOnTotal = addOns.filter(a => selectedAddOns.has(a.name)).reduce((s, a) => s + a.value, 0)
  const totalPrice = +((unitPrice + addOnTotal) * quantity).toFixed(2)

  const scale = item ? (mockupScales[item.size] ?? 0.75) : 0.75
  const isJar = item?.size.toLowerCase().includes('jar')

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }, [])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
  }

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) } }, [previewUrl])

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next })
  }

  const handleAddToCart = () => {
    if (!item || !qtyTier) return
    const cartAddOns = addOns.filter(a => selectedAddOns.has(a.name)).map(a => ({ name: a.name, price: a.value }))
    addItem({
      id: `mylar-${item.size}-${Date.now()}`,
      name: `Custom ${item.size}`,
      size: item.size,
      option: `${quantity} pcs · ${finish} · ${pouchColor} · ${selectedAddOns.has('Holographic Upgrade') ? 'Holo' : 'Standard'}`,
      price: totalPrice,
      quantity: 1,
      addOns: cartAddOns.length > 0 ? cartAddOns : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!category) return <div className="section-container py-20 text-center text-muted-foreground">Mylar Packaging pricing not configured.</div>

  const mockupTabs = [
    { id: 'pouch' as MockupType, label: 'Mylar Pouch', icon: Package },
    { id: 'foil' as MockupType, label: 'Holographic', icon: Sparkles },
    { id: 'jar' as MockupType, label: 'Jar', icon: Box },
  ]

  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-3">Mylar Packaging Suite</p>
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-white">Custom Mylar Bags, Jars & Labels</h1>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            Quarter, 8th, ounce and pound bags, plus 2oz compliant jars. Holographic upgrades, windows and direct print available.
          </p>
        </motion.div>
      </div>

      <section className="py-8 md:py-16">
        <div className="section-container max-w-5xl mx-auto">
          {/* Upload + Mockup Preview */}
          <div className="grid gap-6 lg:grid-cols-2 mb-10">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`flex flex-col justify-center rounded-2xl border bg-card p-6 md:p-8 text-center transition-colors ${isDragging ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">Drag & drop your artwork</p>
                  <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, PDF, or SVG. You'll receive a proof before printing.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <span>Upload file</span>
                    <input type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={handleFileChange} />
                  </label>
                  {uploadedFile && (
                    <button onClick={() => { setUploadedFile(null); setPreviewUrl(null) }} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                      <X className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                </div>
                {uploadedFile && <p className="text-xs text-muted-foreground">Selected: <span className="font-medium text-foreground">{uploadedFile.name}</span></p>}
              </div>
            </motion.div>

            {/* Mockup Preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex justify-center gap-1 mb-4">
                {mockupTabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveMockup(tab.id)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${activeMockup === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                    <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-muted/50 border border-border">
                {activeMockup === 'pouch' && <PouchMockup previewUrl={previewUrl} pouchColor={pouchColor} finish={finish} scale={scale} />}
                {activeMockup === 'foil' && <FoilMockup previewUrl={previewUrl} scale={scale} />}
                {activeMockup === 'jar' && <JarMockup previewUrl={previewUrl} />}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {previewUrl ? 'Your design preview' : 'Upload artwork to see it mocked up'} — {item?.size ?? 'Select a size'}
              </p>
            </motion.div>
          </div>

          {/* Calculator Section */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* LEFT: Controls */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6 rounded-2xl border border-border bg-card p-5 md:p-6">
              {/* Pouch Size */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pouch Size</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((p, i) => (
                    <button key={p.size} onClick={() => { setSelectedItem(i); setActiveMockup(p.size.toLowerCase().includes('jar') ? 'jar' : 'pouch') }} className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${selectedItem === i ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                      {p.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish */}
              {!isJar && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finish</p>
                  <div className="flex flex-wrap gap-2">
                    {(['matte', 'gloss', 'foil'] as const).map(f => (
                      <button key={f} onClick={() => setFinish(f)} className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors capitalize ${finish === f ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pouch Color */}
              {!isJar && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pouch Color</p>
                  <div className="flex gap-3">
                    {(['white', 'black'] as const).map(c => (
                      <button key={c} onClick={() => setPouchColor(c)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors capitalize ${pouchColor === c ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                        <span className={`inline-flex h-4 w-4 rounded-full border border-border ${c === 'white' ? 'bg-white' : 'bg-black'}`} />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</p>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value) || 0)}
                  placeholder="Enter quantity (pcs)"
                />
              </div>

              {/* Add-Ons */}
              {addOns.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Options / Add-Ons</p>
                  <div className="flex flex-wrap gap-2">
                    {addOns.map((addon: AddOn) => (
                      <button key={addon.name} onClick={() => toggleAddOn(addon.name)} className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${selectedAddOns.has(addon.name) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                        {addon.name} (+${addon.value.toFixed(2)}/ea)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT: Price Calculator + CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
              {/* Calculator Results */}
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h2 className="text-lg font-semibold mb-3 text-center">Instant Price Estimate</h2>
                <p className="text-xs text-muted-foreground mb-4 text-center">Use this as a quick ballpark. We'll dial in exact pricing once we see your artwork.</p>

                {qtyTier && quantity > 0 && (
                  <div className="rounded-xl bg-muted px-4 py-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium text-right text-xs">{item?.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">{quantity.toLocaleString()} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit price</span>
                      <span className="font-semibold text-primary">${unitPrice.toFixed(2)}</span>
                    </div>
                    {selectedAddOns.size > 0 && addOns.filter(a => selectedAddOns.has(a.name)).map(a => (
                      <div key={a.name} className="flex justify-between">
                        <span className="text-muted-foreground">{a.name}</span>
                        <span>+${a.value.toFixed(2)}/ea</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-border pt-2 mt-2">
                      <span className="text-muted-foreground">Est. total</span>
                      <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  Final quote may adjust for finishing, rush timelines, and compliance.
                </p>
              </div>

              {/* Add to Cart */}
              {quantity > 0 && qtyTier && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                  <button onClick={handleAddToCart} className={`btn-primary w-full ${added ? 'bg-green-600' : ''}`}>
                    {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingCart size={18} /> Add to Cart — ${totalPrice.toFixed(2)}</>}
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">You'll receive a proof before anything prints.</p>
                </div>
              )}

              {/* Help CTA */}
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
                <p className="font-medium text-foreground mb-2">Need custom artwork help?</p>
                <p className="text-sm text-muted-foreground mb-4">Send your logo, strain list, and any compliance notes.</p>
                <a href="/contact" className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Fill out project form
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Mylar"
            title="See your art on a real bag"
            subtitle="Upload your design — preview it on a matte black pouch or jar with studio lighting."
            scenes={[
              {
                key: 'eighth',
                label: 'Eighth Pouch',
                base: mylarEighthBlank,
                slot: { left: 32, top: 24, width: 36, height: 52 },
              },
              {
                key: 'quarter',
                label: 'Quarter Pouch',
                base: mylarQuarterBlank,
                slot: { left: 30, top: 22, width: 40, height: 56 },
              },
              {
                key: 'jar',
                label: '2oz Jar',
                base: mylarJarBlank,
                slot: { left: 32, top: 38, width: 36, height: 30 },
              },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <PortfolioStrip
            title="Custom Mylar We've Printed"
            subtitle="Matte, foil, holographic — food, cannabis, retail."
            projects={[
              { src: mylarBlack, alt: 'Matte black mylar pouches', caption: 'Matte black trio' },
              { src: mylarGold, alt: 'Gold foil mylar pouches', caption: 'Gold foil stamping' },
              { src: mylarCannabis, alt: 'Cannabis-style mylar bags', caption: 'Premium cannabis packaging' },
              { src: mylarFood, alt: 'Food-grade mylar bags', caption: 'Food packaging' },
              { src: mylarDetail, alt: 'Mylar pouch detail shot', caption: 'Zipper + seal detail' },
              { src: mylarProduction, alt: 'Mylar production line', caption: 'Production run' },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <EstimateForm
            service="Mylar Packaging"
            title="Custom Mylar Quote"
            subtitle="Bulk, custom sizes, or complex artwork? Tell us the product and quantity and we'll send a tailored estimate in 24 hours."
            fields={[
              {
                name: 'productType',
                label: 'What are you packaging?',
                type: 'select',
                required: true,
                options: ['Food / Snacks', 'Coffee / Tea', 'Cannabis / CBD', 'Retail / Consumer Goods', 'Supplements / Health', 'Other'],
              },
              {
                name: 'bagSize',
                label: 'Bag size',
                type: 'select',
                required: true,
                options: ['Eighths (3"×5")', 'Quarters (4"×6")', 'Ounce (5"×8")', 'Half Pound (10"×12")', 'Pound (14"×16")', 'Custom size', 'Jar labels instead'],
              },
              { name: 'quantity', label: 'Estimated quantity', type: 'text', required: true, placeholder: 'e.g. 1,000 · 5,000 · 10,000+' },
              {
                name: 'artwork',
                label: 'Do you have artwork ready?',
                type: 'select',
                options: ['Yes — print-ready file', 'Have logo but need design help', 'Need full custom design'],
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
