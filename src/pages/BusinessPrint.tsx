import { useCallback, useState } from 'react'
import { Clock, Shield, Layers, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import StudioMockup from '@/components/StudioMockup'
import ServicePageIntro from '@/components/ServicePageIntro'
import { ServiceActionBand, ServiceDetailsBand } from '@/components/ServiceSections'
import bizCardsLuxury from '@/assets/projects/business-cards-luxury.jpg'
import bizCardsFoil from '@/assets/projects/bp-cleopatra-discount-cards.jpg'
import flyers from '@/assets/projects/flyers-full-color.jpg'
import postcards from '@/assets/projects/bp-empire-automotive-flyer.jpg'
import letterpress from '@/assets/projects/letterpress-detail.jpg'
import pressroom from '@/assets/projects/bp-cleopatra-tattoo-flyer.jpg'

const features = [
  'Business Cards',
  'Flyers & Door Hangers',
  'Postcards & Mailers',
  'Vehicle Magnets',
  'Premium Finishes',
  'Fast Turnaround',
]

const specs = [
  { icon: Shield, label: 'Paper Stock', value: '14pt & 16pt premium cardstock' },
  { icon: Clock, label: 'Turnaround', value: '3-5 business days standard' },
  { icon: Layers, label: 'Finishes', value: 'Matte, gloss, soft-touch, spot UV' },
  { icon: Zap, label: 'Printing', value: 'Full color, double-sided, bleed' },
]

const process = [
  { title: 'Choose Product', desc: 'Pick business cards, flyers, postcards, door hangers, or magnets.' },
  { title: 'Send Artwork', desc: 'Upload print-ready files now or send files after checkout.' },
  { title: 'Approve Proof', desc: 'Check layout, bleed, color, and text before anything prints.' },
  { title: 'Print & Ship', desc: 'We print on the selected stock and ship or prep local pickup.' },
]

export default function BusinessPrint() {
  const [activeMockup, setActiveMockup] = useState('card')
  const handleCategoryChange = useCallback((categoryName: string) => {
    const map: Record<string, string> = {
      'Business Cards': 'card',
      'Flyers & Door Hangers': 'flyer',
      'Postcards': 'postcard',
      'Vehicle Magnets': 'magnet',
    }
    setActiveMockup(map[categoryName] ?? 'card')
  }, [])

  return (
    <>
      <section className="pt-6 md:pt-10 pb-8 md:pb-16">
        <div className="section-container">
          <ServicePageIntro
            eyebrow="Business Print"
            title="Order everyday print pieces online."
            description="Business cards, flyers, postcards, door hangers, and magnets can be priced online. Use the quote form for bulk runs, specialty finishes, or mixed jobs."
          />
          <div id="shop" className="scroll-mt-24 mb-12">
            <ProductOrder
              categoryNames={['Business Cards', 'Flyers & Door Hangers', 'Postcards', 'Vehicle Magnets']}
              onCategoryChange={handleCategoryChange}
              heading="Shop Business Print"
            />
          </div>
          <ServiceActionBand
            eyebrow="Bulk or specialty?"
            title="Shop standard print online. Quote the jobs with volume, finish, or mixed specs."
            subtitle="Use the quote path for higher volume, specialty finishes, mixed products, or tight deadlines. Standard catalog pieces can go straight to cart."
            items={['Proof before production', 'Upload files now or after checkout', 'Bulk and specialty finishes belong in the quote path']}
            primary={{ label: 'Request Bulk Print Quote', href: '#quote' }}
            secondary={{ label: 'See Print Work', href: '#portfolio' }}
          />
        </div>
      </section>
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Print Work We're Proud Of"
            subtitle="Business cards with foil, soft-touch flyers, full-color postcards."
            projects={[
              { src: bizCardsLuxury, alt: 'Premium black business cards', caption: 'Matte black + foil' },
              { src: bizCardsFoil, alt: 'Printed discount cards for Cleopatra Ink', caption: 'Discount cards' },
              { src: flyers, alt: 'Full color flyers', caption: 'Full-color flyers' },
              { src: postcards, alt: 'Printed automotive promo flyers', caption: 'Automotive flyers' },
              { src: letterpress, alt: 'Letterpress detail', caption: 'Letterpress texture' },
              { src: pressroom, alt: 'Printed tattoo studio flyers', caption: 'Tattoo studio flyers' },
            ]}
          />
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Business Print"
            title="Bulk or Custom Print Quote"
            subtitle="Ordering 2,500+ cards, custom shapes, specialty finishes? Tell us the job and we'll send a sharper price."
            fields={[
              {
                name: 'printType',
                label: 'What are you printing?',
                type: 'select',
                required: true,
                options: ['Business Cards', 'Flyers / Brochures', 'Postcards', 'Door Hangers', 'Letterhead / Envelopes', 'Vehicle Magnets', 'Multiple / Not sure'],
              },
              { name: 'quantity', label: 'Approximate quantity', type: 'text', required: true, placeholder: 'e.g. 2,500 cards · 1,000 flyers' },
              {
                name: 'finish',
                label: 'Finish preference (if any)',
                type: 'select',
                options: ['Standard (matte or gloss)', 'Soft-touch', 'Spot UV', 'Foil stamping', 'Embossed', 'Not sure'],
              },
              {
                name: 'turnaround',
                label: 'Turnaround',
                type: 'select',
                options: ['Standard (5–7 days)', 'Rush (2–3 days)', 'Flexible'],
              },
            ]}
          />
        </div>
      </section>
      <ServiceDetailsBand
        eyebrow="Print Details"
        title="The practical print options, condensed."
        intro="Standard marketing pieces should be easy to buy. Use the catalog for clear sizes and quantities, then use the quote form when the job needs custom pricing."
        features={features}
        specs={specs}
        process={process}
      />
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <StudioMockup
            service="Business Print"
            title="Preview your design on paper"
            subtitle="Upload artwork and see it rendered on the product."
            activeKey={activeMockup}
            onActiveKeyChange={setActiveMockup}
            scenes={[
              { key: 'card', label: 'Business Card', shape: 'business-card' },
              { key: 'flyer', label: 'Flyer', shape: 'flyer' },
              { key: 'postcard', label: 'Postcard', shape: 'postcard' },
              { key: 'magnet', label: 'Vehicle Magnet', shape: 'sticker-rect' },
            ]}
          />
        </div>
      </section>
    </>
  )
}
