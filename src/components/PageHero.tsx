import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

type CTA = { label: string; href: string }

function CtaLink({ cta, primary }: { cta: CTA; primary?: boolean }) {
  const className = primary
    ? 'btn-primary'
    : 'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors text-sm font-semibold'
  if (cta.href.startsWith('#')) {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    )
  }
  return (
    <Link to={cta.href} className={className}>
      {cta.label}
    </Link>
  )
}

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  image?: string
  imageAlt?: string
  icon?: LucideIcon
  primaryCta?: CTA
  secondaryCta?: CTA
  variant?: 'centered' | 'split'
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  icon: Icon,
  primaryCta,
  secondaryCta,
  variant,
}: Props) {
  const layout = variant ?? (image ? 'split' : 'centered')

  return (
    <section
      className="relative -mt-16 md:-mt-18 pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-neutral-950 border-b border-border/50"
    >
      {/* Subtle grid backdrop — registration paper */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Soft cyan glow top-left, magenta glow bottom-right — subtle CMYK presence */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.07] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-pink-500/[0.06] blur-3xl pointer-events-none" />

      <div className="section-container relative">
        {layout === 'split' ? (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              {eyebrow && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 border border-neutral-600" />
                  <span className="ml-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-primary">
                    {eyebrow}
                  </span>
                </div>
              )}
              {Icon && <Icon className="w-9 h-9 text-primary mb-4 lg:hidden" />}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight leading-[1.05] text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base md:text-lg text-neutral-300 max-w-xl mb-7">
                  {subtitle}
                </p>
              )}
              {(primaryCta || secondaryCta) && (
                <div className="flex flex-wrap gap-3">
                  {primaryCta && <CtaLink cta={primaryCta} primary />}
                  {secondaryCta && <CtaLink cta={secondaryCta} />}
                </div>
              )}
            </motion.div>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] lg:aspect-square">
                  <img
                    src={image}
                    alt={imageAlt ?? title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            {eyebrow && (
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 border border-neutral-600" />
                <span className="ml-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-primary">
                  {eyebrow}
                </span>
              </div>
            )}
            {Icon && <Icon className="w-10 h-10 text-primary mx-auto mb-4" />}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight leading-[1.05] text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto mb-7">
                {subtitle}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap justify-center gap-3">
                {primaryCta && (
                  <Link to={primaryCta.href} className="btn-primary">
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    to={secondaryCta.href}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors text-sm font-semibold"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}
