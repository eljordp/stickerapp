import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import dieCutCategory from '@/assets/stickers/die-cut-category.png'
import stickerSheetsCategory from '@/assets/stickers/sticker-sheets-category.png'
import samplePacksCategory from '@/assets/stickers/sample-packs-category.png'
import labelsRollCategory from '@/assets/stickers/labels-roll-category.png'

const categories = [
  {
    title: 'Sample Packs',
    description: 'Pick your perfect match',
    href: '/order',
    image: samplePacksCategory,
  },
  {
    title: 'Die-Cut',
    description: 'Any shape',
    href: '/order',
    image: dieCutCategory,
  },
  {
    title: 'Sticker Sheets',
    description: 'Multiple designs',
    href: '/order',
    image: stickerSheetsCategory,
  },
  {
    title: 'Labels on Roll',
    description: 'Fast, pro-level labeling',
    href: '/order',
    image: labelsRollCategory,
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
                className="group block overflow-hidden rounded-2xl border border-border bg-gray-100 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="flex items-center justify-center p-6 md:p-8 aspect-square">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content below */}
                <div className="text-center pb-5 md:pb-6 px-4">
                  <h3 className="font-black text-lg md:text-xl mb-1">{cat.title}</h3>
                  <p className="text-muted-foreground text-sm">{cat.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
