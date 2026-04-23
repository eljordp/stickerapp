import { motion } from 'framer-motion'
import { Printer, CheckCircle, Clock, Shield, Layers, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ArtworkMockup from '@/components/ArtworkMockup'
import bizCardsLuxury from '@/assets/projects/business-cards-luxury.jpg'
import bizCardsFoil from '@/assets/projects/business-cards-foil.jpg'
import flyers from '@/assets/projects/flyers-full-color.jpg'
import postcards from '@/assets/projects/postcards-set.jpg'
import letterpress from '@/assets/projects/letterpress-detail.jpg'
import pressroom from '@/assets/projects/print-pressroom.jpg'
import cardsBlank from '@/assets/mockups/print-cards-blank.jpg'
import flyerBlank from '@/assets/mockups/print-flyer-blank.jpg'
import postcardBlank from '@/assets/mockups/print-postcard-blank.jpg'

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
  { step: '1', title: 'Choose Product', desc: 'Pick from business cards, flyers, postcards, door hangers, or vehicle magnets. Select size and quantity.' },
  { step: '2', title: 'Upload Design', desc: 'Upload your print-ready file or let us help with design. We accept AI, PDF, PNG, JPG at 300 DPI.' },
  { step: '3', title: 'Proof & Approve', desc: 'We send a free digital proof within 24 hours. Check layout, colors, and text before we print.' },
  { step: '4', title: 'Print & Ship', desc: 'Printed on premium stock with your chosen finish. Ships free to anywhere in the US.' },
]

export default function BusinessPrint() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <Printer className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Business Print</h1>
          <p className="text-white/80 text-lg">Business cards, flyers, postcards, magnets, and marketing essentials.</p>
        </motion.div>
      </div>
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

          <ProductOrder categoryNames={['Business Cards', 'Flyers & Door Hangers', 'Postcards', 'Vehicle Magnets']} />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <ArtworkMockup
            service="Business Print"
            title="Preview your design on paper"
            subtitle="Upload your artwork — see it on the exact product."
            scenes={[
              {
                key: 'cards',
                label: 'Business Card',
                base: cardsBlank,
                slot: { left: 38, top: 45, width: 30, height: 25 },
              },
              {
                key: 'flyer',
                label: 'Flyer',
                base: flyerBlank,
                slot: { left: 28, top: 18, width: 44, height: 62 },
              },
              {
                key: 'postcard',
                label: 'Postcard',
                base: postcardBlank,
                slot: { left: 22, top: 30, width: 55, height: 38 },
              },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <PortfolioStrip
            title="Print Work We're Proud Of"
            subtitle="Business cards with foil, soft-touch flyers, full-color postcards."
            projects={[
              { src: bizCardsLuxury, alt: 'Premium black business cards', caption: 'Matte black + foil' },
              { src: bizCardsFoil, alt: 'Specialty finish cards', caption: 'Specialty finishes' },
              { src: flyers, alt: 'Full color flyers', caption: 'Full-color flyers' },
              { src: postcards, alt: 'Postcards', caption: 'Postcards' },
              { src: letterpress, alt: 'Letterpress detail', caption: 'Letterpress texture' },
              { src: pressroom, alt: 'Print shop', caption: 'Fresh off the press' },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
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
    </>
  )
}
