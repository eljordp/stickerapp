import { motion } from 'framer-motion'
import safewayLogo from '@/assets/brands/safeway.png'
import albertsonsLogo from '@/assets/brands/albertsons.png'
import whciLogo from '@/assets/brands/whci.png'
import mayarsMeatLogo from '@/assets/brands/mayars-meat.png'
import trafficGuysLogo from '@/assets/brands/traffic-guys.png'
import consolidatedLogo from '@/assets/brands/consolidated.png'
import hukLogo from '@/assets/brands/huk.png'
import norcalLogo from '@/assets/brands/norcal.png'
import elevated925Logo from '@/assets/brands/elevated925.png'
import teeNDeesLogo from '@/assets/brands/tee-n-dees.png'

const brandLogos: { name: string; logo: string; id: number; className?: string }[] = [
  { name: 'Safeway', logo: safewayLogo, id: 1, className: 'max-h-[140px] md:max-h-[150px] max-w-[300px]' },
  { name: 'Albertsons', logo: albertsonsLogo, id: 2 },
  { name: 'WHCI', logo: whciLogo, id: 3 },
  { name: "Mayar's Meat", logo: mayarsMeatLogo, id: 4, className: 'max-h-[140px] md:max-h-[150px] max-w-[300px]' },
  { name: 'The Traffic Guys', logo: trafficGuysLogo, id: 5, className: 'max-h-[140px] md:max-h-[150px] max-w-[300px]' },
  { name: 'Consolidated', logo: consolidatedLogo, id: 6, className: 'max-h-[140px] md:max-h-[150px] max-w-[300px]' },
  { name: 'HUK', logo: hukLogo, id: 7 },
  { name: 'NorCal', logo: norcalLogo, id: 8 },
  { name: 'Elevated 925', logo: elevated925Logo, id: 9 },
  { name: "Tee N Dee's", logo: teeNDeesLogo, id: 10 },
]

export default function TrustedBy() {
  const duplicated = [...brandLogos, ...brandLogos]
  return (
    <section className="w-full max-w-[100vw] py-10 md:py-14 overflow-x-clip border-y border-border/50 bg-card/30">
      <div className="section-container mb-6">
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center text-muted-foreground text-sm uppercase tracking-widest font-semibold">
          Trusted by brands, creators, and businesses
        </motion.p>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="flex w-max gap-4 md:gap-12 animate-brand-scroll">
          {duplicated.map((brand, i) => (
            <div key={`${brand.id}-${i}`} className="flex items-center justify-center h-[72px] w-[150px] md:h-[120px] md:w-[280px] px-4 md:px-6 opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default">
              <img src={brand.logo} alt={`${brand.name} logo`} className="max-h-[58px] md:max-h-[105px] max-w-[135px] md:max-w-[240px] object-contain" />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes brandScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-brand-scroll { animation: brandScroll 40s linear infinite; }
      `}</style>
    </section>
  )
}
