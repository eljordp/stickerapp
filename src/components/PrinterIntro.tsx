import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Printer } from 'lucide-react'
import tssLogo from '@/assets/tss-logo-new.png'

const SESSION_KEY = 'tss_intro_played'
const INTRO_MS = 2400

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const services = ['Stickers', 'Labels', 'Signage', 'Wraps']
const inkDots = [
  { color: 'bg-cyan-400', glow: 'shadow-[0_0_14px_rgba(34,211,238,0.95)]' },
  { color: 'bg-pink-500', glow: 'shadow-[0_0_14px_rgba(236,72,153,0.9)]' },
  { color: 'bg-yellow-400', glow: 'shadow-[0_0_14px_rgba(250,204,21,0.85)]' },
  { color: 'bg-neutral-900', glow: 'shadow-[0_0_10px_rgba(255,255,255,0.16)]' },
]

export default function PrinterIntro() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return

    if (prefersReducedMotion()) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }

    setShow(true)
    document.body.style.overflow = 'hidden'

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1')
      setShow(false)
      document.body.style.overflow = ''
    }, INTRO_MS)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [])

  const enterShop = () => {
    if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1')
    setShow(false)
    document.body.style.overflow = ''
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="printer-intro"
          data-intro="printer"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-neutral-950 px-5"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_18%_72%,rgba(236,72,153,0.1),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.74))]"
          />

          <motion.div
            aria-hidden
            className="absolute top-[22%] h-10 w-[78vw] max-w-[520px] rounded-md border border-white/10 bg-gradient-to-b from-neutral-700 to-neutral-950 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          >
            <div className="absolute left-5 top-1/2 flex -translate-y-1/2 gap-1.5">
              {inkDots.map((dot, index) => (
                <span key={index} className={`h-2 w-2 rounded-full ${dot.color} ${dot.glow}`} />
              ))}
            </div>
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 w-28 bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]"
              initial={{ x: '8%' }}
              animate={{ x: ['8%', '210%', '8%'] }}
              transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="absolute top-[calc(22%+38px)] h-[52vh] max-h-[520px] w-[74vw] max-w-[480px] origin-top overflow-hidden rounded-b-lg bg-neutral-100 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
            initial={{ scaleY: 0, opacity: 0.7 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 1.25, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(229,231,235,0.94))]" />
            <div className="absolute left-5 top-5 h-8 w-8 border-l-2 border-t-2 border-neutral-300" />
            <div className="absolute right-5 top-5 h-8 w-8 border-r-2 border-t-2 border-neutral-300" />
            <div className="absolute bottom-5 left-5 h-8 w-8 border-b-2 border-l-2 border-neutral-300" />
            <div className="absolute bottom-5 right-5 h-8 w-8 border-b-2 border-r-2 border-neutral-300" />

            <motion.div
              className="absolute left-[16%] top-[20%] h-16 w-16 rounded-[28%] bg-cyan-400 shadow-[0_10px_20px_rgba(14,165,233,0.24)]"
              initial={{ opacity: 0, rotate: -10, scale: 0.72 }}
              animate={{ opacity: 1, rotate: 8, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.34 }}
            />
            <motion.div
              className="absolute right-[18%] top-[28%] h-20 w-20 rounded-full bg-pink-500 shadow-[0_10px_20px_rgba(219,39,119,0.22)]"
              initial={{ opacity: 0, y: 12, scale: 0.72 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.58, duration: 0.34 }}
            />
            <motion.div
              className="absolute bottom-[20%] left-[28%] h-14 w-32 rounded-lg bg-yellow-400 shadow-[0_10px_20px_rgba(202,138,4,0.2)]"
              initial={{ opacity: 0, rotate: 6, scale: 0.74 }}
              animate={{ opacity: 1, rotate: -5, scale: 1 }}
              transition={{ delay: 0.74, duration: 0.34 }}
            />
          </motion.div>

          <motion.div
            className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-lg border border-white/10 bg-neutral-950/78 px-6 py-7 text-center shadow-[0_24px_90px_rgba(0,0,0,0.6)] backdrop-blur-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.34, ease: 'easeOut' }}
          >
            <div className="mb-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {inkDots.map((dot, index) => (
                <span key={index} className={`h-1.5 w-1.5 rounded-full ${dot.color} ${dot.glow}`} />
              ))}
              <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                ready
              </span>
            </div>

            <img
              src={tssLogo}
              alt="The Sticker Smith"
              className="mb-4 h-16 w-auto drop-shadow-[0_0_18px_rgba(255,255,255,0.16)]"
            />

            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              Bay Area print studio
            </p>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {services.map((service, index) => (
                <motion.span
                  key={service}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-bold text-neutral-200"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34 + index * 0.06 }}
                >
                  {service}
                </motion.span>
              ))}
            </div>

            <motion.h2
              className="mb-6 text-3xl font-black leading-tight text-white"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.3 }}
            >
              Press <span className="text-gradient">Print</span>
            </motion.h2>

            <button
              onClick={enterShop}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-b from-white to-neutral-300 px-9 text-lg font-black text-neutral-950 shadow-[0_0_38px_rgba(34,211,238,0.28)] transition hover:scale-[1.02] active:scale-95"
            >
              <Printer size={22} strokeWidth={2.5} />
              PRINT
              <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </button>

            <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: INTRO_MS / 1000, ease: 'easeInOut' }}
              />
            </div>

            <button
              onClick={enterShop}
              className="mt-4 font-mono text-[10px] uppercase tracking-widest text-neutral-500 transition hover:text-neutral-300"
            >
              open shop now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
