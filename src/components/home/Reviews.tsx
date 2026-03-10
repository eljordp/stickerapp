import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, ExternalLink, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Marcus T.',
    rating: 5,
    text: 'The Sticker Smith killed it on our fleet wrap. Clean lines, fast turnaround, and the team was super easy to work with. Already planning the next round.',
    source: 'Google',
    date: 'Jan 2026',
  },
  {
    name: 'Sarah L.',
    rating: 5,
    text: 'Ordered custom die-cut stickers for my small business — the quality blew me away. Colors are vibrant and they\'re weatherproof. Will be back for more.',
    source: 'Google',
    date: 'Feb 2026',
  },
  {
    name: 'David R.',
    rating: 5,
    text: 'Got a full canopy setup for a trade show. Looked incredibly professional. Multiple people asked where I got it done. 10/10 recommend.',
    source: 'Google',
    date: 'Dec 2025',
  },
  {
    name: 'Ashley K.',
    rating: 5,
    text: 'Fast, affordable, and the stickers are premium quality. I\'ve ordered from a lot of places and The Sticker Smith is hands down the best.',
    source: 'Google',
    date: 'Mar 2026',
  },
  {
    name: 'James P.',
    rating: 5,
    text: 'Had window tint and privacy film installed at our office. Looks clean and professional. Great communication throughout the process.',
    source: 'Google',
    date: 'Nov 2025',
  },
  {
    name: 'Michelle W.',
    rating: 5,
    text: 'The storefront signage they did for us looks amazing. Gets compliments from customers every day. Worth every penny.',
    source: 'Google',
    date: 'Jan 2026',
  },
]

export default function Reviews() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Show 1 on mobile, 3 on desktop
  const perPage = typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1
  const maxIndex = Math.max(0, reviews.length - perPage)

  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      setCurrent(prev => prev >= maxIndex ? 0 : prev + 1)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoplay, maxIndex])

  const prev = () => { setCurrent(c => Math.max(0, c - 1)); setAutoplay(false) }
  const next = () => { setCurrent(c => Math.min(maxIndex, c + 1)); setAutoplay(false) }

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section className="py-16 md:py-24 bg-card/30">
      <div className="section-container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Stars + Rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-3">
            {avgRating} Stars on Google
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
            Real reviews from real customers. See why businesses and creators trust The Sticker Smith.
          </p>
          <a
            href="https://share.google/N0wDi6Y8eFK5EaR5v"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-bold hover:brightness-110 transition-all"
          >
            See all reviews on Google <ExternalLink size={16} />
          </a>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: `-${current * (100 / perPage + (perPage > 1 ? 1.5 : 0))}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {reviews.map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6 flex-shrink-0"
                  style={{ width: perPage > 1 ? 'calc(33.333% - 11px)' : '100%' }}
                >
                  <Quote size={24} className="text-primary/30 mb-3" />
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">{review.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      {review.source}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Nav arrows */}
          {maxIndex > 0 && (
            <>
              <button
                onClick={prev}
                disabled={current === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg"
                aria-label="Previous review"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                disabled={current >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg"
                aria-label="Next review"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setAutoplay(false) }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-border hover:bg-muted-foreground'}`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="https://share.google/N0wDi6Y8eFK5EaR5v"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            Read More Reviews <ExternalLink size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
