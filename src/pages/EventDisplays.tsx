import { motion } from 'framer-motion'
import { Tent, CheckCircle, Clock, Shield, Package, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'

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

export default function EventCanopies() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <Tent className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Event Displays</h1>
          <p className="text-white/80 text-lg">Custom tents, backdrops, table covers, flags, banners, and everything for your next event.</p>
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

          <ProductOrder categoryNames={['Event Displays', 'Backdrops & Displays', 'Table Covers']} />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
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
