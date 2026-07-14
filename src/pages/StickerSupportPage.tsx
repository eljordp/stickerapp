import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Sticker } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { stickerSupportPageBySlug, stickerSupportPages, type StickerSupportPageConfig } from '@/lib/stickerSupportPages'

function getOrderHref(page: StickerSupportPageConfig) {
  if (page.slug === 'holographic-stickers') return '/stickers?product=holographic-stickers&material=Holographic#configure'
  return `/stickers?product=${page.slug}#configure`
}

function getOrderLabel(page: StickerSupportPageConfig) {
  if (page.slug === 'roll-labels') return 'Configure Roll Labels'
  if (page.slug === 'sticker-sheets') return 'Configure Sticker Sheets'
  if (page.slug === 'custom-labels') return 'Configure Product Labels'
  if (page.slug === 'holographic-stickers') return 'Configure Holographic Stickers'
  return `Configure ${page.title}`
}

function StickerSupportPageInner({ page }: { page: StickerSupportPageConfig }) {
  const relatedPages = stickerSupportPages.filter((item) => item.slug !== page.slug).slice(0, 4)
  const orderHref = getOrderHref(page)

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.heroTitle}
        subtitle={page.heroSubtitle}
        image={page.image}
        imageAlt={page.imageAlt}
        icon={Sticker}
        primaryCta={{ label: getOrderLabel(page), href: orderHref }}
        secondaryCta={{ label: 'Ask for a Quote', href: '/contact' }}
      />

      <section className="border-b border-border/50 py-10 md:py-14">
        <div className="section-container max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{page.serviceType}</p>
              <h2 className="mb-4 text-3xl font-black md:text-4xl">{page.title}, proofed before production.</h2>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{page.intro}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={orderHref} className="btn-primary text-sm">
                  Start Order <ArrowRight size={16} />
                </Link>
                <Link to="/stickers#configure" className="btn-secondary text-sm">
                  Compare Sticker Options
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-5 md:p-6"
            >
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">Best for</h3>
              <div className="grid gap-3">
                {page.bestFor.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-card py-10 md:py-14">
        <div className="section-container max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {page.details.map((detail) => (
              <motion.div
                key={detail}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-background p-5"
              >
                <CheckCircle className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm leading-relaxed md:text-base">{detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {page.localAnswer && (
        <section className="border-b border-border/50 py-10 md:py-14">
          <div className="section-container max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{page.localAnswer.eyebrow}</p>
                <h2 className="mb-3 text-2xl font-black md:text-3xl">{page.localAnswer.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{page.localAnswer.copy}</p>
              </motion.div>
              <div className="grid gap-3 md:grid-cols-3">
                {page.localAnswer.points.map((point) => (
                  <div key={point.title} className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-2 text-sm font-bold">{point.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{point.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-10 md:py-14">
        <div className="section-container max-w-4xl">
          <div className="mb-7 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Questions</p>
            <h2 className="text-3xl font-black md:text-4xl">{page.title} FAQ</h2>
          </div>
          <div className="grid gap-3">
            {page.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-card/70 p-5">
                <h3 className="mb-2 text-base font-bold md:text-lg">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 bg-card py-10 md:py-14">
        <div className="section-container max-w-6xl">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">More Sticker Options</p>
              <h2 className="text-2xl font-black md:text-4xl">Choose the format that fits the job.</h2>
            </div>
            <Link to={orderHref} className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2">
              {getOrderLabel(page)} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPages.map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-primary/40"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black">
                  <img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-bold">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.serviceType}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default function StickerSupportPage({ slug }: { slug: string }) {
  const page = stickerSupportPageBySlug[slug]
  if (!page) return <Navigate to="/stickers" replace />
  return <StickerSupportPageInner page={page} />
}
