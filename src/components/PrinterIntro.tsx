import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Printer } from 'lucide-react'

const DURATION = 3.8
const HEAD_TRAVEL_S = DURATION - 0.72
const HEAD_EASE: [number, number, number, number] = [0.22, 0.08, 0.78, 0.94]
const STATUS_MESSAGES = ['CALIBRATING', 'LOADING INK', 'PRINTING', 'CURING']

type Phase = 'gate' | 'playing' | 'hidden'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function PrinterIntro() {
  const [phase, setPhase] = useState<Phase>('gate')
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800))
  const [statusIdx, setStatusIdx] = useState(0)
  const [showCropMarks, setShowCropMarks] = useState(false)
  const [showFinishFlash, setShowFinishFlash] = useState(false)
  const audioStoppers = useRef<Array<() => void>>([])
  const timersRef = useRef<Array<number>>([])

  useEffect(() => {
    if (typeof window === 'undefined' || phase === 'hidden') return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return

    setVh(window.innerHeight)
    setStatusIdx(0)
    setShowCropMarks(false)
    setShowFinishFlash(false)

    if (prefersReducedMotion()) {
      setPhase('hidden')
      return
    }

    const statusStep = (DURATION * 1000) / STATUS_MESSAGES.length
    STATUS_MESSAGES.forEach((_, index) => {
      timersRef.current.push(window.setTimeout(() => setStatusIdx(index), index * statusStep))
    })
    timersRef.current.push(window.setTimeout(() => setShowCropMarks(true), (DURATION - 0.6) * 1000))
    timersRef.current.push(window.setTimeout(() => setShowFinishFlash(true), (DURATION - 0.36) * 1000))
    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('hidden')
        document.body.style.overflow = ''
        stopAllSound(audioStoppers)
      }, DURATION * 1000),
    )

    startPrinterSound(audioStoppers)

    return () => {
      timersRef.current.forEach((id) => clearTimeout(id))
      timersRef.current = []
      stopAllSound(audioStoppers)
    }
  }, [phase])

  const finishIntro = () => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
    setPhase('hidden')
    document.body.style.overflow = ''
    stopAllSound(audioStoppers)
  }

  const frameHeight = 56
  const headHeight = 48
  const headStart = frameHeight
  const headEnd = vh - headHeight

  const droplets = useMemo(() => Array.from({ length: 16 }, (_, index) => {
    const colors = ['#22d3ee', '#ec4899', '#facc15']
    return {
      id: index,
      x: 4 + Math.random() * 92,
      progress: index / 16 + Math.random() * 0.04,
      color: colors[index % colors.length],
      size: 2 + Math.random() * 2,
    }
  }), [])

  return (
    <AnimatePresence>
      {phase === 'gate' && (
        <motion.div
          key="printer-gate"
          data-intro="printer"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <motion.div
            className="relative max-w-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
              <div className="h-1.5 w-1.5 rounded-full border border-neutral-600 bg-neutral-800" />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                ready
              </span>
            </div>
            <h2 className="mb-8 text-3xl font-black tracking-tight text-white md:text-4xl">
              Press <span className="text-gradient">Print</span>
            </h2>
            <button
              onClick={() => setPhase('playing')}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-neutral-100 to-neutral-300 px-10 py-5 text-lg font-black text-neutral-900 shadow-[0_0_40px_rgba(34,211,238,0.25)] transition-all hover:scale-[1.03] hover:from-white hover:to-neutral-200 active:scale-95"
            >
              <Printer size={22} strokeWidth={2.5} />
              PRINT
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-cyan-500"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
            </button>
          </motion.div>
        </motion.div>
      )}

      {phase === 'playing' && (
        <motion.div
          key="printer-playing"
          data-intro="printer"
          onClick={finishIntro}
          className="fixed inset-0 z-[9999] cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ perspective: 1200 }}
        >
          <motion.div
            className="absolute bottom-0 left-0 top-0 z-[2] w-3 border-r border-neutral-700 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 md:w-4"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {[0.15, 0.35, 0.55, 0.75, 0.92].map((top) => (
              <div
                key={top}
                className="absolute left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-neutral-600"
                style={{ top: `${top * 100}%` }}
              />
            ))}
          </motion.div>

          <motion.div
            className="absolute bottom-0 right-0 top-0 z-[2] w-3 border-l border-neutral-700 bg-gradient-to-l from-neutral-900 via-neutral-800 to-neutral-950 md:w-4"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {[0.15, 0.35, 0.55, 0.75, 0.92].map((top) => (
              <div
                key={top}
                className="absolute left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-neutral-600"
                style={{ top: `${top * 100}%` }}
              />
            ))}
          </motion.div>

          <motion.div
            className="absolute left-0 right-0 top-0 z-[3] flex h-14 items-center justify-between border-b-2 border-neutral-700 bg-gradient-to-b from-neutral-900 to-neutral-800 px-4 shadow-2xl md:px-8"
            initial={{ y: '-100%' }}
            animate={{ y: [0, 3, -1, 0], rotateX: [0, -1.4, 0.4, 0] }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              <div className="h-2 w-2 rounded-full border border-neutral-600 bg-neutral-900 shadow-[0_0_6px_rgba(0,0,0,0.8),inset_0_0_2px_rgba(255,255,255,0.2)]" />
              <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-widest text-neutral-400 sm:inline md:text-xs">
                CMYK - 1440dpi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusIdx}
                  className="min-w-[70px] text-right font-mono text-[10px] uppercase tracking-widest text-neutral-300 md:min-w-[90px] md:text-xs"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {STATUS_MESSAGES[statusIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[1] overflow-hidden bg-neutral-950"
            initial={{ top: headStart }}
            animate={{ top: headEnd }}
            exit={{ top: vh, opacity: 0 }}
            transition={{ duration: HEAD_TRAVEL_S, ease: HEAD_EASE, delay: 0.3 }}
          >
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.08), transparent 24%), repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 9px)',
              }}
            />
            <div className="absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/[0.08] to-transparent" />
          </motion.div>

          {droplets.map((droplet) => {
            const top = headStart + (headEnd - headStart) * droplet.progress
            const startDelay = 0.3 + droplet.progress * HEAD_TRAVEL_S
            return (
              <div
                key={droplet.id}
                className="intro-droplet pointer-events-none absolute z-[2] rounded-full"
                style={{
                  left: `${droplet.x}%`,
                  top,
                  width: droplet.size,
                  height: droplet.size,
                  backgroundColor: droplet.color,
                  boxShadow: `0 0 6px ${droplet.color}`,
                  animationDelay: `${startDelay}s`,
                }}
              />
            )
          })}

          <motion.div
            className="pointer-events-none absolute left-0 right-0 z-[4]"
            initial={{ top: headStart - 8 }}
            animate={{ top: headEnd - 8, x: [0, 0.7, -0.7, 0.45, -0.35, 0] }}
            exit={{ top: -headHeight, opacity: [1, 1, 0] }}
            transition={{ top: { duration: HEAD_TRAVEL_S, ease: HEAD_EASE, delay: 0.3 }, x: { duration: 0.18, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className="h-2 bg-gradient-to-b from-transparent to-black/60" />
            <div className="relative h-11 border-y-2 border-neutral-950 bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-950 shadow-[0_14px_34px_rgba(0,0,0,0.72)]">
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-neutral-400/35" />
              <div className="absolute left-0 right-0 bottom-0 h-px bg-white/10" />
              <motion.div
                className="absolute bottom-1 top-1 w-20 rounded-sm border border-neutral-950 bg-gradient-to-b from-neutral-500 via-neutral-800 to-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.65)]"
                animate={{ x: ['5%', '80%', '5%'] }}
                transition={{ duration: 0.92, repeat: Infinity, ease: 'easeInOut' }}
                style={{ left: 0 }}
              >
                <div className="absolute bottom-0 left-1/2 h-1.5 w-8 -translate-x-1/2 bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
              </motion.div>
            </div>
            <div className="h-[3px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_26px_rgba(34,211,238,1)]" />
            <div className="h-5 bg-gradient-to-b from-cyan-300/20 to-transparent" />
          </motion.div>

          {showFinishFlash && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[7] bg-cyan-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0] }}
              transition={{ duration: 0.46, ease: 'easeOut' }}
            />
          )}

          {showCropMarks && (
            <>
              {[
                { top: 16, left: 16, rotate: 0 },
                { top: 16, right: 16, rotate: 90 },
                { bottom: 16, left: 16, rotate: -90 },
                { bottom: 16, right: 16, rotate: 180 },
              ].map((position, index) => (
                <motion.div
                  key={index}
                  className="pointer-events-none absolute z-[5] h-6 w-6"
                  style={position}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                >
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-white" />
                  <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white" />
                </motion.div>
              ))}
            </>
          )}

          <motion.div
            className="absolute bottom-6 left-1/2 z-[6] -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-neutral-600 md:text-xs"
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

function startPrinterSound(refStore: MutableRefObject<Array<() => void>>) {
  try {
    const Ctx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.075
    masterGain.connect(ctx.destination)

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let index = 0; index < noiseData.length; index += 1) noiseData[index] = Math.random() * 2 - 1

    const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
    const clickData = clickBuffer.getChannelData(0)
    for (let index = 0; index < clickData.length; index += 1) {
      clickData[index] = (Math.random() * 2 - 1) * (1 - index / clickData.length)
    }

    const buttonClick = ctx.createBufferSource()
    const buttonClickFilter = ctx.createBiquadFilter()
    const buttonClickGain = ctx.createGain()
    buttonClick.buffer = clickBuffer
    buttonClickFilter.type = 'bandpass'
    buttonClickFilter.frequency.value = 850
    buttonClickFilter.Q.value = 1.4
    buttonClickGain.gain.setValueAtTime(0.22, ctx.currentTime)
    buttonClickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
    buttonClick.connect(buttonClickFilter)
    buttonClickFilter.connect(buttonClickGain)
    buttonClickGain.connect(masterGain)
    buttonClick.start()
    buttonClick.stop(ctx.currentTime + 0.07)

    const motor = ctx.createOscillator()
    motor.type = 'sine'
    motor.frequency.value = 58
    const motorFilter = ctx.createBiquadFilter()
    motorFilter.type = 'lowpass'
    motorFilter.frequency.value = 145
    motorFilter.Q.value = 0.8

    const motorGain = ctx.createGain()
    motorGain.gain.value = 0
    motorGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.18)

    motor.connect(motorFilter)
    motorFilter.connect(motorGain)
    motorGain.connect(masterGain)
    motor.start()

    const beltSource = ctx.createBufferSource()
    beltSource.buffer = noiseBuffer
    beltSource.loop = true
    const beltFilter = ctx.createBiquadFilter()
    beltFilter.type = 'bandpass'
    beltFilter.frequency.value = 180
    beltFilter.Q.value = 0.55
    const beltGain = ctx.createGain()
    beltGain.gain.value = 0
    beltGain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.25)
    beltSource.connect(beltFilter)
    beltFilter.connect(beltGain)
    beltGain.connect(masterGain)
    beltSource.start()

    const paperGrabTimer = window.setTimeout(() => {
      const now = ctx.currentTime
      const source = ctx.createBufferSource()
      source.buffer = noiseBuffer
      const grabFilter = ctx.createBiquadFilter()
      grabFilter.type = 'bandpass'
      grabFilter.frequency.setValueAtTime(520, now)
      grabFilter.frequency.linearRampToValueAtTime(1500, now + 0.24)
      grabFilter.Q.value = 0.9
      const grabGain = ctx.createGain()
      grabGain.gain.setValueAtTime(0.0001, now)
      grabGain.gain.exponentialRampToValueAtTime(0.13, now + 0.035)
      grabGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
      source.connect(grabFilter)
      grabFilter.connect(grabGain)
      grabGain.connect(masterGain)
      source.start(now)
      source.stop(now + 0.38)
    }, 140)

    let clickTick = 0
    const clickInterval = window.setInterval(() => {
      const now = ctx.currentTime
      const source = ctx.createBufferSource()
      source.buffer = clickBuffer
      const clickFilter = ctx.createBiquadFilter()
      clickFilter.type = 'highpass'
      clickFilter.frequency.value = clickTick % 5 === 0 ? 850 : clickTick % 2 === 0 ? 1800 : 1300
      const clickGain = ctx.createGain()
      clickGain.gain.setValueAtTime(clickTick % 5 === 0 ? 0.17 : 0.12, now)
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042)
      const panner = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null
      if (panner) {
        panner.pan.setValueAtTime(Math.sin(clickTick * 0.75) * 0.48, now)
      }
      source.connect(clickFilter)
      clickFilter.connect(clickGain)
      if (panner) {
        clickGain.connect(panner)
        panner.connect(masterGain)
      } else {
        clickGain.connect(masterGain)
      }
      source.start(now)
      source.stop(now + 0.06)
      clickTick += 1
    }, 165)

    const ejectTimer = window.setTimeout(() => {
      const now = ctx.currentTime
      const source = ctx.createBufferSource()
      source.buffer = noiseBuffer
      const ejectFilter = ctx.createBiquadFilter()
      ejectFilter.type = 'bandpass'
      ejectFilter.frequency.setValueAtTime(1350, now)
      ejectFilter.frequency.linearRampToValueAtTime(420, now + 0.35)
      const ejectGain = ctx.createGain()
      ejectGain.gain.setValueAtTime(0, now)
      ejectGain.gain.linearRampToValueAtTime(0.2, now + 0.06)
      ejectGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      source.connect(ejectFilter)
      ejectFilter.connect(ejectGain)
      ejectGain.connect(masterGain)
      source.start(now)
      source.stop(now + 0.45)
    }, (DURATION - 0.9) * 1000)

    const finishClickTimer = window.setTimeout(() => {
      const now = ctx.currentTime
      const source = ctx.createBufferSource()
      source.buffer = clickBuffer
      const doneFilter = ctx.createBiquadFilter()
      doneFilter.type = 'bandpass'
      doneFilter.frequency.value = 760
      doneFilter.Q.value = 1.1
      const doneGain = ctx.createGain()
      doneGain.gain.setValueAtTime(0.11, now)
      doneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
      source.connect(doneFilter)
      doneFilter.connect(doneGain)
      doneGain.connect(masterGain)
      source.start(now)
      source.stop(now + 0.08)
    }, (DURATION - 0.32) * 1000)

    refStore.current.push(() => {
      window.clearInterval(clickInterval)
      window.clearTimeout(paperGrabTimer)
      window.clearTimeout(ejectTimer)
      window.clearTimeout(finishClickTimer)
      try {
        const time = ctx.currentTime
        ;[motorGain, beltGain].forEach((gain) => {
          gain.gain.cancelScheduledValues(time)
          gain.gain.setValueAtTime(gain.gain.value, time)
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25)
        })
        window.setTimeout(() => {
          motor.stop()
          beltSource.stop()
          void ctx.close()
        }, 300)
      } catch {
        /* no-op */
      }
    })
  } catch {
    /* no-op */
  }
}

function stopAllSound(refStore: MutableRefObject<Array<() => void>>) {
  refStore.current.forEach((stop) => {
    try {
      stop()
    } catch {
      /* no-op */
    }
  })
  refStore.current = []
}
