import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import customStickersShowcase from '@/assets/stickers/custom-stickers-showcase.png'
import customLabelsShowcase from '@/assets/stickers/custom-labels-showcase.png'

const showcases = [
  {
    title: 'Custom Stickers That Last',
    subtitle: 'Waterproof, durable, precision cut',
    description: 'From die-cut vinyl to holographic finishes, our stickers are built to stick anywhere and withstand anything. Perfect for branding, packaging, and personal expression.',
    cta: 'Shop Stickers',
    href: '/stickers',
    image: customStickersShowcase,
  },
  {
    title: 'The Perfect Fit for Products',
    subtitle: 'High-quality labels & packaging',
    description: 'Professional product labels, packaging stickers, and custom mylar bags. Printed with precision for a flawless finish on every product you ship.',
    cta: 'Shop Labels',
    href: '/stickers',
    image: customLabelsShowcase,
  },
]

export default function ProductShowcase() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-6">
          {showcases.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link
                to={item.href}
                className="group block relative overflow-hidden rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                {/* Image section */}
                <div className="relative h-44 sm:h-56 md:h-72 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                </div>

                {/* Content section */}
                <div className="relative bg-card p-6 md:p-8 -mt-12">
                  <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">{item.subtitle}</p>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight">{item.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">{item.description}</p>
                  <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                    {item.cta}<ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
