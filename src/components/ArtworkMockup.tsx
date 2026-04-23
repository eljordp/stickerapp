import { useState, useRef, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ImageIcon } from 'lucide-react'

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
      <div className="relative rounded-3xl overflow-hidden border border-border bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full"
          >
            <img src={scene.base} alt={scene.label} className="w-full h-auto block" />

            {/* Artwork slot overlay */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
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
              }}
            >
              {artworkUrl ? (
                <img
                  src={artworkUrl}
                  alt="Your artwork"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
                  }}
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-white/40 bg-white/10 backdrop-blur-[2px] rounded-md flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1.5 text-white/80 text-xs font-semibold uppercase tracking-widest">
                    <ImageIcon size={18} />
                    Your art here
                  </div>
                </div>
              )}
            </div>

            {/* Corner hint */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/70">
              {scene.label}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload bar */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 bg-card border border-border rounded-2xl p-3">
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
            PNG, JPG, PDF, AI, SVG · preview updates instantly
          </p>
        )}
      </div>
    </div>
  )
}
