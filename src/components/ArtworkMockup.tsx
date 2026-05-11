import { useState, useRef, type ChangeEvent } from 'react'
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
}

export type MockupScene = {
  key: string
  label: string
  base: string
  slot: MockupSlot
}

type Props = {
  service: string
  scenes: MockupScene[]
  eyebrow?: string
  title?: string
  subtitle?: string
}

export default function ArtworkMockup({
  service,
  scenes,
  eyebrow = 'See Your Design',
  title,
  subtitle = "Upload your artwork and see exactly how it'll look.",
}: Props) {
  const [activeKey, setActiveKey] = useState(scenes[0]?.key ?? '')
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [artworkName, setArtworkName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const scene = scenes.find((s) => s.key === activeKey) ?? scenes[0]
  if (!scene) return null

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setArtworkUrl(URL.createObjectURL(f))
    setArtworkName(f.name)
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
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {scenes.map((s) => {
            const active = s.key === activeKey
            return (
              <button
                key={s.key}
                onClick={() => setActiveKey(s.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
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

      {/* Mockup canvas */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-black shadow-2xl aspect-[4/3] md:aspect-[16/9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img src={scene.base} alt={scene.label} className="absolute inset-0 h-full w-full object-cover" />
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
                    className="relative z-10 h-full w-full p-[5%]"
                  style={{
                      objectFit: surface.objectFit,
                      filter: surface.artworkFilter,
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

      {/* Upload bar */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 bg-card border border-border rounded-lg p-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.ai,.svg"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-primary w-full sm:w-auto"
        >
          <Upload size={16} /> {artworkUrl ? 'Change artwork' : 'Upload your artwork'}
        </button>
        {artworkName ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-semibold truncate max-w-[200px]">{artworkName}</span>
            <button
              onClick={clear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Remove artwork"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            PNG, JPG, PDF, AI, SVG · preview only, final proof follows
          </p>
        )}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        We adjust scale, crop, and placement in the real proof before production.
      </p>
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
      sheen: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent 34%, rgba(255,255,255,0.08) 68%, transparent)',
      sheenBlend: 'screen',
      sheenOpacity: 0.45,
      artworkFilter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.45))',
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
  const accent = lower.includes('event') || lower.includes('flag') || lower.includes('canopy')
    ? 'bg-yellow-400'
    : lower.includes('window') || lower.includes('glass')
      ? 'bg-white/60'
      : 'bg-cyan-400'

  return (
    <div className={`relative z-10 flex h-full w-full items-center justify-center p-[7%] ${glass ? 'backdrop-blur-[1px]' : ''}`}>
      <div className="absolute inset-[8%] rounded-md border border-current opacity-10" />
      <div className="text-center">
        <div className={`mx-auto mb-2 h-2 w-16 rounded-full ${accent} shadow-[0_0_14px_rgba(56,189,248,0.35)]`} />
        <p className={`${primary} text-[clamp(10px,1.8vw,24px)] font-black uppercase leading-none tracking-wide`}>
          Your Brand
        </p>
        <p className={`${secondary} mt-1 text-[clamp(7px,0.9vw,12px)] font-bold uppercase tracking-[0.22em]`}>
          Est. 2026
        </p>
      </div>
    </div>
  )
}
