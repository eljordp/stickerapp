import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, type LucideIcon } from 'lucide-react'

type Action = {
  label: string
  href: string
}

type Spec = {
  icon: LucideIcon
  label: string
  value: string
}

type ProcessStep = {
  title: string
  desc: string
}

function SmartLink({
  action,
  className,
}: {
  action: Action
  className: string
}) {
  if (action.href.startsWith('#')) {
    return (
      <a href={action.href} className={className}>
        {action.label}
      </a>
    )
  }
  return (
    <Link to={action.href} className={className}>
      {action.label}
    </Link>
  )
}

export function ServiceActionBand({
  eyebrow = 'Next Step',
  title,
  subtitle,
  items,
  primary,
  secondary,
}: {
  eyebrow?: string
  title: string
  subtitle: string
  items: string[]
  primary: Action
  secondary?: Action
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mb-10 grid max-w-5xl gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 md:grid-cols-[1.05fr_0.95fr] md:p-7"
    >
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mb-3 text-2xl font-black leading-tight md:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <SmartLink action={primary} className="btn-primary text-sm" />
          {secondary && <SmartLink action={secondary} className="btn-secondary text-sm" />}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3 text-sm">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="leading-snug text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function ServiceDetailsBand({
  eyebrow = 'Details',
  title,
  intro,
  features,
  specs,
  process,
}: {
  eyebrow?: string
  title: string
  intro?: string
  features: string[]
  specs: Spec[]
  process: ProcessStep[]
}) {
  return (
    <section className="border-t border-border/50 py-10 md:py-14">
      <div className="section-container">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
            <h2 className="mb-3 text-2xl font-black md:text-3xl">{title}</h2>
            {intro && <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-4"
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-xl border border-border bg-card p-4">
                  <spec.icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{spec.label}</p>
                  <p className="text-xs font-semibold leading-snug">{spec.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">How orders move</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {process.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{step.title}</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function ServiceFaqSection({
  eyebrow,
  title,
  faqs,
}: {
  eyebrow: string
  title: string
  faqs: { q: string; a: string }[]
}) {
  return (
    <section className="border-t border-border/50 py-10 md:py-14">
      <div className="section-container max-w-4xl">
        <div className="mb-7 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
          <h2 className="text-3xl font-black md:text-4xl">{title}</h2>
        </div>
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-border bg-card/70 p-5">
              <h3 className="mb-2 text-base font-bold md:text-lg">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TextArrow() {
  return <ArrowRight size={14} />
}
