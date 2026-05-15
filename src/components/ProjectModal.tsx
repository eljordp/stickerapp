import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/projects'

type Props = {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: Props) {
  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
              <div className="relative bg-black aspect-square md:aspect-auto md:min-h-[400px]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="p-5 sm:p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {project.category}
                  </span>
                  {project.year && (
                    <span className="text-[10px] font-mono text-muted-foreground">· {project.year}</span>
                  )}
                </div>

                {project.client && (
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                    {project.client}
                  </p>
                )}
                <h3 className="text-2xl md:text-3xl font-black leading-tight mb-4">{project.title}</h3>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                  {project.description}
                </p>

                {(project.scope || project.materials) && (
                  <div className="grid grid-cols-2 gap-3 mb-6 pt-4 border-t border-border">
                    {project.scope && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          Scope
                        </p>
                        <p className="text-sm font-semibold">{project.scope}</p>
                      </div>
                    )}
                    {project.materials && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          Materials
                        </p>
                        <p className="text-sm font-semibold">{project.materials}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto flex flex-col sm:flex-row gap-2">
                  {project.caseStudySlug && (
                    <Link
                      to={`/case-studies/${project.caseStudySlug}`}
                      onClick={onClose}
                      className="btn-secondary text-sm px-4 py-2.5 inline-flex items-center justify-center gap-1.5"
                    >
                      Read the full story
                      <ArrowRight size={14} />
                    </Link>
                  )}
                  <Link
                    to="/contact"
                    onClick={onClose}
                    className="btn-primary text-sm px-4 py-2.5 inline-flex items-center justify-center gap-1.5"
                  >
                    Start something like this
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
