import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Tent, CheckCircle, Clock, Shield, Package, Zap } from 'lucide-react'
import PageHero from '@/components/PageHero'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import eventHero from '@/assets/services/event-displays.jpg'
import featherFlags from '@/assets/projects/feather-flags.jpg'
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
  { step: '1', title: 'Choose Your Setup', desc: 'Pick your canopy size, table cover dimensions, or banner specs. Bundle them into an event kit for savings.' },
  { step: '2', title: 'Upload Artwork', desc: 'Send us your logo, graphics, and brand colors. We\'ll create a full mockup of your event setup.' },
  { step: '3', title: 'Approve & Produce', desc: 'Review your digital proof. Once approved, we print using dye-sublimation for vibrant, fade-resistant graphics.' },
  { step: '4', title: 'Set Up & Shine', desc: 'Everything ships with frames, hardware, and carry bags. Easy setup — one person, under 5 minutes.' },
]

const eventLocalAnswers = [
  {
    title: 'Custom canopies in Hayward CA',
    copy: 'Order branded canopy tents for Hayward markets, pop-ups, festivals, school events, launch booths, and local business activations.',
  },
  {
    title: 'Complete booth branding',
    copy: 'Match the canopy with table covers, feather flags, retractable banners, backdrops, and vinyl signage for a finished setup.',
  },
  {
    title: 'Built around your event date',
    copy: 'Send the event date, booth size, artwork, and location so we can confirm proofing, production, and pickup or delivery timing.',
  },
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
      <PageHero
        eyebrow="Event Displays"
        title="Custom canopy tents, banners, and event displays in the Bay Area."
        subtitle="Custom printed canopy tents, table covers, feather flags, backdrops, and banners for Hayward and Bay Area pop-ups, trade shows, markets, and launches."
        image={eventHero}
        imageAlt="Custom event canopy and feather flags"
        icon={Tent}
        primaryCta={{ label: 'Order Now', href: '#shop' }}
        secondaryCta={{ label: 'Custom Quote', href: '#quote' }}
      />
      <section className="py-8 md:py-16">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mb-8">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Bay Area event branding</p>
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-3">Printed canopies, banners, and booth materials for markets, trade shows, and pop-ups.</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Sticker Smith prints event displays in Hayward for Bay Area businesses that need custom canopy tents, vinyl banners, table throws, flags, and backdrops that look polished in person and in photos.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {['Custom canopy tents', 'Printed table covers', 'Feather flags', 'Retractable banners', 'Step-and-repeat backdrops', 'Full booth kits'].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-card p-3 font-semibold">{item}</div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="max-w-5xl mx-auto mb-8">
            <div className="mb-5">
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Hayward Custom Canopies</p>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Custom canopy tents, banners, and booth graphics for Bay Area events.</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you need custom canopies in Hayward CA, we can quote the tent, table cover, flags, banners, and backdrop together so the booth looks consistent on event day.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {eventLocalAnswers.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.copy}</p>
                </div>
              ))}
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

          <div id="shop" className="scroll-mt-24">
            <ProductOrder
              categoryNames={['Event Displays', 'Backdrops & Displays', 'Table Covers']}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Event Display"
            title="Preview your event setup"
            subtitle="Upload your brand — see it on a canopy, flag, or backdrop before the event."
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
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Events We've Shown Up For"
            subtitle="Trade shows, weddings, pop-ups — full booth and floor setups."
            projects={[
              { src: featherFlags, alt: 'Feather flags setup', caption: 'Feather flags' },
              { src: weddingSignage, alt: 'Wedding display signage', caption: 'Wedding signage' },
              { src: weddingFloor1, alt: 'Wedding vinyl floor', caption: 'Custom vinyl floor' },
              { src: weddingFloor2, alt: 'Wedding vinyl floor second', caption: 'Wedding floor graphic' },
              { src: culturalFloor, alt: 'Cultural event dance floor', caption: 'Cultural event' },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Event Display FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black">Custom event branding questions</h2>
          </div>
          <div className="grid gap-4">
            {eventFaqs.map((faq) => (
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
    </>
  )
}
