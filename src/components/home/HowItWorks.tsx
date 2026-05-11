import { Link } from 'react-router-dom'
import { Upload, Palette, CheckCircle, Truck, ArrowRight } from 'lucide-react'

const steps = [
  { icon: Upload, title: 'Upload Artwork', description: 'Share a file or rough idea. We accept PNG, JPG, PDF, AI, SVG, and EPS.' },
  { icon: Palette, title: 'Pick Specs', description: 'Choose the shape, size, quantity, and finish that fit the job.' },
  { icon: CheckCircle, title: 'Approve Proof', description: 'Every order gets a free digital proof before production starts.' },
  { icon: Truck, title: 'Print + Ship', description: 'Most sticker orders print in 3-5 business days with shipping or Bay Area pickup.' },
]

export default function HowItWorks() {
  return (
    <section className="py-10 md:py-16 bg-card/50 border-y border-border/50">
      <div className="section-container">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-5xl font-black mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">A simple path from artwork to finished print.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-8 left-[62%] w-[76%] h-px bg-border" />}
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <step.icon size={26} className="text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">{index + 1}</div>
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/stickers" className="btn-primary text-lg px-8 py-4">Start Your Order<ArrowRight size={20} /></Link>
        </div>
      </div>
    </section>
  )
}
