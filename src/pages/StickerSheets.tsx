import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, ChevronDown, Layers } from 'lucide-react'

const features = [
  'Mix & match multiple designs on one sheet',
  'Kiss-cut for easy peeling',
  'Custom sizes & layouts available',
  'Matte, glossy & holographic finishes',
  'Waterproof & weather resistant vinyl',
  'Back-paper printing available',
]

const benefits = [
  { title: 'Perfect for Giveaways', description: 'Hand out branded sticker sheets at events, trade shows, or include them with orders for an extra touch.' },
  { title: 'More Designs, One Sheet', description: 'Fit multiple sticker designs on a single sheet — logos, icons, patterns, and more all together.' },
  { title: 'Wholesale Ready', description: 'Bulk pricing available for large orders. Great for retail, subscription boxes, and promotional kits.' },
]

const sizes = [
  { label: '4" × 6"', description: 'Postcard size' },
  { label: '5.5" × 8.5"', description: 'Half letter' },
  { label: '8.5" × 11"', description: 'Full letter' },
  { label: 'Custom', description: 'Any size you need' },
]

const specs = [
  { label: 'Material', value: 'Premium vinyl (PP)' },
  { label: 'Finish', value: 'Glossy, Matte, or Holographic' },
  { label: 'Adhesive', value: 'Permanent' },
  { label: 'Waterproof', value: 'Yes' },
  { label: 'Weather Resistant', value: '2–5 years outdoor' },
  { label: 'Min. Sticker Size', value: '1" × 1"' },
]

const faqs = [
  {
    q: 'How do sticker sheets work?',
    a: 'Each sheet contains multiple kiss-cut stickers that can be easily peeled off individually. You choose the sheet size, and we arrange your designs with proper spacing for easy peeling.',
  },
  {
    q: 'Can I put different designs on one sheet?',
    a: 'Absolutely! Mix and match as many different designs as you want on a single sheet. Logos, icons, characters — whatever you need.',
  },
  {
    q: 'What materials are available?',
    a: 'We offer matte vinyl, glossy vinyl, holographic, and clear materials. All are waterproof and weather resistant.',
  },
  {
    q: 'What sizes are available?',
    a: 'Standard sizes include 4"×6", 5.5"×8.5", and 8.5"×11". We also offer fully custom sizes up to 12"×12".',
  },
  {
    q: 'What is the minimum order?',
    a: 'Our minimum order for sticker sheets is 25 pieces. Volume discounts are available for orders of 100+ sheets.',
  },
  {
    q: 'Can you help with the design and layout?',
    a: 'Yes! Send us your individual sticker designs and we\'ll arrange them on the sheet for you. We can also help create designs from scratch.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
        <span className="font-bold text-sm md:text-base pr-4">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function StickerSheets() {
  return (
    <section className="py-8 md:py-16">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Custom Sticker Sheets</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            All your designs on one sheet. Fully customizable and perfect for giveaways, branding, or just for fun.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Features */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-black mb-6">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.08 }} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Available Sizes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-black mb-6">Available Sizes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sizes.map((size) => (
                <div key={size.label} className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="text-xl font-black text-primary mb-1">{size.label}</div>
                  <div className="text-muted-foreground text-xs">{size.description}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Specs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-black mb-6">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-muted-foreground text-sm">{spec.label}</span>
                  <span className="font-bold text-sm">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
            <h2 className="text-2xl font-black mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="text-center">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Get a Free Quote <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
