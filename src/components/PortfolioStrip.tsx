import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

type Project = { src: string; alt: string; caption?: string }

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  projects: Project[]
}

export default function PortfolioStrip({ eyebrow = 'Recent Work', title, subtitle, projects }: Props) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{eyebrow}</p>
          <h2 className="text-2xl md:text-4xl font-black">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
          See all projects <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {projects.map((p, i) => (
          <motion.div
            key={p.src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.05 }}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-border"
          >
            <img
              src={p.src}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {p.caption && (
              <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-bold text-white">{p.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
