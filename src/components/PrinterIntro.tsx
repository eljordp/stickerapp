import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SESSION_KEY = 'tss_intro_played'
const DURATION = 2.9
const HEAD_TRAVEL_S = DURATION - 0.6
const STATUS_MESSAGES = ['CALIBRATING', 'LOADING INK', 'PRINTING', 'CURING']

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function PrinterIntro() {
  const [show, setShow] = useState(false)
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800))
  const [statusIdx, setStatusIdx] = useState(0)
  const [showCropMarks, setShowCropMarks] = useState(false)
  const audioStoppers = useRef<Array<() => void>>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    if (prefersReducedMotion()) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }
    sessionStorage.setItem(SESSION_KEY, '1')
    setShow(true)
    setVh(window.innerHeight)
    document.body.style.overflow = 'hidden'

    // Rotate status messages across the duration
    const statusStep = (DURATION * 1000) / STATUS_MESSAGES.length
    const statusTimers = STATUS_MESSAGES.map((_, i) =>
      setTimeout(() => setStatusIdx(i), i * statusStep),
    )

    // Show crop marks near the end
    const cropTimer = setTimeout(() => setShowCropMarks(true), (DURATION - 0.6) * 1000)

    // Start synthesized printer sound (fails silently if autoplay blocked)
    startPrinterSound(audioStoppers)

    const t = setTimeout(() => {
      setShow(false)
      document.body.style.overflow = ''
      stopAllSound(audioStoppers)
    }, DURATION * 1000)

    return () => {
      clearTimeout(t)
      clearTimeout(cropTimer)
      statusTimers.forEach(clearTimeout)
      document.body.style.overflow = ''
      stopAllSound(audioStoppers)
    }
  }, [])

  const skip = () => {
    setShow(false)
    document.body.style.overflow = ''
    stopAllSound(audioStoppers)
  }

  const FRAME_H = 56
  const HEAD_H = 48
  const headStart = FRAME_H
  const headEnd = vh - HEAD_H

  // Ink droplets — spaced across the scan, use CSS keyframes so they don't
  // share the main JS anim thread with framer-motion
  const droplets = Array.from({ length: 16 }, (_, i) => {
    const colors = ['#22d3ee', '#ec4899', '#facc15']
    return {
      id: i,
      x: 4 + Math.random() * 92,
      progress: i / 16 + Math.random() * 0.04,
      color: colors[i % colors.length],
      size: 2 + Math.random() * 2,
    }
  })

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          onClick={skip}
          className="fixed inset-0 z-[9999] cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Left side rail */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 border-r border-neutral-700 z-[2]"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {[0.15, 0.35, 0.55, 0.75, 0.92].map((t) => (
              <div
                key={t}
                className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-600"
                style={{ top: `${t * 100}%` }}
              />
            ))}
          </motion.div>

          {/* Right side rail */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-l from-neutral-900 via-neutral-800 to-neutral-950 border-l border-neutral-700 z-[2]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {[0.15, 0.35, 0.55, 0.75, 0.92].map((t) => (
              <div
                key={t}
                className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-600"
                style={{ top: `${t * 100}%` }}
              />
            ))}
          </motion.div>

          {/* Top printer frame */}
          <motion.div
            className="absolute left-0 right-0 top-0 h-14 bg-gradient-to-b from-neutral-900 to-neutral-800 border-b-2 border-neutral-700 shadow-2xl flex items-center justify-between px-4 md:px-8 z-[3]"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-600 shadow-[0_0_6px_rgba(0,0,0,0.8),inset_0_0_2px_rgba(255,255,255,0.2)]" />
              <span className="ml-2 text-[10px] md:text-xs text-neutral-400 font-mono tracking-widest uppercase hidden sm:inline">
                CMYK — 1440dpi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-[10px] md:text-xs text-neutral-300 font-mono tracking-widest uppercase min-w-[70px] md:min-w-[90px] text-right"
                >
                  {STATUS_MESSAGES[statusIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Paper cover — unrevealed area */}
          <motion.div
            className="absolute left-0 right-0 bottom-0 bg-neutral-950 z-[1] overflow-hidden"
            initial={{ top: headStart }}
            animate={{ top: headEnd }}
            exit={{ top: vh, opacity: 0 }}
            transition={{ duration: HEAD_TRAVEL_S, ease: [0.65, 0.05, 0.36, 1], delay: 0.3 }}
          >
            {/* Scan lines — lightweight, GPU-paintable */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
              }}
            />
          </motion.div>

          {/* Ink droplets — CSS-keyframed so they don't share the JS anim thread */}
          {droplets.map((d) => {
            const y = headStart + (headEnd - headStart) * d.progress
            const startDelay = 0.3 + d.progress * HEAD_TRAVEL_S
            return (
              <div
                key={d.id}
                className="absolute rounded-full pointer-events-none z-[2] intro-droplet"
                style={{
                  left: `${d.x}%`,
                  top: y,
                  width: d.size,
                  height: d.size,
                  backgroundColor: d.color,
                  boxShadow: `0 0 6px ${d.color}`,
                  animationDelay: `${startDelay}s`,
                }}
              />
            )
          })}

          {/* Print head carriage */}
          <motion.div
            className="absolute left-0 right-0 pointer-events-none z-[4]"
            initial={{ top: headStart - 8 }}
            animate={{ top: headEnd - 8 }}
            exit={{ top: -HEAD_H, opacity: [1, 1, 0] }}
            transition={{
              duration: HEAD_TRAVEL_S,
              ease: [0.65, 0.05, 0.36, 1],
              delay: 0.3,
            }}
          >
            <div className="h-2 bg-gradient-to-b from-transparent to-black/60" />
            <div className="relative h-10 bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-900 border-y-2 border-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-neutral-500/40" />
              <motion.div
                className="absolute top-1 bottom-1 w-16 bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-900 border border-neutral-900 rounded-sm shadow-lg"
                animate={{ x: ['5%', '80%', '5%'] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ left: 0 }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              </motion.div>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          </motion.div>

          {/* Corner registration/crop marks */}
          {showCropMarks && (
            <>
              {[
                { top: 16, left: 16, rotate: 0 },
                { top: 16, right: 16, rotate: 90 },
                { bottom: 16, left: 16, rotate: -90 },
                { bottom: 16, right: 16, rotate: 180 },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-6 h-6 z-[5] pointer-events-none"
                  style={pos}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
                </motion.div>
              ))}
            </>
          )}

          {/* Skip hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-neutral-600 font-mono tracking-widest uppercase z-[6]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            tap to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---- Web Audio printer sound (fails silently if blocked) ----
function startPrinterSound(refStore: React.MutableRefObject<Array<() => void>>) {
  try {
    const Ctx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.12
    masterGain.connect(ctx.destination)

    // Base whirring motor — low saw wave filtered low
    const motor = ctx.createOscillator()
    motor.type = 'sawtooth'
    motor.frequency.value = 78
    const motorLfo = ctx.createOscillator()
    motorLfo.frequency.value = 6
    const motorLfoGain = ctx.createGain()
    motorLfoGain.gain.value = 2
    motorLfo.connect(motorLfoGain)
    motorLfoGain.connect(motor.frequency)

    const motorFilter = ctx.createBiquadFilter()
    motorFilter.type = 'lowpass'
    motorFilter.frequency.value = 240
    motorFilter.Q.value = 1.2

    const motorGain = ctx.createGain()
    motorGain.gain.value = 0
    motorGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.15)

    motor.connect(motorFilter)
    motorFilter.connect(motorGain)
    motorGain.connect(masterGain)
    motor.start()
    motorLfo.start()

    // Pre-build click noise buffer once, reuse it (avoids per-tick GC pressure)
    const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
    const clickData = clickBuffer.getChannelData(0)
    for (let i = 0; i < clickData.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * (1 - i / clickData.length)
    }

    // Carriage click track — short noise bursts at nozzle oscillation rate
    const clickInterval = setInterval(() => {
      const now = ctx.currentTime
      const src = ctx.createBufferSource()
      src.buffer = clickBuffer
      const clickFilter = ctx.createBiquadFilter()
      clickFilter.type = 'highpass'
      clickFilter.frequency.value = 2000
      const clickGain = ctx.createGain()
      clickGain.gain.setValueAtTime(0.4, now)
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
      src.connect(clickFilter)
      clickFilter.connect(clickGain)
      clickGain.connect(masterGain)
      src.start(now)
      src.stop(now + 0.05)
    }, 180)

    // Final beep at end
    const beepTimer = setTimeout(() => {
      const now = ctx.currentTime
      ;[0, 0.18].forEach((offset) => {
        const beep = ctx.createOscillator()
        beep.type = 'sine'
        beep.frequency.value = 1320
        const beepGain = ctx.createGain()
        beepGain.gain.setValueAtTime(0, now + offset)
        beepGain.gain.linearRampToValueAtTime(0.25, now + offset + 0.01)
        beepGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12)
        beep.connect(beepGain)
        beepGain.connect(masterGain)
        beep.start(now + offset)
        beep.stop(now + offset + 0.15)
      })
    }, (DURATION - 0.5) * 1000)

    refStore.current.push(() => {
      clearInterval(clickInterval)
      clearTimeout(beepTimer)
      try {
        motorGain.gain.cancelScheduledValues(ctx.currentTime)
        motorGain.gain.setValueAtTime(motorGain.gain.value, ctx.currentTime)
        motorGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
        setTimeout(() => {
          motor.stop()
          motorLfo.stop()
          ctx.close()
        }, 300)
      } catch {
        /* no-op */
      }
    })
  } catch {
    /* no-op — audio failed, keep silent */
  }
}

function stopAllSound(refStore: React.MutableRefObject<Array<() => void>>) {
  refStore.current.forEach((fn) => {
    try {
      fn()
    } catch {
      /* no-op */
    }
  })
  refStore.current = []
}
