import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ProductCategories from '@/components/home/ProductCategories'
import ServicesOverview from '@/components/home/ServicesOverview'
import Reviews from '@/components/home/Reviews'
import FAQ from '@/components/home/FAQ'
import QuickContact from '@/components/home/QuickContact'
import HowItWorks from '@/components/home/HowItWorks'
import ProjectGallery from '@/components/home/ProjectGallery'

export default function Home() {
  return (
    <div className="relative">
      {/* Grid backdrop — runs the full height of the homepage */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.02,
        }}
      />
      <div className="relative">
        <Hero />
        <ProductCategories />
        <HowItWorks />
        <TrustedBy />
        <ProjectGallery />
        <ServicesOverview />
        <Reviews />
        <FAQ compact />
        <QuickContact />
      </div>
    </div>
  )
}
