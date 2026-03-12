import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function ReferralProgram() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-3xl overflow-hidden p-8 md:p-12"
        >
          <div className="max-w-2xl">
            <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Referral Program</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Know Someone Who<br />
              <span className="text-primary">Needs Stickers?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-3">
              Send them your way. When they order with your code, <strong className="text-foreground">they get 10% off</strong> and <strong className="text-foreground">you earn 5% commission</strong> on every sale.
            </p>
            <p className="text-muted-foreground mb-8">
              No limits — the more people you send, the more you save. Create your account to get started.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/account" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
                Get Your Code <ArrowRight size={18} />
              </Link>
              <Link to="/referral" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-muted-foreground hover:text-foreground transition-colors">
                Learn More
              </Link>
            </div>
          </div>

          {/* Decorative */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute right-12 top-12 hidden lg:flex flex-col items-center gap-3 opacity-60">
            <div className="text-6xl font-black text-primary/20">5%</div>
            <div className="text-sm font-bold text-primary/30 uppercase tracking-wider">commission</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
