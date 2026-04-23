import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function FirstOrderChip() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasOrdered = localStorage.getItem('tss_order_completed') === 'true'
    if (hasOrdered) return
    const t = setTimeout(() => setShow(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-xs md:text-sm font-semibold text-primary"
        >
          <Sparkles size={13} />
          <span>First order? <strong>10% off automatic at checkout.</strong></span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
