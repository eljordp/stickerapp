import { motion } from 'framer-motion'

import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import bhogal from '@/assets/projects/bhogal-construction.jpeg'
import curatedBarbershop from '@/assets/projects/curated-barbershop.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import tecEquipment from '@/assets/projects/tec-equipment-truck.jpeg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'

const projects = [
  { image: albertsonsVan, title: 'Albertsons Fleet Graphics' },
  { image: atlasPizza, title: 'Atlas Pizza Signage' },
  { image: bhogal, title: 'Bhogal Construction' },
  { image: curatedBarbershop, title: 'Curated Barbershop' },
  { image: procareFleet, title: 'ProCare Fleet Branding' },
  { image: safewayTruck, title: 'Safeway Truck Wrap' },
  { image: tecEquipment, title: 'TEC Equipment' },
  { image: elevated, title: 'Elevated 925 Storefront' },
  { image: eventBooth, title: 'Event Booth Setup' },
]

export default function Projects() {
  return (
    <section className="py-8 md:py-16">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">Our Projects</h1>
          <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-primary to-primary/40 mb-4" />
          <p className="text-muted-foreground text-lg">A look at some of our recent work</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <motion.div key={project.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group relative overflow-hidden rounded-2xl border border-border aspect-[4/3]">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <h3 className="text-white font-bold">{project.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
