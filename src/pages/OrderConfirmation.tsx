import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Mail } from 'lucide-react'

export default function OrderConfirmation() {
  const location = useLocation()
  const { orderId, payerName, email, total } = location.state || {}

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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <CheckCircle size={80} className="mx-auto text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black mb-4"
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8"
        >
          Thank you, {payerName}! Your payment has been processed.
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
              <p className="text-muted-foreground text-sm">A receipt has been sent to <span className="text-foreground">{email}</span></p>
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
          We'll start working on your order right away. If you have any questions, reach out to us at{' '}
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
