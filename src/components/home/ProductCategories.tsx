import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import featherFlags from '@/assets/projects/feather-flags.jpg'
import plu2o from '@/assets/projects/plu2o-dispensary.jpg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'

const categories = [
  {
    title: 'Die-Cut Stickers',
    description: 'Any shape, precision cut to your design',
    href: '/order',
    image: eventBooth,
  },
  {
    title: 'Sticker Sheets',
    description: 'Multiple designs on one sheet',
    href: '/order',
    image: featherFlags,
  },
  {
    title: 'Holographic Stickers',
    description: 'Eye-catching holographic finishes',
    href: '/order',
    image: plu2o,
  },
  {
    title: 'Custom Packaging',
    description: 'Branded mylar bags & boxes',
    href: '/order',
    image: elevated,
  },
]

export default function ProductCategories() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={cat.href}
                className="group block relative overflow-hidden rounded-2xl border border-border aspect-[3/4] hover:border-primary/40 transition-all duration-300"
              >
                {/* Background image */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-all duration-300" />

                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="font-black text-lg md:text-xl text-white mb-1">{cat.title}</h3>
                  <p className="text-white/70 text-sm">{cat.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
