import { useEffect, useState, useRef, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X } from 'lucide-react'

export type StudioShape =
  | 'business-card'
  | 'flyer'
  | 'postcard'
  | 'sticker-die-cut'
  | 'sticker-circle'
  | 'sticker-square'
  | 'sticker-rect'
  | 'mylar-pouch'
  | 'mylar-jar'

export type StudioScene = {
  key: string
  label: string
  shape: StudioShape
  /** Optional rotation override in degrees */
  rotate?: number
}

type Props = {
  service: string
  scenes: StudioScene[]
  eyebrow?: string
  title?: string
  subtitle?: string
  activeKey?: string
  onActiveKeyChange?: (key: string) => void
}

function canPreviewArtwork(file: File) {
  return file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')
}

/**
 * Aspect ratios for each shape (width / height).
 * Cards are landscape, flyers portrait, postcards landscape, stickers square-ish.
 */
const SHAPE_RATIO: Record<StudioShape, number> = {
  'business-card': 3.5 / 2,
  flyer: 8.5 / 11,
  postcard: 6 / 4,
  'sticker-die-cut': 1,
  'sticker-circle': 1,
  'sticker-square': 1,
  'sticker-rect': 4 / 3,
  'mylar-pouch': 0.62,
  // 2oz cannabis jar — squat, slightly wider than tall once you include the lid
  'mylar-jar': 1.0,
}

/**
 * Cards/postcards/flyers get a subtle paper-edge look.
 * Stickers get a white die-cut margin.
 */
function SampleDesign({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <div className={`relative flex h-full w-full flex-col justify-between overflow-hidden p-[8%] ${dark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-950'}`}>
      <div className="absolute -right-[12%] -top-[18%] h-[54%] w-[54%] rounded-full bg-cyan-400/85" />
      <div className="absolute -bottom-[18%] -left-[14%] h-[46%] w-[46%] rounded-full bg-pink-500/85" />
      <div className="absolute bottom-[18%] right-[18%] h-[18%] w-[34%] rounded-full bg-yellow-400/90" />
      <div className="relative z-10">
        <p className="text-[clamp(9px,1.4vw,18px)] font-black uppercase leading-none tracking-wide">
          Your Brand
        </p>
        <p className={`mt-1 text-[clamp(6px,0.8vw,10px)] font-bold uppercase tracking-[0.22em] ${dark ? 'text-white/58' : 'text-neutral-500'}`}>
          Bay Area
        </p>
      </div>
      <div className="relative z-10 h-[10%] w-[46%] rounded-full bg-current opacity-80" />
    </div>
  )
}

function ArtworkSlot({ artworkUrl, tone = 'light' }: { artworkUrl: string | null; tone?: 'light' | 'dark' }) {
  return artworkUrl ? (
    <img src={artworkUrl} alt="Your design" className="h-full w-full object-cover" />
  ) : (
    <SampleDesign tone={tone} />
  )
}

function ShapeFrame({
  shape,
  artworkUrl,
  rotate = 0,
}: {
  shape: StudioShape
  artworkUrl: string | null
  rotate?: number
}) {
  const ratio = SHAPE_RATIO[shape]

  if (shape === 'mylar-pouch') {
    return (
      <div
        className="relative"
        style={{
          aspectRatio: ratio,
          height: '88%',
          transform: `rotate(${rotate * 0.4}deg)`,
          filter:
            'drop-shadow(0 35px 45px rgba(0,0,0,0.6)) drop-shadow(0 10px 18px rgba(0,0,0,0.4))',
        }}
      >
        {/* Pouch silhouette via SVG mask */}
        <svg
          viewBox="0 0 100 160"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <clipPath id="pouchClip">
              {/* Stand-up pouch outline: heat-sealed top, rounded shoulders, gusseted bottom */}
              <path d="M8,18 L8,150 Q8,156 14,156 L86,156 Q92,156 92,150 L92,18 Q92,12 86,12 L14,12 Q8,12 8,18 Z" />
            </clipPath>
            {/* Cylindrical-feeling body shading — bright stripe through center */}
            <linearGradient id="pouchBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0a0a0c" />
              <stop offset="25%" stopColor="#1d1d22" />
              <stop offset="50%" stopColor="#33333a" />
              <stop offset="75%" stopColor="#1d1d22" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>
            <linearGradient id="pouchSheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
            </linearGradient>
          </defs>

          {/* Body fill with cylindrical highlight */}
          <rect width="100" height="160" fill="url(#pouchBody)" clipPath="url(#pouchClip)" />

          {/* Heat-seal zip line at top */}
          <rect x="8" y="10" width="84" height="3" fill="#0a0a0c" rx="1" />
          <line x1="14" y1="11.5" x2="86" y2="11.5" stroke="#4a4a4f" strokeWidth="0.5" strokeDasharray="1.5 1.5" />

          {/* Top-to-bottom subtle sheen */}
          <rect width="100" height="160" fill="url(#pouchSheen)" clipPath="url(#pouchClip)" />

          {/* Subtle outline so the pouch lifts off the dark backdrop */}
          <path
            d="M8,18 L8,150 Q8,156 14,156 L86,156 Q92,156 92,150 L92,18 Q92,12 86,12 L14,12 Q8,12 8,18 Z"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.6"
          />
        </svg>

        {/* Artwork label area — centered on the bag face */}
        <div
          className="absolute overflow-hidden rounded-md"
          style={{
            top: '20%',
            bottom: '14%',
            left: '14%',
            right: '14%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.55)',
          }}
        >
          <ArtworkSlot artworkUrl={artworkUrl} tone="light" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.18),transparent_32%,rgba(255,255,255,0.08)_68%,transparent)] mix-blend-screen" />
        </div>
      </div>
    )
  }

  if (shape === 'mylar-jar') {
    return (
      <div
        className="relative"
        style={{
          aspectRatio: ratio,
          height: '70%',
          transform: `rotate(${rotate * 0.15}deg)`,
          filter:
            'drop-shadow(0 30px 40px rgba(0,0,0,0.55)) drop-shadow(0 10px 16px rgba(0,0,0,0.35))',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            {/* Cylindrical body shading — dark at edges, bright down the middle */}
            <linearGradient id="jarBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0a0a0c" />
              <stop offset="20%" stopColor="#1f1f24" />
              <stop offset="50%" stopColor="#3a3a42" />
              <stop offset="80%" stopColor="#1f1f24" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>
            <linearGradient id="jarLid" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#15151a" />
              <stop offset="50%" stopColor="#4a4a52" />
              <stop offset="100%" stopColor="#15151a" />
            </linearGradient>
            <linearGradient id="jarTopShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {/* Jar body — short and squat */}
          <rect x="10" y="32" width="80" height="64" fill="url(#jarBody)" rx="4" />
          {/* Subtle horizontal highlight on body top */}
          <rect x="10" y="32" width="80" height="14" fill="url(#jarTopShine)" rx="4" />
          {/* Lid — slightly wider than body, taller for visibility */}
          <rect x="6" y="6" width="88" height="26" fill="url(#jarLid)" rx="3" />
          {/* Lid grooves */}
          <line x1="6" y1="14" x2="94" y2="14" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="6" y1="22" x2="94" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
          <line x1="6" y1="31" x2="94" y2="31" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" />
          {/* Bottom shadow on body */}
          <rect x="10" y="88" width="80" height="8" fill="rgba(0,0,0,0.35)" rx="4" />
        </svg>
        {/* Wraparound label area — centered on body face */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: '46%',
            bottom: '14%',
            left: '16%',
            right: '16%',
            borderRadius: '3px',
            boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
          }}
        >
          <ArtworkSlot artworkUrl={artworkUrl} tone="light" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.16),transparent_36%,rgba(255,255,255,0.08)_70%,transparent)] mix-blend-screen" />
        </div>
      </div>
    )
  }

  // Sticker shapes
  const isSticker = shape.startsWith('sticker-')
  const isCircle = shape === 'sticker-circle'
  const isRoundedSquare = shape === 'sticker-square'
  const isDieCut = shape === 'sticker-die-cut'
  const isStickerRect = shape === 'sticker-rect'

  // Die-cut = cut TO the design's outline — no white backing border, just the
  // art itself sitting flat. Other sticker styles (kiss-cut on backing, square,
  // circle, rect) keep the white margin to suggest the cut release liner.
  const stickerMargin = isDieCut ? '0%' : isSticker ? '7%' : '0%'
  const innerRadius = isCircle ? '50%' : isRoundedSquare ? '14%' : isStickerRect ? '6%' : isDieCut ? '14%' : '4px'
  const outerRadius = isCircle ? '50%' : isRoundedSquare ? '20%' : isDieCut ? '14%' : isSticker ? '10%' : '6px'

  // Business cards & postcards get a "stacked" look — second card behind to
  // show this is a real product run, not a single floating card
  const isStacked = shape === 'business-card' || shape === 'postcard'

  return (
    <div
      className="relative"
      style={{
        aspectRatio: ratio,
        width: shape === 'flyer' ? '46%' : '70%',
        maxHeight: '78%',
        transform: `rotate(${rotate}deg)`,
        filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45)) drop-shadow(0 8px 14px rgba(0,0,0,0.3))',
      }}
    >
      {/* Back card (stack effect) */}
      {isStacked && (
        <div
          aria-hidden
          className="absolute inset-0 bg-white"
          style={{
            borderRadius: outerRadius,
            transform: 'translate(4%, 5%) rotate(5deg)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)',
            opacity: 0.92,
          }}
        />
      )}
      {/* Foreground surface — for die-cut stickers we skip this so the artwork
          sits naked (no backing visible), like a finished die-cut */}
      {!isDieCut && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            borderRadius: outerRadius,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)',
          }}
        />
      )}
      <div
        className="absolute overflow-hidden"
        style={{
          top: stickerMargin,
          left: stickerMargin,
          right: stickerMargin,
          bottom: stickerMargin,
          borderRadius: innerRadius,
        }}
      >
        <ArtworkSlot artworkUrl={artworkUrl} tone={isDieCut ? 'dark' : 'light'} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.24),transparent_34%,rgba(255,255,255,0.08)_70%,transparent)] mix-blend-screen" />
      </div>
    </div>
  )
}

export default function StudioMockup({
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
  const fileRef = useRef<HTMLInputElement>(null)

  const activeKey = controlledActiveKey ?? internalActiveKey
  const scene = scenes.find((s) => s.key === activeKey) ?? scenes[0]

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
  }

  const clear = () => {
    setArtworkUrl(null)
    setArtworkName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{eyebrow}</p>
        <h2 className="text-2xl md:text-4xl font-black mb-3">
          {title ?? `Preview on a ${service} mockup`}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
      </div>

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

      {/* Studio canvas */}
      <div className="relative overflow-hidden rounded-lg border border-border aspect-[16/10] md:aspect-[16/9] shadow-2xl">
        {/* Backdrop — soft radial spotlight from top */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% -10%, #2a2a30 0%, #18181b 45%, #0c0c10 100%)',
          }}
        />
        {/* Floor — subtle gradient strip at the bottom for grounding */}
        <div
          className="absolute left-0 right-0 bottom-0 h-1/3 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))',
          }}
        />
        <div
          className="absolute left-1/2 top-[18%] h-32 w-32 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
          >
            <ShapeFrame
              shape={scene.shape}
              artworkUrl={artworkUrl}
              rotate={scene.rotate ?? -2.5}
            />
          </motion.div>
        </AnimatePresence>

        {/* Corner label */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/70">
          {scene.label}
        </div>
        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/60 backdrop-blur-sm">
          preview only
        </div>
      </div>

      {/* Upload bar */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 bg-card border border-border rounded-lg p-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.ai,.eps,.svg"
          className="hidden"
          onChange={handleFile}
        />
        <button onClick={() => fileRef.current?.click()} className="btn-primary w-full sm:w-auto">
          <Upload size={16} /> {artworkName ? 'Change file' : 'Upload your artwork'}
        </button>
        {artworkName ? (
          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold truncate max-w-[200px]">{artworkName}</span>
              <button
                onClick={clear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Remove artwork"
              >
                <X size={14} />
              </button>
            </div>
            {!artworkUrl && (
              <span className="text-xs text-muted-foreground">Proof file received. Upload PNG, JPG, or SVG for live preview.</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            PNG, JPG, SVG preview · PDF, AI, EPS accepted for proof
          </p>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-3 font-mono uppercase tracking-widest">
        {service} · For preview only · We'll proof your file before printing
      </p>
    </div>
  )
}
