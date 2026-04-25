import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ProductCategories from '@/components/home/ProductCategories'
import ServicesOverview from '@/components/home/ServicesOverview'
import Reviews from '@/components/home/Reviews'
import FAQ from '@/components/home/FAQ'
import SavingsAndRewards from '@/components/home/SavingsAndRewards'
import QuickContact from '@/components/home/QuickContact'

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
        <TrustedBy />
        <ServicesOverview />
        <Reviews />
        <SavingsAndRewards />
        <FAQ compact />
        <QuickContact />
      </div>
    </div>
  )
}
