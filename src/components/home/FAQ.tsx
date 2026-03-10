import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqCategories = [
  {
    title: 'Ordering & Pricing',
    faqs: [
      { question: 'How do I place an order?', answer: 'Browse our products, customize your options (size, material, quantity), and add to cart. At checkout, fill out your info and pay via PayPal. You\'ll receive an order confirmation immediately.' },
      { question: 'Is there a minimum order quantity?', answer: 'For custom stickers, our minimum is 50 pieces. For business print (cards, flyers), minimums vary by product. Large format items like vehicle wraps and signage are per-project pricing with no minimum.' },
      { question: 'Do you offer bulk discounts?', answer: 'Yes! Our pricing is tiered — the more you order, the lower the per-unit price. You\'ll see the price breaks automatically when selecting quantities. For orders over 1,000 units, contact us for custom quotes.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay through our secure PayPal checkout. For large orders ($500+), we can arrange invoicing or payment plans.' },
      { question: 'Do you have promo codes or discounts?', answer: 'Yes! We offer promo codes for friends & family, first-time customers, and special events/trade shows. Enter your code at checkout to see your discount applied instantly.' },
    ],
  },
  {
    title: 'Design & Artwork',
    faqs: [
      { question: 'Do I need to have a design ready?', answer: 'Not necessarily! We accept print-ready files (PNG, JPG, PDF, AI, SVG, EPS), but we also offer design assistance. Upload what you have and we\'ll work with you to get it print-ready.' },
      { question: 'What file formats do you accept?', answer: 'We accept PNG, JPG, PDF, AI, SVG, and EPS files. For best results, provide vector files (AI, SVG, EPS) or high-resolution images (300 DPI minimum). We\'ll let you know if your file needs adjustments.' },
      { question: 'What is your proof process?', answer: 'Every order includes a free digital proof within 24 hours. You\'ll see exactly how your stickers, signs, or prints will look before we produce them. We won\'t print until you approve.' },
      { question: 'Can you match specific brand colors?', answer: 'Yes! We can match Pantone colors and work from your brand guidelines. Just include your color codes or brand kit when you place your order.' },
    ],
  },
  {
    title: 'Products & Materials',
    faqs: [
      { question: 'What sticker materials do you offer?', answer: 'We offer matte vinyl, glossy vinyl, clear/transparent, holographic, paper, and specialty finishes like embossed and UV spot coating. All vinyl stickers are waterproof, UV-resistant, and built to last outdoors.' },
      { question: 'How durable are your stickers?', answer: 'Our vinyl stickers are waterproof, UV-resistant, and rated for 3-5 years of outdoor use. They\'re perfect for laptops, water bottles, cars, signage, and packaging. Paper stickers are best for indoor use.' },
      { question: 'What vehicle wrap materials do you use?', answer: 'We use premium 3M and Avery cast vinyl for vehicle wraps — the industry standard for durability, conformability, and color accuracy. Full wraps include a protective laminate for scratch and UV resistance.' },
      { question: 'Do you do custom packaging (mylar bags)?', answer: 'Yes! We print custom-branded mylar bags in multiple sizes (8th, quarter, ounce, half-pound, pound) with your artwork. We also do custom jar labels. Full-color printing with matte, gloss, or foil finishes.' },
    ],
  },
  {
    title: 'Shipping & Turnaround',
    faqs: [
      { question: 'How fast can I get my order?', answer: 'Standard production is 3-5 business days + shipping. Express production (1-2 days) is available for most products. Shipping is typically 2-5 business days via USPS/UPS. Bay Area customers can arrange local pickup.' },
      { question: 'Do you ship nationwide?', answer: 'Yes! We ship anywhere in the continental United States. Standard shipping is free on all orders. Expedited and overnight shipping options are available at checkout.' },
      { question: 'What about large format items (signs, wraps)?', answer: 'Vehicle wraps and large signage are typically installed by our team in the Bay Area. For out-of-area customers, we can ship flat or rolled items. Installation-required items (wraps, window film) need an on-site appointment.' },
      { question: 'Can I pick up my order locally?', answer: 'Yes! Bay Area customers can pick up orders from our location. Just select "Local Pickup" or contact us to arrange a pickup time. This is the fastest way to get your order.' },
    ],
  },
  {
    title: 'Services & Capabilities',
    faqs: [
      { question: 'What services do you offer beyond stickers?', answer: 'We\'re a full-service print and branding shop: custom stickers & labels, vehicle wraps & graphics, business signage, event canopies & displays, business print (cards, flyers, postcards), window film & tint, and mylar packaging.' },
      { question: 'Do you do vehicle wraps?', answer: 'Yes! We do full wraps, partial wraps, fleet branding, door/spot graphics, vinyl lettering, and perforated window graphics. We use premium 3M/Avery materials and offer professional installation in the Bay Area.' },
      { question: 'Do you handle event setups (canopies, banners)?', answer: 'Absolutely. We print custom canopies (5x5 to 10x20), retractable banners, backdrops, table covers, and feather flags. Perfect for trade shows, pop-ups, farmers markets, and events.' },
      { question: 'Do you install window film and tint?', answer: 'Yes — we do frosted/decorative film, solar/UV film, security film, and automotive window tint. Commercial and residential. Bay Area installation included.' },
    ],
  },
]

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const activeFaqs = faqCategories[activeCategory].faqs

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="section-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know — no question left unanswered</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {faqCategories.map((cat, i) => (
            <button
              key={cat.title}
              onClick={() => { setActiveCategory(i); setOpenIndex(null) }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === i
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activeFaqs.map((faq, index) => (
            <motion.div key={`${activeCategory}-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border border-border rounded-xl overflow-hidden bg-card/50">
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors">
                <span className="font-semibold text-base pr-4">{faq.question}</span>
                <ChevronDown size={20} className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
          <p className="text-muted-foreground">Still have questions? <a href="/contact" className="text-primary font-bold hover:underline">Contact us</a> — we respond within 24 hours.</p>
        </motion.div>
      </div>
    </section>
  )
}
