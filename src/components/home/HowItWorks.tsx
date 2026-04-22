import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Upload, Palette, ShoppingCart, ArrowRight } from 'lucide-react'

const steps = [
  { icon: Upload, title: 'Upload Your Design', description: 'Share your artwork or idea. We accept PNG, JPG, PDF, AI, and vector files. No design? We can help.' },
  { icon: Palette, title: 'Choose Material & Shape', description: 'Pick from matte, gloss, clear, holographic, and more. Select die-cut, kiss-cut, or custom shapes.' },
  { icon: ShoppingCart, title: 'Add to Cart & Checkout', description: "Review your proof, approve the design, and we'll print and ship your order with express delivery." },
]

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-card/50">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Order custom stickers in 3 easy steps</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {steps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="relative text-center">
              {index < steps.length - 1 && <div className="hidden md:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px bg-border" />}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <step.icon size={32} className="text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center">{index + 1}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link to="/stickers" className="btn-primary text-lg px-8 py-4">Start Your Order<ArrowRight size={20} /></Link>
        </motion.div>
      </div>
    </section>
  )
}
