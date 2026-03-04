import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import bhogal from '@/assets/projects/bhogal-construction.jpeg'
import curatedBarbershop from '@/assets/projects/curated-barbershop.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import tecEquipment from '@/assets/projects/tec-equipment-truck.jpeg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'

const categories = ['All', 'Vehicle Graphics', 'Business Signage', 'Stickers', 'Business Print', 'Mylar Packaging', 'Events'] as const

const projects = [
  { image: albertsonsVan, title: 'Albertsons Fleet Graphics', category: 'Vehicle Graphics' },
  { image: atlasPizza, title: 'Atlas Pizza Signage', category: 'Business Signage' },
  { image: bhogal, title: 'Bhogal Construction', category: 'Vehicle Graphics' },
  { image: curatedBarbershop, title: 'Curated Barbershop', category: 'Business Signage' },
  { image: procareFleet, title: 'ProCare Fleet Branding', category: 'Vehicle Graphics' },
  { image: safewayTruck, title: 'Safeway Truck Wrap', category: 'Vehicle Graphics' },
  { image: tecEquipment, title: 'TEC Equipment', category: 'Vehicle Graphics' },
  { image: elevated, title: 'Elevated 925 Storefront', category: 'Business Signage' },
  { image: eventBooth, title: 'Event Booth Setup', category: 'Events' },
]

export default function Projects() {
  const [active, setActive] = useState<string>('All')
  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active)

  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Our Projects</h1>
          <p className="text-white/80 text-lg">A look at some of our recent work</p>
        </motion.div>
      </div>
      <section className="py-8 md:py-16">
        <div className="section-container">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  active === cat
                    ? 'bg-primary text-white'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="group relative overflow-hidden rounded-2xl border border-border aspect-[4/3]"
                >
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <h3 className="text-white font-bold">{project.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  )
}
