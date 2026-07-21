import { useEffect, useState, useRef, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X } from 'lucide-react'

export type MockupSlot = {
  left: number // %
  top: number // %
  width: number // %
  height: number // %
  rotate?: number // deg
  skewX?: number // deg, for fake perspective
  perspective?: number // px
  opacity?: number // 0-1
  blendMode?: React.CSSProperties['mixBlendMode']
  radius?: string
  clipPath?: string
  imageFit?: React.CSSProperties['objectFit']
  imagePosition?: React.CSSProperties['objectPosition']
  artworkPadding?: React.CSSProperties['padding']
}

export type MockupScene = {
  key: string
  label: string
  base?: string
  variant?: 'photo' | 'retractable-banner' | 'table-cover'
  slot: MockupSlot
}

type Props = {
  service: string
  scenes: MockupScene[]
  eyebrow?: string
  title?: string
  subtitle?: string
  activeKey?: string
  onActiveKeyChange?: (key: string) => void
}

function canPreviewArtwork(file: File) {
  return file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')
}

export default function ArtworkMockup({
  service,
  scenes,
  eyebrow = 'See Your Design',
  title,
  subtitle = "Upload your artwork and see exactly how it'll look.",
  activeKey: controlledActiveKey,
  onActiveKeyChange,
}: Props) {
  const [internalActiveKey, setInternalActiveKey] = useState(scenes[0]?.key ?? '')
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [artworkName, setArtworkName] = useState<string | null>(null)
  const [artworkFit, setArtworkFit] = useState<'contain' | 'cover'>('contain')
  const [artworkScale, setArtworkScale] = useState(100)
  const [loadedScenes, setLoadedScenes] = useState<Set<string>>(new Set())
  const [failedScenes, setFailedScenes] = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)

  const activeKey = controlledActiveKey ?? internalActiveKey
  const scene = scenes.find((s) => s.key === activeKey) ?? scenes[0]
  const sceneLoaded = scene ? !scene.base || loadedScenes.has(scene.key) : false
  const sceneFailed = scene ? failedScenes.has(scene.key) : false

  useEffect(() => {
    return () => {
      if (artworkUrl) URL.revokeObjectURL(artworkUrl)
    }
  }, [artworkUrl])

  if (!scene) return null

  const setActiveKey = (key: string) => {
    if (!controlledActiveKey) setInternalActiveKey(key)
    onActiveKeyChange?.(key)
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setArtworkUrl(canPreviewArtwork(f) ? URL.createObjectURL(f) : null)
    setArtworkName(f.name)
    setArtworkFit('contain')
    setArtworkScale(100)
  }

  const clear = () => {
    setArtworkUrl(null)
    setArtworkName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const surface = getSurfaceStyle(service, scene.key)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{eyebrow}</p>
        <h2 className="text-2xl md:text-4xl font-black mb-3">{title ?? `Preview on a ${service} scene`}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
      </div>

      {/* Scene switcher */}
      {scenes.length > 1 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {scenes.map((s) => {
            const active = s.key === activeKey
            return (
              <button
                key={s.key}
                onClick={() => setActiveKey(s.key)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
      {/* Mockup canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-2xl aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3]">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {!sceneLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.16),rgba(12,12,16,0.96)_58%)]">
                <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-white/70">
                  {sceneFailed ? `${scene.label} mockup unavailable` : `Loading ${scene.label} mockup`}
                </div>
              </div>
            )}
            {scene.variant === 'retractable-banner' && (
              <div className="absolute inset-0 flex items-end justify-center bg-[radial-gradient(circle_at_50%_12%,rgba(56,189,248,0.16),rgba(12,12,16,0.92)_58%)] px-8 pb-10">
                <div className="relative h-[82%] w-[28%] min-w-48">
                  <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full bg-neutral-700 shadow-lg" />
                  <div className="absolute inset-x-0 top-2 h-[82%] rounded-t-lg border border-white/15 bg-gradient-to-b from-white/95 to-neutral-200 shadow-2xl" />
                  <div className="absolute inset-x-[-10%] bottom-0 h-7 rounded-full bg-neutral-800 shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />
                  <div className="absolute left-1/2 bottom-6 h-9 w-28 -translate-x-1/2 rounded-b-xl bg-neutral-700 shadow-xl" />
                </div>
              </div>
            )}
            {scene.variant === 'table-cover' && (
              <div className="absolute inset-0 flex items-end justify-center bg-[radial-gradient(circle_at_50%_12%,rgba(56,189,248,0.14),rgba(12,12,16,0.92)_58%)] px-8 pb-16">
                <div className="relative h-[44%] w-[62%] max-w-2xl">
                  <div className="absolute inset-x-[8%] top-0 h-[22%] rounded-t-xl bg-neutral-200 shadow-[0_12px_28px_rgba(0,0,0,0.28)]" />
                  <div
                    className="absolute inset-x-0 top-[14%] h-[76%] rounded-b-2xl border border-white/15 bg-gradient-to-b from-white via-neutral-100 to-neutral-300 shadow-2xl"
                    style={{ clipPath: 'polygon(4% 0, 96% 0, 100% 100%, 0 100%)' }}
                  />
                  <div className="absolute bottom-0 left-[8%] h-[80%] w-px bg-black/10" />
                  <div className="absolute bottom-0 right-[8%] h-[80%] w-px bg-black/10" />
                  <div className="absolute inset-x-[4%] bottom-[-10%] h-8 rounded-full bg-black/35 blur-md" />
                </div>
              </div>
            )}
            {scene.base && !sceneFailed && (
              <img
                src={scene.base}
                alt={scene.label}
                loading="eager"
                decoding="async"
                onLoad={() => setLoadedScenes(prev => new Set(prev).add(scene.key))}
                onError={() => setFailedScenes(prev => new Set(prev).add(scene.key))}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${sceneLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

            {/* Artwork slot overlay */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${scene.slot.left}%`,
                top: `${scene.slot.top}%`,
                width: `${scene.slot.width}%`,
                height: `${scene.slot.height}%`,
                transform: [
                  scene.slot.perspective ? `perspective(${scene.slot.perspective}px)` : '',
                  scene.slot.rotate ? `rotate(${scene.slot.rotate}deg)` : '',
                  scene.slot.skewX ? `skewX(${scene.slot.skewX}deg)` : '',
                ]
                  .filter(Boolean)
                  .join(' '),
                opacity: scene.slot.opacity ?? 1,
                mixBlendMode: scene.slot.blendMode ?? 'normal',
                transformOrigin: 'center',
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden"
                style={{
                  clipPath: scene.slot.clipPath,
                  borderRadius: scene.slot.radius ?? surface.radius,
                  background: surface.background,
                  border: surface.border,
                  boxShadow: surface.shadow,
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: surface.sheen,
                    mixBlendMode: surface.sheenBlend,
                    opacity: surface.sheenOpacity,
                  }}
                />
              {artworkUrl ? (
                <img
                  src={artworkUrl}
                  alt="Your artwork"
                    className="relative z-10 h-full w-full"
                  style={{
                      padding: artworkFit === 'contain' ? (scene.slot.artworkPadding ?? '5%') : 0,
                      objectFit: artworkFit,
                      objectPosition: scene.slot.imagePosition ?? 'center',
                      filter: surface.artworkFilter,
                      transform: `scale(${artworkScale / 100})`,
                      transformOrigin: 'center',
                  }}
                />
              ) : (
                  <SampleArtwork service={service} sceneKey={scene.key} surface={surface.kind} />
              )}
              </div>
            </div>

            {/* Corner hint */}
            <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/80">
              {scene.label}
            </div>
            <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/60 backdrop-blur-sm">
              preview only
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload and artwork controls */}
      <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Make it yours</p>
        <h3 className="mt-2 text-xl font-black">Use your actual artwork</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Upload a logo or finished design, then switch products without uploading again.</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.ai,.eps,.svg"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-primary mt-5 min-h-12 w-full justify-center"
        >
          <Upload size={16} /> {artworkName ? 'Change file' : 'Upload your artwork'}
        </button>
        {artworkName ? (
          <div className="mt-3 text-sm">
            <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <span className="truncate font-semibold text-primary">{artworkName}</span>
              <button
                type="button"
                onClick={clear}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="Remove artwork"
              >
                <X size={14} />
              </button>
            </div>
            {!artworkUrl && (
              <p className="mt-2 text-xs text-muted-foreground">Proof file received. Upload PNG, JPG, or SVG for a live preview.</p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            PNG, JPG, or SVG for live preview. PDF, AI, and EPS are still accepted for the production proof.
          </p>
        )}

        {artworkUrl && (
          <div className="mt-5 space-y-5 border-t border-border pt-5">
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Artwork layout</legend>
              <div className="grid grid-cols-2 rounded-lg border border-border bg-background p-1">
                {(['contain', 'cover'] as const).map((fit) => (
                  <button
                    type="button"
                    key={fit}
                    onClick={() => setArtworkFit(fit)}
                    aria-pressed={artworkFit === fit}
                    className={`rounded-md px-3 py-2 text-xs font-bold transition-colors ${artworkFit === fit ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {fit === 'contain' ? 'Fit logo' : 'Fill area'}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Artwork size <span className="float-right text-foreground">{artworkScale}%</span>
              <input
                type="range"
                min="70"
                max="140"
                step="5"
                value={artworkScale}
                onChange={(event) => setArtworkScale(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--color-primary)]"
              />
            </label>
          </div>
        )}

        <p className="mt-5 border-t border-border pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">
          Preview only. The production proof confirms crop, scale, color, and placement before printing.
        </p>
      </aside>
      </div>
    </div>
  )
}

type SurfaceKind = 'print' | 'vinyl' | 'glass'

function getSurfaceStyle(service: string, sceneKey: string): {
  kind: SurfaceKind
  background: string
  border: string
  shadow: string
  sheen: string
  sheenBlend: React.CSSProperties['mixBlendMode']
  sheenOpacity: number
  artworkFilter: string
  objectFit: React.CSSProperties['objectFit']
  radius: string
} {
  const lower = `${service} ${sceneKey}`.toLowerCase()
  if (lower.includes('window') || lower.includes('glass') || lower.includes('film')) {
    return {
      kind: 'glass',
      background: 'rgba(240, 248, 255, 0.18)',
      border: '1px solid rgba(255,255,255,0.24)',
      shadow: 'inset 0 1px 18px rgba(255,255,255,0.08), 0 10px 24px rgba(0,0,0,0.18)',
      sheen: 'linear-gradient(115deg, rgba(255,255,255,0.34), transparent 36%, rgba(255,255,255,0.1) 64%, transparent)',
      sheenBlend: 'screen',
      sheenOpacity: 0.75,
      artworkFilter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.22)) saturate(0.85)',
      objectFit: 'contain',
      radius: '6px',
    }
  }
  if (lower.includes('vehicle') || lower.includes('van') || lower.includes('truck') || lower.includes('sedan')) {
    return {
      kind: 'vinyl',
      background: 'transparent',
      border: '0',
      shadow: 'none',
      sheen: 'linear-gradient(105deg, rgba(255,255,255,0.26), transparent 24%, rgba(0,0,0,0.13) 54%, rgba(255,255,255,0.12) 76%, transparent)',
      sheenBlend: 'overlay',
      sheenOpacity: 0.62,
      artworkFilter: 'saturate(0.94) contrast(0.96) brightness(0.96)',
      objectFit: 'contain',
      radius: '8px',
    }
  }
  return {
    kind: 'print',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(232,238,244,0.94))',
    border: '1px solid rgba(255,255,255,0.38)',
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -10px 24px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.28)',
    sheen: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.42) 38%, transparent 48%)',
    sheenBlend: 'screen',
    sheenOpacity: 0.55,
    artworkFilter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.16))',
    objectFit: 'contain',
    radius: '5px',
  }
}

function SampleArtwork({
  service,
  sceneKey,
  surface,
}: {
  service: string
  sceneKey: string
  surface: SurfaceKind
}) {
  const lower = `${service} ${sceneKey}`.toLowerCase()
  const light = surface === 'print'
  const glass = surface === 'glass'
  const primary = glass ? 'text-white' : light ? 'text-neutral-950' : 'text-white'
  const secondary = glass ? 'text-white/70' : light ? 'text-neutral-600' : 'text-white/70'
  const eventScene = lower.includes('event') || lower.includes('flag') || lower.includes('canopy') || lower.includes('backdrop') || lower.includes('table')
  const accent = eventScene ? 'bg-amber-400' : lower.includes('window') || lower.includes('glass') ? 'bg-white/70' : 'bg-cyan-400'

  if (lower.includes('flag')) {
    return (
      <div className={`relative z-10 flex h-full w-full flex-col items-center justify-center px-[12%] text-center ${primary}`}>
        <div className={`mb-[12%] flex aspect-square w-[42%] items-center justify-center rounded-full ${accent} text-[clamp(9px,1.5vw,20px)] font-black text-neutral-950 shadow-lg`}>BC</div>
        <p className="text-[clamp(8px,1.25vw,17px)] font-black uppercase leading-[0.9] tracking-tight">Bay City</p>
        <p className={`${secondary} mt-[8%] text-[clamp(5px,0.65vw,9px)] font-bold uppercase leading-tight tracking-[0.16em]`}>Coffee<br />+ Goods</p>
      </div>
    )
  }

  if (lower.includes('aframe')) {
    return (
      <div className={`relative z-10 flex h-full w-full flex-col items-center justify-center p-[8%] text-center ${primary}`}>
        <p className={`${secondary} text-[clamp(6px,0.65vw,10px)] font-black uppercase tracking-[0.22em]`}>Cypress Coffee</p>
        <p className="mt-[5%] text-[clamp(13px,2.8vw,34px)] font-black uppercase leading-[0.78] tracking-tighter">Open<br />Today</p>
        <div className={`my-[7%] h-1 w-1/2 rounded-full ${accent}`} />
        <p className={`${secondary} text-[clamp(5px,0.65vw,9px)] font-bold uppercase tracking-wider`}>Coffee · pastries · pickup</p>
      </div>
    )
  }

  if (lower.includes('retractable')) {
    return (
      <div className={`relative z-10 flex h-full w-full flex-col justify-between p-[10%] ${primary}`}>
        <div className={`flex aspect-square w-[26%] items-center justify-center rounded-full ${accent} text-[clamp(7px,1vw,14px)] font-black text-neutral-950`}>TS</div>
        <div>
          <p className="text-[clamp(11px,2.1vw,28px)] font-black uppercase leading-[0.86] tracking-tighter">Make<br />Your Mark.</p>
          <div className={`my-[8%] h-1 w-2/3 rounded-full ${accent}`} />
          <p className={`${secondary} text-[clamp(5px,0.55vw,8px)] font-bold uppercase leading-relaxed tracking-[0.16em]`}>Stickers<br />Signage<br />Displays</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative z-10 flex h-full w-full items-center justify-center overflow-hidden p-[6%] ${glass ? 'backdrop-blur-[1px]' : ''}`}>
      <div className={`absolute -right-[8%] -top-[34%] aspect-square h-[120%] rounded-full ${accent} opacity-15`} />
      <div className="relative flex w-full items-center justify-center gap-[5%]">
        <div className={`flex aspect-square w-[18%] shrink-0 items-center justify-center rounded-full ${accent} text-[clamp(7px,1.4vw,18px)] font-black text-neutral-950 shadow-lg`}>
          {eventScene ? 'BC' : 'CC'}
        </div>
        <div className="text-left">
          <p className={`${primary} text-[clamp(9px,1.8vw,24px)] font-black uppercase leading-[0.9] tracking-tight`}>
            {eventScene ? 'Bay City Goods' : 'Cypress Coffee Co.'}
          </p>
          <p className={`${secondary} mt-[4%] text-[clamp(5px,0.75vw,10px)] font-bold uppercase tracking-[0.2em]`}>
            {eventScene ? 'Made for the Bay' : 'Hayward · California'}
          </p>
        </div>
      </div>
    </div>
  )
}
