import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Shield, Wrench, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import ServicePageIntro from '@/components/ServicePageIntro'
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
  { step: '1', title: 'Measure & Plan', desc: 'Share your space dimensions, photos, and branding. We\'ll recommend the best signage solution.' },
  { step: '2', title: 'Design & Proof', desc: 'We create a digital mockup showing how your sign will look in your actual space.' },
  { step: '3', title: 'Production', desc: 'Cut, printed, and finished with premium materials. Quality inspected before delivery.' },
  { step: '4', title: 'Install or Ship', desc: 'Bay Area: we install it for you. Nationwide: shipped flat or rolled, ready to mount.' },
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
  const [estimateSelection, setEstimateSelection] = useState('')
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
            title="Business Signs in Hayward"
            description="Order storefront graphics, A-frame signs, retractable banners, and wall graphics with local install support when needed."
          />
          <div id="shop" className="scroll-mt-24 mb-12">
            <ProductOrder
              categoryNames={['Storefront Graphics', 'A-Frame Signs', 'Retractable Banners', 'Wall Graphics']}
              onCategoryChange={handleCategoryChange}
              checkoutMode="estimate"
              onEstimateRequest={setEstimateSelection}
            />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mb-8">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Local signage shop</p>
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-3">A local Hayward sign company for storefronts, offices, and events.</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Sticker Smith produces business signs and signage in Hayward for shops, offices, restaurants, pop-ups, dispensaries, service companies, and event teams across the East Bay and wider Bay Area.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {['Hayward storefront signs', 'A-frame sidewalk signs', 'Window decals', 'Wall graphics', 'Outdoor banners', 'Acrylic signs'].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-card p-3 font-semibold">{item}</div>
                ))}
              </div>
            </div>
          </motion.div>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-12">
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
            service="Signage"
            title="See your signage in place"
            subtitle="Upload your logo — we'll preview it on a storefront, wall, or sidewalk sign."
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
      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Signage FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black">Business signage questions</h2>
          </div>
          <div className="grid gap-4">
            {signageFaqs.map((faq) => (
              <div key={faq.q} className="bg-card/70 border border-border rounded-xl p-5">
                <h3 className="font-bold text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Business Signage"
            title="Get a Custom Signage Estimate"
            subtitle="Storefront, wall, window — tell us the scope and we'll reply with availability, questions, and an exact estimate."
            initialProject={estimateSelection}
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
    </>
  )
}
