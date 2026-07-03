import { Link } from 'react-router-dom'

import dieCutCategory from '@/assets/optimized/stickers/die-cut-category-512.webp'
import stickerSheetsCategory from '@/assets/optimized/stickers/sticker-group-512.webp'
import samplePacksCategory from '@/assets/optimized/stickers/sample-packs-category-512.webp'
import labelsRollCategory from '@/assets/optimized/stickers/labels-roll-category-512.webp'
import customLabelsCategory from '@/assets/optimized/stickers/custom-labels-showcase-512.webp'

const categories = [
  {
    title: 'Die-Cut',
    description: 'Custom shapes',
    href: '/stickers?product=die-cut#configure',
    image: dieCutCategory,
  },
  {
    title: 'Sticker Sheets',
    description: 'Multiple designs',
    href: '/stickers?product=sticker-sheets#configure',
    image: stickerSheetsCategory,
  },
  {
    title: 'Roll Labels',
    description: 'Product runs',
    href: '/stickers?product=labels-on-roll#configure',
    image: labelsRollCategory,
  },
  {
    title: 'Custom Labels',
    description: 'Jars, bottles, bags',
    href: '/stickers?product=custom-labels#configure',
    image: customLabelsCategory,
  },
  {
    title: 'Sample Packs',
    description: 'Compare finishes',
    href: '/stickers?product=sample-pack#configure',
    image: samplePacksCategory,
  },
]

export default function ProductCategories() {
  return (
    <section className="py-10 md:py-16">
      <div className="section-container">
        <div className="mb-6 md:mb-8 flex flex-col gap-2 text-center md:text-left">
          <p className="text-primary font-bold text-xs uppercase tracking-widest">Shop stickers</p>
          <h2 className="text-2xl md:text-4xl font-black">Start with the sticker format you need.</h2>
          <p className="text-muted-foreground md:text-lg">Pick a format, upload artwork, approve your proof, then we print.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
            >
              <Link
                to={cat.href}
                className="group block overflow-hidden rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="flex items-center justify-center p-6 md:p-8 aspect-square">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    width={512}
                    height={512}
                    className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content below */}
                <div className="text-center pb-5 md:pb-6 px-4">
                  <h3 className="font-black text-lg md:text-xl mb-1">{cat.title}</h3>
                  <p className="text-muted-foreground text-sm">{cat.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
