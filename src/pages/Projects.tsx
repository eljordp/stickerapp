import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { caseStudies } from '@/lib/caseStudies'

import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import bhogal from '@/assets/projects/bhogal-construction.jpeg'
import curatedBarbershop from '@/assets/projects/curated-barbershop.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import tecEquipment from '@/assets/projects/tec-equipment-truck.jpeg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import featherFlags from '@/assets/projects/feather-flags.jpg'
import plu2oDispensary from '@/assets/projects/plu2o-dispensary.jpg'
import weddingFloor2 from '@/assets/projects/wedding-vinyl-floor-2.jpeg'
import weddingFloor3 from '@/assets/projects/wedding-vinyl-floor-3.jpeg'
import culturalDanceFloor from '@/assets/projects/cultural-dance-floor-2.jpeg'
import weddingDisplay from '@/assets/projects/wedding-display-signage-1.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
// Sticker work
import stkDieCut from '@/assets/projects/stickers-die-cut-stack.jpg'
import stkHolo from '@/assets/projects/stickers-holographic.jpg'
import stkLaptop from '@/assets/projects/stickers-on-laptop.jpg'
import stkSheet from '@/assets/projects/stickers-sheet.jpg'
import stkRoll from '@/assets/projects/stickers-roll.jpg'
// Mylar + packaging
import mylarBlack from '@/assets/projects/mylar-black-pouches.jpg'
import mylarGold from '@/assets/projects/mylar-gold-foil.jpg'
import mylarCannabis from '@/assets/projects/mylar-cannabis-style.jpg'
import mylarFood from '@/assets/projects/mylar-food-packaging.jpg'
// Business print
import bizCards from '@/assets/projects/business-cards-luxury.jpg'
import bizCardsFoil from '@/assets/projects/business-cards-foil.jpg'
import flyers from '@/assets/projects/flyers-full-color.jpg'
import postcards from '@/assets/projects/postcards-set.jpg'

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
  { image: featherFlags, title: 'Custom Feather Flags', category: 'Events' },
  { image: plu2oDispensary, title: 'Plu2o Dispensary Signage', category: 'Business Signage' },
  { image: weddingFloor2, title: 'Wedding Floor Graphics', category: 'Events' },
  { image: weddingFloor3, title: 'Custom Floor Decal', category: 'Events' },
  { image: culturalDanceFloor, title: 'Cultural Event Floor Vinyl', category: 'Events' },
  { image: weddingDisplay, title: 'Wedding Display Signage', category: 'Events' },
  { image: safewayInstall, title: 'Safeway In-Store Install', category: 'Business Signage' },
  // Stickers
  { image: stkDieCut, title: 'Die-Cut Vinyl Stickers', category: 'Stickers' },
  { image: stkHolo, title: 'Holographic Stickers', category: 'Stickers' },
  { image: stkLaptop, title: 'Sticker Collection', category: 'Stickers' },
  { image: stkSheet, title: 'Kiss-Cut Sticker Sheets', category: 'Stickers' },
  { image: stkRoll, title: 'Stickers on Roll', category: 'Stickers' },
  // Mylar
  { image: mylarBlack, title: 'Matte Black Mylar Pouches', category: 'Mylar Packaging' },
  { image: mylarGold, title: 'Gold Foil Mylar', category: 'Mylar Packaging' },
  { image: mylarCannabis, title: 'Cannabis Packaging', category: 'Mylar Packaging' },
  { image: mylarFood, title: 'Food-Grade Mylar Bags', category: 'Mylar Packaging' },
  // Business Print
  { image: bizCards, title: 'Premium Business Cards', category: 'Business Print' },
  { image: bizCardsFoil, title: 'Specialty Finish Cards', category: 'Business Print' },
  { image: flyers, title: 'Full-Color Flyers', category: 'Business Print' },
  { image: postcards, title: 'Custom Postcards', category: 'Business Print' },
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
      {/* Featured case studies */}
      <section className="py-8 md:py-12 border-b border-border/50">
        <div className="section-container max-w-6xl">
          <div className="mb-6">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1.5">Featured Case Studies</p>
            <h2 className="text-xl md:text-3xl font-black">The full story behind the work</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                to={`/case-studies/${study.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all"
              >
                <img src={study.thumbnail} alt={study.client} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/80">
                  {study.category}
                </div>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">{study.client}</p>
                  <p className="text-sm md:text-base font-black text-white leading-tight group-hover:text-primary transition-colors">
                    {study.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="section-container">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-black mb-1">Project Gallery</h2>
            <p className="text-sm text-muted-foreground">Filter by category to see what's been through the shop.</p>
          </div>
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
