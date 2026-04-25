import { motion } from 'framer-motion'
import { Film, CheckCircle, Clock, Shield, Wrench, Zap } from 'lucide-react'
import PageHero from '@/components/PageHero'
import EstimateForm from '@/components/EstimateForm'
import SqFtEstimator from '@/components/SqFtEstimator'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import windowHero from '@/assets/services/window-film.jpg'
import windowFrosted from '@/assets/projects/window-frosted-office.jpg'
import windowAutoTint from '@/assets/projects/window-auto-tint.jpg'
import windowStorefront from '@/assets/projects/window-storefront-vinyl.jpg'
import windowDecorative from '@/assets/projects/window-decorative-pattern.jpg'
import windowInstall from '@/assets/projects/window-install-squeegee.jpg'
import windowSecurity from '@/assets/projects/window-security-film.jpg'
import officeWindowBlank from '@/assets/mockups/film-office-window-blank.jpg'
import storefrontGlassBlank from '@/assets/mockups/film-storefront-glass-blank.jpg'

const features = [
  'Frosted Privacy Film',
  'Solar & Heat Rejection Film',
  'Security & Safety Film',
  'Decorative Window Graphics',
  'Custom Cut Logos & Lettering',
  'Anti-Graffiti Film',
  'Automotive Window Tint',
]

const specs = [
  { icon: Shield, label: 'Materials', value: '3M, LLumar, SunTek premium films' },
  { icon: Clock, label: 'Turnaround', value: '1-3 days for auto tint, 3-7 for commercial' },
  { icon: Wrench, label: 'Installation', value: 'Professional install included (Bay Area)' },
  { icon: Zap, label: 'Benefits', value: 'UV blocking, heat reduction, privacy, security' },
]

const process = [
  { step: '1', title: 'Consult', desc: 'Tell us about your space or vehicle. We\'ll recommend the right film for your needs — privacy, heat, security, or style.' },
  { step: '2', title: 'Quote & Schedule', desc: 'Get a transparent quote based on window count and film type. We\'ll schedule your install at a convenient time.' },
  { step: '3', title: 'Install', desc: 'Our certified installers apply the film with precision. Clean, bubble-free results guaranteed.' },
  { step: '4', title: 'Warranty', desc: 'All installations come with manufacturer warranty. Residential, commercial, and automotive.' },
]

export default function WindowFilm() {
  return (
    <>
      <PageHero
        eyebrow="Window Film & Tint"
        title="Frosted, solar, security, decorative."
        subtitle="Privacy and brand on every pane of glass — auto, retail, and commercial. Premium 3M, LLumar, and SunTek with pro install."
        image={windowHero}
        imageAlt="Frosted window film install"
        icon={Film}
        primaryCta={{ label: 'Get a Quote', href: '#quote' }}
        secondaryCta={{ label: 'See Recent Jobs', href: '#portfolio' }}
      />
      <section className="py-8 md:py-16">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-black mb-6">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {specs.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-black mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map(p => (
                <div key={p.step}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black mb-3">{p.step}</div>
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Window Film"
            title="See your logo on the glass"
            subtitle="Upload your mark — preview a frosted film or vinyl cutout on a real window."
            scenes={[
              {
                key: 'office',
                label: 'Office Glass',
                base: officeWindowBlank,
                slot: { left: 25, top: 25, width: 50, height: 40 },
              },
              {
                key: 'storefront',
                label: 'Storefront Door',
                base: storefrontGlassBlank,
                slot: { left: 30, top: 30, width: 40, height: 40 },
              },
            ]}
          />
        </div>
      </section>
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Film + Tint Jobs"
            subtitle="Frosted privacy, auto tint, storefront vinyl, security film."
            projects={[
              { src: windowFrosted, alt: 'Office frosted film', caption: 'Office frosted film' },
              { src: windowStorefront, alt: 'Storefront vinyl graphics', caption: 'Storefront vinyl' },
              { src: windowAutoTint, alt: 'Auto tint install', caption: 'Auto tint install' },
              { src: windowDecorative, alt: 'Decorative pattern', caption: 'Decorative pattern' },
              { src: windowInstall, alt: 'Squeegee install', caption: 'Pro install' },
              { src: windowSecurity, alt: 'Security film', caption: 'Security film' },
            ]}
          />
        </div>
      </section>
      <section className="py-10 md:py-14 border-t border-border/50">
        <div className="section-container max-w-2xl">
          <SqFtEstimator
            service="Window Film & Tint"
            title="Window Film Quick Estimate"
            subtitle="Not sure what your tint job costs? Get a ballpark in seconds."
            tiers={[
              { maxSqFt: 25, price: 200, label: 'Small (up to 25 sq ft) — Standard Frosted' },
              { maxSqFt: 50, price: 400, label: 'Medium (25–50 sq ft) — Standard Frosted' },
              { maxSqFt: 100, price: 600, label: 'Large (50–100 sq ft) — Standard Frosted' },
              { maxSqFt: 150, price: 1000, label: '100–150 sq ft — Medium tint / Solar' },
              { maxSqFt: 300, price: 1800, label: '150–300 sq ft — Medium tint / Solar' },
            ]}
          />
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Window Film & Tint"
            title="Get a Window Film Estimate"
            subtitle="Frosted, solar, security, or auto tint — tell us the scope and we'll send a tailored estimate in 24 hours."
            fields={[
              {
                name: 'filmType',
                label: 'Film type',
                type: 'select',
                required: true,
                options: ['Frosted / Decorative', 'Solar / UV Protection', 'Security Film', 'Automotive Window Tint', 'Custom Logo Cutout', 'Not sure yet'],
              },
              {
                name: 'propertyType',
                label: 'Residential or commercial?',
                type: 'select',
                options: ['Residential', 'Commercial / Office', 'Retail / Storefront', 'Automotive'],
              },
              { name: 'windowCount', label: 'How many windows (approx)?', type: 'text', placeholder: 'e.g. 6 windows · or ~80 sq ft' },
              { name: 'location', label: 'Install location / city', type: 'text', placeholder: 'Oakland, CA' },
            ]}
          />
        </div>
      </section>
    </>
  )
}
