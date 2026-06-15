import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Clock, MapPin, Shield, Sticker } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { stickerSupportPageBySlug, stickerSupportPages, type StickerSupportPageConfig } from '@/lib/stickerSupportPages'
import { cities } from '@/lib/cities'

function StickerSupportPageInner({ page }: { page: StickerSupportPageConfig }) {
  const relatedPages = stickerSupportPages.filter((item) => item.slug !== page.slug).slice(0, 4)

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.heroTitle}
        subtitle={page.heroSubtitle}
        image={page.image}
        imageAlt={page.imageAlt}
        icon={Sticker}
        primaryCta={{ label: 'Order Custom Stickers', href: '/stickers#configure' }}
        secondaryCta={{ label: 'Get a Quote', href: '/contact' }}
      />

      <section className="py-12 md:py-16 border-b border-border/50">
        <div className="section-container max-w-6xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Bay Area Sticker Printing</p>
              <h2 className="text-3xl md:text-4xl font-black mb-4">{page.title}, proofed before we print.</h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{page.intro}</p>
              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Clock, label: '24hr proof' },
                  { icon: Shield, label: 'Waterproof options' },
                  { icon: MapPin, label: 'Hayward pickup' },
                ].map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-xl p-4">
                    <item.icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm font-bold">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Best for</h3>
              <ul className="space-y-3">
                {page.bestFor.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-card">
        <div className="section-container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-4">
            {page.details.map((detail) => (
              <motion.div
                key={detail}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border rounded-xl p-5"
              >
                <CheckCircle className="w-5 h-5 text-primary mb-3" />
                <p className="text-sm md:text-base leading-relaxed">{detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {page.localAnswer && (
        <section className="py-12 md:py-16 border-b border-border/50">
          <div className="section-container max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">{page.localAnswer.eyebrow}</p>
                <h2 className="text-3xl md:text-4xl font-black mb-4">{page.localAnswer.title}</h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{page.localAnswer.copy}</p>
              </motion.div>
              <div className="grid gap-4">
                {page.localAnswer.points.map((point) => (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <CheckCircle className="w-5 h-5 text-primary mb-3" />
                    <h3 className="font-bold mb-2">{point.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{point.copy}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 border-b border-border/50">
        <div className="section-container max-w-5xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Local Service Area</p>
            <h2 className="text-3xl md:text-4xl font-black">Printed in Hayward for the Bay Area</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Pick up locally at the shop or have your order shipped. We regularly work with customers across the East Bay and wider Bay Area.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {cities.slice(0, 8).map((city) => (
              <Link
                key={city.slug}
                to={`/${city.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Questions</p>
            <h2 className="text-3xl md:text-4xl font-black">{page.title} FAQ</h2>
          </div>
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <div key={faq.q} className="bg-card/70 border border-border rounded-xl p-5">
                <h3 className="font-bold text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-card">
        <div className="section-container max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">More Sticker Options</p>
              <h2 className="text-3xl md:text-4xl font-black">Build the right sticker order</h2>
            </div>
            <Link to="/stickers" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
              Main sticker order page <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedPages.map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className="group bg-background border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black">
                  <img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.serviceType}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="section-container text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-black mb-5">Ready to print?</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Upload artwork, choose specs, and get a proof before production starts.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/stickers#configure" className="btn-primary">Start Sticker Order <ArrowRight size={18} /></Link>
            <Link to="/contact" className="btn-secondary">Ask for a Quote</Link>
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
