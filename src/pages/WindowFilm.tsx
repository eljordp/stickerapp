import { Clock, Shield, Wrench, Zap } from 'lucide-react'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import ServicePageIntro from '@/components/ServicePageIntro'
import { ServiceDetailsBand, ServiceFaqSection } from '@/components/ServiceSections'
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
  { title: 'Choose Film Type', desc: 'Privacy, decorative, solar, security, storefront graphics, or auto tint.' },
  { title: 'Measure Scope', desc: 'Window count, square footage, vehicle type, and photos help pricing.' },
  { title: 'Quote & Schedule', desc: 'We confirm film, install details, and timing before production.' },
  { title: 'Install', desc: 'Professional install is scheduled after quote approval.' },
]

const windowPaths = [
  {
    title: 'Commercial privacy',
    copy: 'Frosted film, office glass, meeting rooms, and interior privacy.',
  },
  {
    title: 'Storefront graphics',
    copy: 'Door logos, vinyl cutouts, decorative glass graphics, and retail windows.',
  },
  {
    title: 'Auto tint',
    copy: 'Vehicle tint inquiries need vehicle details and legal shade requirements confirmed.',
  },
]

const windowFaqs = [
  {
    q: 'What should I send for a window film quote?',
    a: 'Send the film type, window count or approximate square footage, photos of the glass, install city, and whether the job is commercial, retail, residential, or automotive.',
  },
  {
    q: 'Can you do storefront logos and frosted privacy film?',
    a: 'Yes. We can quote frosted privacy film, decorative window graphics, storefront vinyl, custom logo cutouts, and office glass treatments.',
  },
  {
    q: 'Is automotive tint priced the same as commercial film?',
    a: 'No. Auto tint depends on vehicle type, windows, film choice, and legal requirements. We confirm those details before scheduling.',
  },
]

export default function WindowFilm() {
  return (
    <>
      <section id="quote" className="pt-6 md:pt-10 pb-8 md:pb-16 scroll-mt-24">
        <div className="section-container">
          <ServicePageIntro
            eyebrow="Window Film"
            title="Window film quotes start with the type of glass."
            description="Choose privacy film, storefront graphics, solar/security film, or auto tint. Photos, window count, and location help us price it quickly."
          />
          <div className="mx-auto mb-8 grid max-w-6xl gap-4 md:grid-cols-3">
            {windowPaths.map((path) => (
              <div key={path.title} className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-2 text-lg font-black">{path.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{path.copy}</p>
              </div>
            ))}
          </div>
          <EstimateForm
            service="Window Film & Tint"
            title="Get a Window Film Estimate"
            subtitle="Send film type, glass photos, count or square footage, and install city."
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
              { name: 'photos', label: 'Photo or reference link', type: 'text', placeholder: 'Google Drive, Dropbox, Instagram, website, etc.' },
            ]}
          />
        </div>
      </section>
      <ServiceDetailsBand
        eyebrow="Window Film Details"
        title="The options are grouped after the quote path."
        intro="Window film and tint pricing depends on film type, glass count, install location, and whether the job is commercial, storefront, residential, or automotive."
        features={features}
        specs={specs}
        process={process}
      />
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
              { src: windowStorefront, alt: 'Storefront vinyl graphics', caption: 'Storefront vinyl' },
              { src: windowAutoTint, alt: 'Auto tint install', caption: 'Auto tint install' },
              { src: windowDecorative, alt: 'Decorative pattern', caption: 'Decorative pattern' },
              { src: windowInstall, alt: 'Squeegee install', caption: 'Pro install' },
              { src: windowSecurity, alt: 'Security film', caption: 'Security film' },
            ]}
          />
        </div>
      </section>
      <ServiceFaqSection
        eyebrow="Window Film FAQ"
        title="Window film, graphics, and tint questions"
        faqs={windowFaqs}
      />
    </>
  )
}
