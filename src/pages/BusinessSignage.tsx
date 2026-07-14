import { useCallback, useState } from 'react'
import { Clock, Shield, Wrench, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import ServicePageIntro from '@/components/ServicePageIntro'
import { ServiceActionBand, ServiceDetailsBand, ServiceFaqSection } from '@/components/ServiceSections'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import elevated925 from '@/assets/projects/elevated925-storefront.jpg'
import plu2o from '@/assets/projects/plu2o-dispensary.jpg'
import barbershop from '@/assets/projects/curated-barbershop.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
import weddingSignage from '@/assets/projects/wedding-display-signage-1.jpeg'
import storefrontBlank from '@/assets/optimized/mockups/signage-storefront-blank-1100.webp'
import wallInteriorBlank from '@/assets/optimized/mockups/signage-wall-interior-blank-1100.webp'
import aFrameBlank from '@/assets/optimized/mockups/signage-a-frame-blank-1100.webp'

const features = [
  'Storefront & Building Signs',
  'Wall Graphics & Murals',
  'A-Frame Sidewalk Signs',
  'Retractable Banners',
  'Acrylic & Metal Signs',
  'LED & Illuminated Signs',
]

const specs = [
  { icon: Shield, label: 'Materials', value: 'Vinyl, acrylic, aluminum, PVC, coroplast' },
  { icon: Clock, label: 'Turnaround', value: '3-7 business days depending on type' },
  { icon: Wrench, label: 'Installation', value: 'Professional install available (Bay Area)' },
  { icon: Zap, label: 'Durability', value: '3-10 years depending on material' },
]

const process = [
  { title: 'Measure & Plan', desc: 'Share dimensions, photos, and branding so we can recommend the right sign.' },
  { title: 'Proof', desc: 'We send a digital proof or mockup before anything goes into production.' },
  { title: 'Produce', desc: 'Your sign is printed, cut, finished, and checked before pickup, ship, or install.' },
  { title: 'Install or Ship', desc: 'Bay Area install is quoted when needed. Standard items can ship or be picked up.' },
]

const signageFaqs = [
  {
    q: 'Do you make business signs in Hayward?',
    a: 'Yes. The Sticker Smith makes custom business signs and signage in Hayward for storefronts, offices, restaurants, service companies, pop-ups, and retail locations across the East Bay.',
  },
  {
    q: 'Can you install storefront signs and window graphics?',
    a: 'Yes. Professional Bay Area installation is available for storefront signs, window graphics, wall graphics, vinyl lettering, acrylic signs, and A-frame signage.',
  },
  {
    q: 'What should I send for a signage quote?',
    a: 'Send photos of the install area, rough dimensions, your logo or artwork, the business location, and whether you need design help, printing only, or full installation.',
  },
]

export default function BusinessSignage() {
  const [activeMockup, setActiveMockup] = useState('storefront')
  const handleCategoryChange = useCallback((categoryName: string) => {
    const map: Record<string, string> = {
      'Storefront Graphics': 'storefront',
      'A-Frame Signs': 'aframe',
      'Retractable Banners': 'retractable',
      'Wall Graphics': 'wall',
    }
    setActiveMockup(map[categoryName] ?? 'storefront')
  }, [])

  return (
    <>
      <section className="pt-6 md:pt-10 pb-8 md:pb-16">
        <div className="section-container">
          <ServicePageIntro
            eyebrow="Business Signage"
            title="Order standard signs or quote a custom install."
            description="Shop A-frames, banners, storefront graphics, and wall graphics online. Send photos and dimensions when the job needs install or custom sizing."
          />
          <div id="shop" className="scroll-mt-24 mb-12">
            <ProductOrder
              categoryNames={['Storefront Graphics', 'A-Frame Signs', 'Retractable Banners', 'Wall Graphics']}
              onCategoryChange={handleCategoryChange}
              heading="Shop Signage Products"
            />
          </div>
          <ServiceActionBand
            eyebrow="Need custom?"
            title="Use the shop for standard signs. Use the quote form for measurements, install, or odd sizing."
            subtitle="Use the quote path when the sign needs dimensions, install details, site photos, unusual materials, or a custom finish. Standard signage products can go straight to cart."
            items={['Artwork can be uploaded now or sent after checkout', 'Every sign gets a proof before production', 'Install, site photos, and custom materials belong in the quote path']}
            primary={{ label: 'Request Custom Signage Quote', href: '#quote' }}
            secondary={{ label: 'See Installed Work', href: '#portfolio' }}
          />
        </div>
      </section>
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Signage We've Installed"
            subtitle="Storefronts, dispensaries, barbershops, weddings — real installs across the Bay."
            projects={[
              { src: atlasPizza, alt: 'Atlas Pizza storefront signage', caption: 'Atlas Pizza' },
              { src: elevated925, alt: 'Elevated 925 storefront', caption: 'Elevated 925' },
              { src: plu2o, alt: 'Plu2o dispensary signage', caption: 'Plu2o Dispensary' },
              { src: barbershop, alt: 'Curated barbershop', caption: 'Curated Barbershop' },
              { src: safewayInstall, alt: 'Safeway install', caption: 'Safeway install' },
              { src: weddingSignage, alt: 'Wedding display signage', caption: 'Wedding event signage' },
            ]}
          />
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Business Signage"
            title="Get a Custom Signage Estimate"
            subtitle="Storefront, wall, window — tell us the scope and we'll send a tailored estimate in 24 hours."
            fields={[
              {
                name: 'signageType',
                label: 'Signage type',
                type: 'select',
                required: true,
                options: ['Storefront / Exterior', 'Wall Graphics / Mural', 'Window Graphics', 'A-Frame / Sidewalk Sign', 'Retractable Banner', 'Multiple / Not sure'],
              },
              { name: 'size', label: 'Approximate size (sq ft or dimensions)', type: 'text', placeholder: "e.g. 8'x4'  or  ~30 sq ft" },
              { name: 'location', label: 'Install location / city', type: 'text', placeholder: 'San Leandro, CA' },
              {
                name: 'install',
                label: 'Do you need us to install it?',
                type: 'select',
                options: ["Yes — need professional install", "No — just print, I'll install", 'Not sure'],
              },
            ]}
          />
        </div>
      </section>
      <ServiceDetailsBand
        eyebrow="Signage Details"
        title="One compact view of what we make and how the job moves."
        intro="The Sticker Smith produces business signs in Hayward for storefronts, offices, restaurants, pop-ups, dispensaries, service companies, and events across the East Bay."
        features={features}
        specs={specs}
        process={process}
      />
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Signage"
            title="See your signage in place"
            subtitle="Upload your logo and preview it on a storefront, wall, or sidewalk sign."
            activeKey={activeMockup}
            onActiveKeyChange={setActiveMockup}
            scenes={[
              {
                key: 'storefront',
                label: 'Storefront',
                base: storefrontBlank,
                slot: { left: 13, top: 13, width: 75, height: 30 },
              },
              {
                key: 'wall',
                label: 'Interior Wall',
                base: wallInteriorBlank,
                slot: { left: 28, top: 20, width: 55, height: 40 },
              },
              {
                key: 'aframe',
                label: 'A-Frame',
                base: aFrameBlank,
                slot: { left: 31, top: 23, width: 36, height: 52 },
              },
              {
                key: 'retractable',
                label: 'Retractable Banner',
                variant: 'retractable-banner',
                slot: { left: 36, top: 13, width: 28, height: 58 },
              },
            ]}
          />
        </div>
      </section>
      <ServiceFaqSection
        eyebrow="Signage FAQ"
        title="Business signage questions"
        faqs={signageFaqs}
      />
    </>
  )
}
