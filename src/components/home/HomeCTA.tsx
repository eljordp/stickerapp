import { ArrowRight, MessageSquare, Sticker } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomeCTA() {
  return (
    <section className="py-14 md:py-20 border-t border-border/50 bg-card/30">
      <div className="section-container">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-background/80 px-6 py-10 text-center md:px-10">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Ready to start?</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Need stickers or a quote? Start here.</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            Order stickers directly, or send the job details for signage, packaging, wraps, print, and custom work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/stickers" className="btn-primary px-8 py-3.5">
              <Sticker size={18} />
              Make Stickers
              <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-secondary px-8 py-3.5">
              <MessageSquare size={18} />
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
