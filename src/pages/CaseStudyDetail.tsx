import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Quote } from 'lucide-react'
import { getCaseStudy } from '@/lib/caseStudies'
import EstimateForm from '@/components/EstimateForm'

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const study = slug ? getCaseStudy(slug) : null

  if (!study) return <Navigate to="/projects" replace />

  return (
    <>
      {/* Hero */}
      <div className="relative -mt-16 md:-mt-18 pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={study.heroImage} alt={study.client} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-background" />
        </div>
        <div className="relative section-container z-10">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:brightness-110 transition-all mb-6"
          >
            <ArrowLeft size={14} /> All projects
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
              {study.category} · {study.client}
            </p>
            <h1 className="text-3xl md:text-6xl font-black text-white mb-4 leading-[1.05] tracking-tight">
              {study.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl">{study.tagline}</p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <section className="py-10 md:py-12 border-b border-border/50">
        <div className="section-container">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {study.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card/60 border border-border rounded-xl p-4"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{s.label}</p>
                <p className="text-lg md:text-xl font-black">{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Brief */}
      <section className="py-12 md:py-20">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">The Brief</p>
            <h2 className="text-2xl md:text-4xl font-black mb-5">What the client needed</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{study.brief}</p>
          </motion.div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-12 md:py-20 bg-card/30 border-y border-border/50">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">The Approach</p>
            <h2 className="text-2xl md:text-4xl font-black mb-8">How we solved it</h2>
            <div className="space-y-5">
              {study.approach.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={16} className="text-primary" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process + Gallery */}
      <section className="py-12 md:py-20">
        <div className="section-container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 max-w-3xl"
          >
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-2xl md:text-4xl font-black mb-5">Inside the shop</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{study.process}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {study.galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl overflow-hidden border border-border aspect-[4/3]"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Result */}
      <section className="py-12 md:py-20 bg-card/30 border-y border-border/50">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">The Result</p>
            <h2 className="text-2xl md:text-4xl font-black mb-5">Outcome</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{study.result}</p>
            {study.testimonial && (
              <div className="relative bg-card border border-border rounded-3xl p-6 md:p-10">
                <Quote size={32} className="text-primary/30 mb-4" />
                <p className="text-xl md:text-2xl font-semibold leading-relaxed mb-5">
                  "{study.testimonial.quote}"
                </p>
                <p className="font-bold">{study.testimonial.name}</p>
                {study.testimonial.role && (
                  <p className="text-sm text-muted-foreground">{study.testimonial.role}</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA — service-specific estimate form */}
      <section className="py-12 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
              {study.cta.eyebrow}
            </p>
            <h2 className="text-2xl md:text-4xl font-black mb-4">{study.cta.headline}</h2>
            <p className="text-lg text-muted-foreground">{study.cta.body}</p>
          </div>
          <EstimateForm
            service={study.cta.service}
            title="Request a Similar Quote"
            subtitle={`Give us the basics and we'll send a tailored ${study.cta.service.toLowerCase()} estimate within 24 hours.`}
            fields={[
              { name: 'scope', label: 'What are you looking to get done?', type: 'textarea', required: true, placeholder: 'e.g. 3-truck fleet wrap for construction company, or storefront signage for new retail space' },
              { name: 'timeline', label: 'Timeline', type: 'select', options: ['ASAP / Within 2 weeks', '2–4 weeks', '1–2 months', 'Flexible'] },
              { name: 'location', label: 'Location / city', type: 'text', placeholder: 'Bay Area · ' },
            ]}
          />
        </div>
      </section>

      {/* Bottom nav */}
      <section className="py-12 border-t border-border/50">
        <div className="section-container text-center">
          <Link to="/projects" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> See more work
          </Link>
          <Link to="/services" className="ml-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:brightness-110 transition-all">
            Browse services <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  )
}
