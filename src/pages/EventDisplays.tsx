import { useCallback, useState } from 'react'
import { Clock, Shield, Package, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import ServicePageIntro from '@/components/ServicePageIntro'
import { ServiceActionBand, ServiceDetailsBand, ServiceFaqSection } from '@/components/ServiceSections'
import featherFlags from '@/assets/projects/feather-flags.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import weddingSignage from '@/assets/projects/wedding-display-signage-1.jpeg'
import weddingFloor1 from '@/assets/projects/wedding-vinyl-floor-1.jpeg'
import weddingFloor2 from '@/assets/projects/wedding-vinyl-floor-2.jpeg'
import culturalFloor from '@/assets/projects/cultural-dance-floor-1.jpeg'
import canopyBlank from '@/assets/mockups/event-canopy-blank.jpg'
import flagBlank from '@/assets/mockups/event-feather-flag-blank.jpg'
import backdropBlank from '@/assets/mockups/event-backdrop-blank.jpg'

const features = [
  'Custom Printed Canopy Tents',
  'Feather & Teardrop Flags',
  'Retractable Banner Stands',
  'Table Covers & Throws',
  'Backdrop Displays',
  'Pop-Up Event Kits',
]

const specs = [
  { icon: Shield, label: 'Material', value: 'Heavy-duty polyester, steel & aluminum frames' },
  { icon: Clock, label: 'Turnaround', value: '5-10 business days' },
  { icon: Package, label: 'Shipping', value: 'Ships with carry bag & hardware' },
  { icon: Zap, label: 'Durability', value: 'UV & water resistant, reusable' },
]

const process = [
  { title: 'Choose Setup', desc: 'Pick the tent, table cover, banner, flag, backdrop, or booth kit.' },
  { title: 'Check Date', desc: 'Tell us the event date so hardware and production timing are realistic.' },
  { title: 'Proof', desc: 'Approve the mockup before production starts.' },
  { title: 'Ship or Pickup', desc: 'Displays ship with hardware when included, or can be picked up locally.' },
]

const eventFaqs = [
  {
    q: 'Where can I order custom canopies in Hayward CA?',
    a: 'The Sticker Smith prints custom canopies in Hayward CA for Bay Area events, pop-ups, markets, trade shows, school events, and branded business booths.',
  },
  {
    q: 'Do you print custom canopy tents in the Bay Area?',
    a: 'Yes. The Sticker Smith prints custom canopy tents, table covers, flags, banners, and backdrops for Bay Area and Hayward events, markets, trade shows, and pop-ups.',
  },
  {
    q: 'Can I order a full booth kit?',
    a: 'Yes. You can bundle a canopy, table cover, feather flags, retractable banners, and backdrop graphics so your event setup looks consistent from every angle.',
  },
  {
    q: 'How early should I order before an event?',
    a: 'Most event displays need 5 to 10 business days after proof approval. Rush options depend on the product, hardware availability, and event date.',
  },
]

export default function EventCanopies() {
  const [activeMockup, setActiveMockup] = useState('canopy')
  const handleCategoryChange = useCallback((categoryName: string) => {
    const map: Record<string, string> = {
      'Event Displays': 'canopy',
      'Backdrops & Displays': 'backdrop',
      'Table Covers': 'table',
    }
    setActiveMockup(map[categoryName] ?? 'canopy')
  }, [])

  return (
    <>
      <section className="pt-6 md:pt-10 pb-8 md:pb-16">
        <div className="section-container">
          <ServicePageIntro
            eyebrow="Event Displays"
            title="Shop event displays, then lock the date."
            description="Order tents, table covers, flags, banners, and booth kits online. Use the quote form when the event date, bundle, or hardware availability needs a real check."
          />
          <div id="shop" className="scroll-mt-24 mb-12">
            <ProductOrder
              categoryNames={['Event Displays', 'Backdrops & Displays', 'Table Covers']}
              onCategoryChange={handleCategoryChange}
              heading="Shop Event Displays"
            />
          </div>
          <ServiceActionBand
            eyebrow="Event deadline?"
            title="If there is a date attached, get the quote path involved early."
            subtitle="Use the quote path when the event date, bundle, venue, hardware, or delivery timing matters. We will check the schedule before production starts."
            items={['Proof approval happens before production', 'Hardware availability can affect timing', 'Full booth kits should be quoted together']}
            primary={{ label: 'Check Event Date & Quote', href: '#quote' }}
            secondary={{ label: 'See Event Work', href: '#portfolio' }}
          />
        </div>
      </section>
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Events We've Shown Up For"
            subtitle="Trade shows, weddings, pop-ups — full booth and floor setups."
            projects={[
              { src: eventBooth, alt: 'Sticker Smith event booth setup', caption: 'Event booth setup' },
              { src: featherFlags, alt: 'Feather flags setup', caption: 'Feather flags' },
              { src: weddingSignage, alt: 'Wedding display signage', caption: 'Wedding signage' },
              { src: weddingFloor1, alt: 'Wedding vinyl floor', caption: 'Custom vinyl floor' },
              { src: weddingFloor2, alt: 'Wedding vinyl floor second', caption: 'Wedding floor graphic' },
              { src: culturalFloor, alt: 'Cultural event dance floor', caption: 'Cultural event' },
            ]}
          />
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Event Displays"
            title="Get an Event Display Estimate"
            subtitle="Trade show, pop-up, conference — give us the event date and scope, we'll make sure it arrives on time."
            fields={[
              {
                name: 'displayType',
                label: 'What do you need?',
                type: 'select',
                required: true,
                options: ['Canopy Tent', 'Backdrop / Step & Repeat', 'Retractable Banner', 'Table Cover', 'Feather Flag', 'Full Booth Setup', 'Not sure yet'],
              },
              { name: 'eventDate', label: 'Event date', type: 'text', required: true, placeholder: 'MM/DD/YYYY' },
              { name: 'quantity', label: 'How many of each?', type: 'text', placeholder: 'e.g. 1 tent + 2 flags + 1 table cover' },
              { name: 'eventLocation', label: 'Event location', type: 'text', placeholder: 'Moscone Center, SF' },
            ]}
          />
        </div>
      </section>
      <ServiceDetailsBand
        eyebrow="Display Details"
        title="The event display options in one place."
        intro="The Sticker Smith prints event displays in Hayward for Bay Area markets, trade shows, pop-ups, schools, conferences, and branded booths."
        features={features}
        specs={specs}
        process={process}
      />
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Event Display"
            title="Preview your event setup"
            subtitle="Upload your brand and see it on a canopy, flag, or backdrop."
            activeKey={activeMockup}
            onActiveKeyChange={setActiveMockup}
            scenes={[
              {
                key: 'canopy',
                label: 'Canopy Tent',
                base: canopyBlank,
                slot: { left: 22, top: 16, width: 55, height: 20 },
              },
              {
                key: 'flag',
                label: 'Feather Flag',
                base: flagBlank,
                slot: { left: 30, top: 15, width: 40, height: 70 },
              },
              {
                key: 'backdrop',
                label: 'Backdrop',
                base: backdropBlank,
                slot: { left: 15, top: 15, width: 70, height: 70 },
              },
              {
                key: 'table',
                label: 'Table Cover',
                variant: 'table-cover',
                slot: {
                  left: 31,
                  top: 58,
                  width: 38,
                  height: 16,
                  radius: '6px',
                  clipPath: 'polygon(4% 0, 96% 0, 100% 100%, 0 100%)',
                  imageFit: 'cover',
                  artworkPadding: 0,
                },
              },
            ]}
          />
        </div>
      </section>
      <ServiceFaqSection
        eyebrow="Event Display FAQ"
        title="Custom event branding questions"
        faqs={eventFaqs}
      />
    </>
  )
}
