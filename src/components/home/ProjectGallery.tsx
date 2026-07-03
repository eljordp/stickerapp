import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { homepageGallery, type Project } from '@/lib/projects'
import ProjectModal from '@/components/ProjectModal'

export default function ProjectGallery() {
  const [active, setActive] = useState<Project | null>(null)

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
          {homepageGallery.map((project, index) => (
            <motion.button
              key={project.slug}
              type="button"
              onClick={() => setActive(project)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 snap-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
              aria-label={`View ${project.title}`}
            >
              <div className="relative w-60 sm:w-72 md:w-80 aspect-square rounded-2xl overflow-hidden border border-border cursor-pointer">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Always-visible bottom title strip */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">
                    {project.category}
                  </p>
                  <p className="text-white font-bold text-sm leading-tight line-clamp-1">
                    {project.title}
                  </p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-black text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    View Details
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
