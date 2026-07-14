import { Clock, Shield, Wrench, Zap } from 'lucide-react'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import ServicePageIntro from '@/components/ServicePageIntro'
import { ServiceDetailsBand, ServiceFaqSection } from '@/components/ServiceSections'
import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import bhogalTruck from '@/assets/projects/bhogal-construction.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
import sedanBlank from '@/assets/mockups/vehicle-sedan-blank.jpg'
import vanBlank from '@/assets/mockups/vehicle-van-blank.jpg'
import boxTruckBlank from '@/assets/mockups/vehicle-box-truck-blank.jpg'
import workVanBlank from '@/assets/mockups/vehicle-work-van-blank.jpg'

const features = [
  'Full Vehicle Wraps',
  'Partial Wraps & Accents',
  'Fleet Branding & Graphics',
  'Door & Spot Graphics',
  'Perforated Window Graphics',
  'Vinyl Lettering & Decals',
]

const specs = [
  { icon: Shield, label: 'Material', value: 'Premium 3M & Avery cast vinyl' },
  { icon: Clock, label: 'Turnaround', value: '5-10 business days (design + print + install)' },
  { icon: Wrench, label: 'Installation', value: 'Professional install included (Bay Area)' },
  { icon: Zap, label: 'Durability', value: '5-7 year outdoor rating with laminate' },
]

const process = [
  { title: 'Send Vehicle Details', desc: 'Year, make, model, photos, logo files, and the type of coverage you want.' },
  { title: 'Mockup & Quote', desc: 'We price the real scope and proof placement before production.' },
  { title: 'Print & Laminate', desc: 'Graphics are printed on premium vinyl and finished for outdoor use.' },
  { title: 'Install', desc: 'Bay Area installs are scheduled after proof approval and vehicle prep.' },
]

const quotePrep = [
  'Vehicle year, make, and model',
  'Straight-on photos of each side',
  'Logo or artwork files',
  'Decal, partial wrap, full wrap, or fleet scope',
]

const vehicleFaqs = [
  {
    q: 'Where can I get vehicle graphics in Hayward CA?',
    a: 'The Sticker Smith produces vehicle graphics in Hayward CA for Bay Area businesses, including door decals, vinyl lettering, partial wraps, full wraps, box truck graphics, van graphics, and fleet branding.',
  },
  {
    q: 'Do you handle vehicle wrap design and installation?',
    a: 'Yes. We can help with design, digital proofing, premium vinyl production, laminate, and professional installation for most vehicle graphic projects.',
  },
  {
    q: 'What should I send for a vehicle graphics quote?',
    a: 'Send the year, make, model, vehicle photos, logo files, the graphics you want, and whether you need decals, lettering, a partial wrap, full wrap, or fleet rollout.',
  },
]

export default function VehicleGraphics() {
  return (
    <>
      <section id="quote" className="pt-6 md:pt-10 pb-8 md:pb-16 scroll-mt-24">
        <div className="section-container">
          <ServicePageIntro
            eyebrow="Vehicle Graphics"
            title="Vehicle graphics are quoted around the actual vehicle."
            description="Send the vehicle, photos, and wrap type. We price decals, lettering, partial wraps, full wraps, and fleets around the actual vehicle."
          />
          <div className="mx-auto mb-8 grid max-w-6xl gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { src: albertsonsVan, alt: 'Albertsons fleet van wrap', label: 'Fleet vans' },
                { src: bhogalTruck, alt: 'Bhogal Construction truck wrap', label: 'Work trucks' },
                { src: procareFleet, alt: 'ProCare fleet branding', label: 'Multi-vehicle branding' },
              ].map((item) => (
                <div key={item.label} className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="aspect-[4/3] bg-black">
                    <img src={item.src} alt={item.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </div>
                  <p className="p-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">For a faster quote</p>
              <h2 className="mb-4 text-2xl font-black">Send the details that affect price.</h2>
              <div className="grid gap-2">
                {quotePrep.map((item) => (
                  <div key={item} className="rounded-xl border border-border bg-background/60 p-3 text-sm text-muted-foreground">{item}</div>
                ))}
              </div>
            </div>
          </div>
          <EstimateForm
            service="Vehicle Graphics"
            title="Get a Vehicle Graphics Estimate"
            subtitle="Send the vehicle and wrap type. Photos or reference links help us price faster."
            fields={[
              { name: 'vehicle', label: 'Vehicle (year, make, model)', type: 'text', required: true, placeholder: '2023 Ford Transit 250' },
              {
                name: 'wrapType',
                label: 'Wrap type',
                type: 'select',
                required: true,
                options: ['Full Wrap', 'Partial Wrap (half, quarter)', 'Decals / Lettering / Door Graphics', 'Fleet (multiple vehicles)', 'Not sure yet'],
              },
              { name: 'photos', label: 'Vehicle photos or reference links', type: 'text', placeholder: 'Google Drive, Dropbox, Instagram, website, etc.' },
            ]}
          />
        </div>
      </section>
      <ServiceDetailsBand
        eyebrow="Vehicle Details"
        title="Everything else, condensed below the inquiry."
        intro="The Sticker Smith produces vehicle graphics in Hayward for Bay Area work vans, trucks, service vehicles, fleets, decals, lettering, partial wraps, and full wraps."
        features={features}
        specs={specs}
        process={process}
      />
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Vehicle"
            title="See your brand on the vehicle"
            subtitle="Upload your logo — we'll show you how it looks on different vehicles before you commit."
            scenes={[
              {
                key: 'van',
                label: 'Ford Transit Van',
                base: vanBlank,
                slot: {
                  left: 39,
                  top: 35,
                  width: 48,
                  height: 22,
                  radius: '12px',
                  clipPath: 'polygon(2% 12%, 96% 8%, 100% 55%, 94% 93%, 8% 94%, 0 70%)',
                  imageFit: 'cover',
                  artworkPadding: 0,
                },
              },
              {
                key: 'sedan',
                label: 'Sedan',
                base: sedanBlank,
                slot: {
                  left: 24,
                  top: 47,
                  width: 52,
                  height: 18,
                  radius: '18px',
                  clipPath: 'polygon(4% 30%, 38% 20%, 98% 18%, 100% 70%, 88% 92%, 20% 92%, 0 72%)',
                  imageFit: 'cover',
                  artworkPadding: 0,
                },
              },
              {
                key: 'box',
                label: 'Box Truck',
                base: boxTruckBlank,
                slot: {
                  left: 33,
                  top: 31,
                  width: 50,
                  height: 31,
                  radius: '3px',
                  clipPath: 'polygon(0 0, 99% 0, 100% 94%, 2% 96%)',
                  imageFit: 'cover',
                  artworkPadding: 0,
                },
              },
              {
                key: 'sprinter',
                label: 'Work Van',
                base: workVanBlank,
                slot: {
                  left: 13,
                  top: 34,
                  width: 49,
                  height: 24,
                  radius: '12px',
                  clipPath: 'polygon(4% 18%, 98% 9%, 100% 58%, 89% 92%, 7% 94%, 0 75%)',
                  imageFit: 'cover',
                  artworkPadding: 0,
                },
              },
            ]}
          />
        </div>
      </section>
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Vehicle Wraps We've Done"
            subtitle="Real jobs, real clients. Bay Area fleets and single vehicles."
            projects={[
              { src: albertsonsVan, alt: 'Albertsons fleet van wrap', caption: 'Albertsons fleet' },
              { src: bhogalTruck, alt: 'Bhogal Construction truck wrap', caption: 'Bhogal Construction' },
              { src: procareFleet, alt: 'ProCare fleet branding', caption: 'ProCare fleet' },
              { src: safewayTruck, alt: 'Safeway truck wrap', caption: 'Safeway' },
              { src: safewayInstall, alt: 'Safeway installation', caption: 'Install day' },
            ]}
          />
        </div>
      </section>
      <ServiceFaqSection
        eyebrow="Vehicle Graphics FAQ"
        title="Wraps, decals, and fleet branding questions"
        faqs={vehicleFaqs}
      />
    </>
  )
}
