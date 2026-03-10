import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ProductCategories from '@/components/home/ProductCategories'
import ProductShowcase from '@/components/home/ProductShowcase'
import HowItWorks from '@/components/home/HowItWorks'
import ProjectGallery from '@/components/home/ProjectGallery'
import ServicesOverview from '@/components/home/ServicesOverview'
import SamplePackCTA from '@/components/home/SamplePackCTA'
import Reviews from '@/components/home/Reviews'
import FAQ from '@/components/home/FAQ'
import QuickContact from '@/components/home/QuickContact'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ProductCategories />
      <ProductShowcase />
      <HowItWorks />
      <ProjectGallery />
      <SamplePackCTA />
      <ServicesOverview />
      <FAQ />
      <Reviews />
      <QuickContact />
    </>
  )
}
