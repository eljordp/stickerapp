import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { caseStudies } from '@/lib/caseStudies'
import { projects, projectCategories, type Project } from '@/lib/projects'
import PageHero from '@/components/PageHero'
import ProjectModal from '@/components/ProjectModal'

const serviceProofLinks = [
  {
    label: 'Bay Area custom stickers',
    category: 'Stickers',
    href: '/stickers',
    description: 'Die-cut stickers, sticker sheets, roll labels, holographic runs, and product labels.',
  },
  {
    label: 'Hayward business signs',
    category: 'Business Signage',
    href: '/services/business-signage',
    description: 'Storefront signs, window graphics, wall graphics, A-frames, and in-store installs.',
  },
  {
    label: 'Custom canopies and banners',
    category: 'Events',
    href: '/services/event-displays',
    description: 'Event booths, banners, feather flags, backdrops, table covers, and custom vinyl floors.',
  },
  {
    label: 'Bay Area vehicle graphics',
    category: 'Vehicle Graphics',
    href: '/services/vehicle-graphics',
    description: 'Fleet wraps, truck graphics, door decals, spot graphics, and full vehicle wraps.',
  },
  {
    label: 'Custom mylar packaging',
    category: 'Mylar Packaging',
    href: '/mylar',
    description: 'Printed mylar bags, retail packaging, pouch artwork, and product label systems.',
  },
  {
    label: 'Business print materials',
    category: 'Business Print',
    href: '/services/business-print',
    description: 'Business cards, flyers, posters, coupons, and branded marketing materials.',
  },
]

export default function Projects() {
  const [active, setActive] = useState<string>('All')
  const [openProject, setOpenProject] = useState<Project | null>(null)
  // Exclude projects already featured up top as case studies so they don't appear twice.
  const gridProjects = projects.filter((p) => !p.caseStudySlug)
  const filtered = active === 'All' ? gridProjects : gridProjects.filter((p) => p.category === active)

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Real jobs, real clients."
        subtitle="Bay Area fleets, storefronts, weddings, and brands. Every project is shipped, installed, and standing today."
        primaryCta={{ label: 'Start a Project', href: '/contact' }}
        secondaryCta={{ label: 'All Services', href: '/services' }}
      />
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

      <section className="py-8 md:py-14 border-b border-border/50">
        <div className="section-container max-w-6xl">
          <div className="mb-6">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1.5">Project Proof By Service</p>
            <h2 className="text-xl md:text-3xl font-black">Proof that this is more than stickers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceProofLinks.map((item) => (
              <div
                key={item.label}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all"
              >
                <Link
                  to={item.href}
                  className="text-sm font-black text-foreground group-hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{item.description}</p>
                <button
                  type="button"
                  onClick={() => setActive(item.category)}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary mt-4"
                >
                  Show {item.category}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="section-container">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-black mb-1">Project Gallery</h2>
            <p className="text-sm text-muted-foreground">Click any project to see scope, materials, and the story behind it.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {projectCategories.map((cat) => (
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
                <motion.button
                  key={project.slug}
                  type="button"
                  layout
                  onClick={() => setOpenProject(project)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative overflow-hidden rounded-2xl border border-border aspect-[4/3] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    project.hideOnMobile ? 'hidden md:block' : ''
                  }`}
                  aria-label={`View ${project.title}`}
                >
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90 mb-0.5">{project.category}</p>
                    <h3 className="text-white font-bold leading-tight">{project.title}</h3>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/95 text-black text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      View Details
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
    </>
  )
}
