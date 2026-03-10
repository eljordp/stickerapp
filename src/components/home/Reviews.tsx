import { useEffect } from 'react'

export default function Reviews() {
  useEffect(() => {
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://static.elfsight.com/platform/platform.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])
  return (
    <section className="w-full py-12 md:py-16 bg-card/30">
      <div className="section-container">
        <div className="elfsight-app-5915ab6d-ea02-4841-9033-e6c905f52098" data-elfsight-app-lazy />
        <noscript>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Check out our reviews on <a href="https://share.google/N0wDi6Y8eFK5EaR5v" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google</a></p>
          </div>
        </noscript>
      </div>
    </section>
  )
}
