import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import bhogal from '@/assets/projects/bhogal-construction.jpeg'
import culturalDance from '@/assets/projects/cultural-dance-floor-1.jpeg'
import weddingFloor from '@/assets/projects/wedding-vinyl-floor-1.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
import tecEquipment from '@/assets/projects/tec-equipment-truck.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'

const galleryImages = [
  { src: albertsonsVan, alt: 'Albertsons fleet van wrap', label: '@thestickersmith' },
  { src: atlasPizza, alt: 'Atlas Pizza storefront signage', label: '@thestickersmith' },
  { src: bhogal, alt: 'Bhogal Construction truck', label: '@thestickersmith' },
  { src: culturalDance, alt: 'Cultural dance floor vinyl', label: '@thestickersmith' },
  { src: weddingFloor, alt: 'Wedding vinyl floor design', label: '@thestickersmith' },
  { src: safewayInstall, alt: 'Safeway installation', label: '@thestickersmith' },
  { src: tecEquipment, alt: 'TEC Equipment truck', label: '@thestickersmith' },
  { src: procareFleet, alt: 'ProCare fleet branding', label: '@thestickersmith' },
]

export default function ProjectGallery() {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="section-container mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-2">More Than Stickers</h2>
            <p className="text-muted-foreground text-lg">Vehicle wraps, signage, packaging & more for Bay Area businesses</p>
          </div>
          <Link to="/projects" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            View All Projects<ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>

      {/* Full-width scrolling gallery */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {galleryImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 snap-start"
            >
              <div className="group relative w-72 md:w-80 aspect-square rounded-2xl overflow-hidden border border-border cursor-pointer">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
