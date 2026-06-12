import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Package, Mail } from 'lucide-react'
import printingNow from '@/assets/pages/confirm-printing.jpg'

export default function OrderConfirmation() {
  const location = useLocation()
  const { orderId, payerName, email, total, processingIssue } = location.state || {}
  const needsManualReview = Boolean(processingIssue)

  if (!orderId) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl font-black mb-4">No Order Found</h1>
          <p className="text-muted-foreground mb-8">It looks like you navigated here directly.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-2xl text-center">
        {/* Hero image — your job is printing now */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[16/9] max-w-lg mx-auto"
        >
          <img src={printingNow} alt="Your order is being printed" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            className={`absolute top-4 right-4 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg ${needsManualReview ? 'bg-yellow-500/90' : 'bg-green-500/90'}`}
          >
            {needsManualReview ? <AlertTriangle size={24} className="text-white" strokeWidth={2.5} /> : <CheckCircle size={24} className="text-white" strokeWidth={2.5} />}
          </motion.div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs text-white/70 font-mono tracking-widest uppercase">{needsManualReview ? 'Payment Received' : 'Now Printing'}</p>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black mb-4"
        >
          {needsManualReview ? 'Payment Received' : 'Order Confirmed!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8"
        >
          {needsManualReview
            ? `Thank you, ${payerName}! Your payment went through. Our team is reviewing the order details manually.`
            : `Thank you, ${payerName}! Your payment went through and your job is in the queue.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8 text-left space-y-4"
        >
          <div className="flex items-start gap-3">
            <Package size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Order ID</p>
              <p className="text-muted-foreground text-sm break-all">{orderId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Confirmation Email</p>
              <p className="text-muted-foreground text-sm">
                {needsManualReview
                  ? <>We are checking the confirmation for <span className="text-foreground">{email}</span>.</>
                  : <>A receipt has been sent to <span className="text-foreground">{email}</span></>}
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-bold">Total Paid</span>
            <span className="text-xl font-black text-primary">${total}</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          {needsManualReview ? 'Keep this PayPal order ID handy. ' : "We'll start working on your order right away. "}
          If you have any questions, reach out to us at{' '}
          <a href="mailto:thestickersmith@gmail.com" className="text-primary hover:underline">
            thestickersmith@gmail.com
          </a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/stickers" className="btn-secondary">Order More Stickers</Link>
        </motion.div>
      </div>
    </section>
  )
}
