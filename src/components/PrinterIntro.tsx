import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SESSION_KEY = 'tss_intro_played'
const DURATION = 2.8
const HEAD_TRAVEL_S = DURATION - 0.6

export default function PrinterIntro() {
  const [show, setShow] = useState(false)
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800))

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setShow(true)
    setVh(window.innerHeight)
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => {
      setShow(false)
      document.body.style.overflow = ''
    }, DURATION * 1000)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [])

  const skip = () => {
    setShow(false)
    document.body.style.overflow = ''
  }

  // Frame height in px (Tailwind h-14/h-16 = 56/64px; use 56 for mobile-safe baseline)
  const FRAME_H = 56
  const HEAD_H = 48 // print head bar + laser line combined
  const headStart = FRAME_H
  const headEnd = vh - HEAD_H

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          onClick={skip}
          className="fixed inset-0 z-[9999] cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Top printer frame — stays in place during scan */}
          <motion.div
            className="absolute left-0 right-0 top-0 h-14 bg-gradient-to-b from-neutral-900 to-neutral-800 border-b-2 border-neutral-700 shadow-2xl flex items-center justify-between px-4 md:px-8 z-[2]"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-neutral-200 shadow-[0_0_8px_rgba(229,229,229,0.6)]" />
              <span className="ml-2 text-[10px] md:text-xs text-neutral-400 font-mono tracking-widest uppercase hidden sm:inline">
                CMYK — 1440dpi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-[10px] md:text-xs text-neutral-400 font-mono tracking-widest uppercase">
                Printing
              </span>
            </div>
          </motion.div>

          {/* Paper/cover — the part of the page "not yet printed". Shrinks from top. */}
          <motion.div
            className="absolute left-0 right-0 bottom-0 bg-neutral-950 z-[1]"
            initial={{ top: headStart }}
            animate={{ top: headEnd }}
            exit={{ top: vh, opacity: 0 }}
            transition={{ duration: HEAD_TRAVEL_S, ease: [0.65, 0.05, 0.36, 1], delay: 0.3 }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
              }}
            />
          </motion.div>

          {/* Print head carriage — rides on top edge of the paper */}
          <motion.div
            className="absolute left-0 right-0 pointer-events-none z-[3]"
            initial={{ top: headStart - 8 }}
            animate={{ top: headEnd - 8 }}
            exit={{ top: vh, opacity: 0 }}
            transition={{ duration: HEAD_TRAVEL_S, ease: [0.65, 0.05, 0.36, 1], delay: 0.3 }}
          >
            <div className="h-2 bg-gradient-to-b from-transparent to-black/60" />
            <div className="relative h-10 bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-900 border-y-2 border-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-neutral-500/40" />
              <motion.div
                className="absolute top-1 bottom-1 w-16 bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-900 border border-neutral-900 rounded-sm shadow-lg"
                animate={{ x: ['5%', '80%', '5%'] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                style={{ left: 0 }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              </motion.div>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          </motion.div>

          {/* Skip hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-neutral-600 font-mono tracking-widest uppercase z-[4]"
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
