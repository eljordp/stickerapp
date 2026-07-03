import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import bhogal from '@/assets/projects/bhogal-construction.jpeg'
import curatedBarbershop from '@/assets/projects/curated-barbershop.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import tecEquipment from '@/assets/projects/tec-equipment-truck.jpeg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import featherFlags from '@/assets/projects/feather-flags.jpg'
import plu2oDispensary from '@/assets/projects/plu2o-dispensary.jpg'
import weddingFloor1 from '@/assets/projects/wedding-vinyl-floor-1.jpeg'
import weddingFloor2 from '@/assets/projects/wedding-vinyl-floor-2.jpeg'
import weddingFloor3 from '@/assets/projects/wedding-vinyl-floor-3.jpeg'
import culturalDanceFloor1 from '@/assets/projects/cultural-dance-floor-1.jpeg'
import culturalDanceFloor2 from '@/assets/projects/cultural-dance-floor-2.jpeg'
import weddingDisplay from '@/assets/projects/wedding-display-signage-1.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
// Stickers
import stkDieCut from '@/assets/projects/stickers-die-cut-stack.jpg'
import stkHolo from '@/assets/projects/stickers-holographic.jpg'
import stkLaptop from '@/assets/projects/stickers-on-laptop.jpg'
import stkSheet from '@/assets/projects/stickers-sheet.jpg'
import stkRoll from '@/assets/projects/stickers-roll.jpg'
// Mylar + packaging
import mylarCandyshockGreen from '@/assets/projects/mylar-candyshock-green.jpg'
import mylarCandyshockBlue from '@/assets/projects/mylar-candyshock-blue.jpg'
import mylarAtomicshock from '@/assets/projects/mylar-atomicshock.jpg'
import mylarTripleA from '@/assets/projects/mylar-tripleA-design.jpg'
import stkFloodline from '@/assets/projects/sticker-floodline-design.jpg'
// Instagram-sourced real client work
import igLakeLife from '@/assets/projects/ig-lake-life-storage-sign.jpg'
import igBrothersCarwash from '@/assets/projects/ig-brothers-carwash-fleet.jpg'
import igTesla from '@/assets/projects/ig-tesla-custom-wrap.jpg'
import igFremontGear from '@/assets/projects/ig-fremontgear-stickers.jpg'
import igBrothersBroadleaf from '@/assets/projects/ig-brothersbroadleaf-halloween.jpg'
import igElevated925Backwoods from '@/assets/projects/ig-elevated925-backwoods.jpg'
import igElevated925Snack from '@/assets/projects/ig-elevated925-mystery-snack-pack.jpg'
import igFundraisers from '@/assets/projects/ig-fundraisers-castle-f.jpg'
import igElevated925Smoke from '@/assets/projects/ig-elevated925-smoke-with-pleasure.jpg'
import igTasteDeezStiiizy from '@/assets/projects/ig-tastedeeztreatz-stiiizy.jpg'
import igTasteDeezTresLeches from '@/assets/projects/ig-tastedeeztreatz-tresleches.jpg'
import igDuckTape from '@/assets/projects/ig-ducktape-ducksace.jpg'
import igBotanas from '@/assets/projects/ig-botanas-sinaloa.jpg'
import igCaliBull from '@/assets/projects/ig-calibullconnect-bulldog.jpg'
import igFuego from '@/assets/projects/ig-fuegofamilyfarms-circle.jpg'
// Business Print real client work
import bpCleopatraCards from '@/assets/projects/bp-cleopatra-discount-cards.jpg'
import bpCleopatraFlyer from '@/assets/projects/bp-cleopatra-tattoo-flyer.jpg'
import bpCleopatraPoster from '@/assets/projects/bp-cleopatra-poster.jpg'
import bpEmpireAuto from '@/assets/projects/bp-empire-automotive-flyer.jpg'
import homeBrothersCarwash from '@/assets/optimized/projects/ig-brothers-carwash-fleet-800.webp'
import homeAtlasPizza from '@/assets/optimized/projects/atlas-pizza-signage-800.webp'
import homeTasteDeezStiiizy from '@/assets/optimized/projects/ig-tastedeeztreatz-stiiizy-800.webp'
import homeMylarAtomicshock from '@/assets/optimized/projects/mylar-atomicshock-800.webp'
import homeElevatedSnack from '@/assets/optimized/projects/ig-elevated925-mystery-snack-pack-800.webp'
import homeCleopatraCards from '@/assets/optimized/projects/bp-cleopatra-discount-cards-800.webp'

export type ProjectCategory =
  | 'Vehicle Graphics'
  | 'Business Signage'
  | 'Stickers'
  | 'Business Print'
  | 'Mylar Packaging'
  | 'Events'
  | 'Graphic Design'

export type Project = {
  slug: string
  image: string
  title: string
  client?: string
  category: ProjectCategory
  description: string
  scope?: string
  materials?: string
  year?: string
  caseStudySlug?: string
  hideOnMobile?: boolean
}

export const projects: Project[] = [
  // ── Vehicle Graphics ──────────────────────────────────────────
  {
    slug: 'albertsons-fleet-graphics',
    image: albertsonsVan,
    title: 'Albertsons Fleet Graphics',
    client: 'Albertsons',
    category: 'Vehicle Graphics',
    description:
      'Brand-consistent delivery van graphics rolled across the East Bay fleet. Color-matched to Albertsons spec, installed without pulling vehicles from service.',
    scope: 'Fleet rollout',
    materials: '3M cast vinyl + UV laminate',
  },
  {
    slug: 'safeway-fleet-graphics',
    image: safewayTruck,
    title: 'Safeway Truck Wrap',
    client: 'Safeway',
    category: 'Vehicle Graphics',
    description:
      'Multi-vehicle delivery truck graphics with strict Pantone match. Rolling install schedule kept the fleet on the road through the whole deployment.',
    scope: '20+ vehicles',
    materials: '3M IJ180Cv3 + overlaminate',
    caseStudySlug: 'safeway-fleet-graphics',
  },
  {
    slug: 'bhogal-construction-truck-wrap',
    image: bhogal,
    title: 'Bhogal Construction',
    client: 'Bhogal Construction',
    category: 'Vehicle Graphics',
    description:
      'Full box-truck wrap built to read as a rolling billboard at 50 feet. Bold red/black layout, phone and services dominant — designed to earn calls from every jobsite.',
    scope: 'Full wrap, box truck',
    materials: 'Premium 3M cast vinyl',
    year: '2024',
    caseStudySlug: 'bhogal-construction-truck-wrap',
  },
  {
    slug: 'procare-fleet-branding',
    image: procareFleet,
    title: 'ProCare Fleet Branding',
    client: 'ProCare',
    category: 'Vehicle Graphics',
    description:
      'Service-fleet vinyl branding deployed across multiple vehicles. Consistent identity at every customer driveway.',
    scope: 'Multi-vehicle',
    materials: 'Cast vinyl + laminate',
  },
  {
    slug: 'tec-equipment',
    image: tecEquipment,
    title: 'TEC Equipment',
    client: 'TEC Equipment',
    category: 'Vehicle Graphics',
    description:
      'Heavy-duty truck graphics built to survive commercial wash cycles and fleet wear. Production-grade install.',
    scope: 'Commercial truck',
    materials: 'Premium vinyl + laminate',
  },
  {
    slug: 'brothers-carwash-fleet',
    image: igBrothersCarwash,
    title: 'Brothers Carwash Fleet Wrap',
    client: 'Brothers Carwash',
    category: 'Vehicle Graphics',
    description:
      'Design, print, and install of a clean fleet wrap for Brothers Carwash. Every truck on the road becomes a 24/7 mobile billboard.',
    scope: 'Fleet wrap — design + print + install',
    materials: 'ORACAL 751 vinyl',
  },
  {
    slug: 'tesla-custom-wrap',
    image: igTesla,
    title: 'Custom Tesla Wrap',
    category: 'Vehicle Graphics',
    description:
      'Full color-shift wrap on a Tesla Model S — any color, any finish. Show your true colors.',
    scope: 'Full vehicle wrap',
    materials: 'Color-shift cast vinyl',
  },

  // ── Business Signage ──────────────────────────────────────────
  {
    slug: 'atlas-pizza-storefront',
    image: atlasPizza,
    title: 'Atlas Pizza Signage',
    client: 'Atlas Pizza',
    category: 'Business Signage',
    description:
      'Storefront + window + interior signage for a Bay Area pizza opening. Designed for sidewalk readability and a complete, intentional storefront on day one.',
    scope: '~30 sq ft storefront',
    materials: 'Premium substrate, UV-stable',
    caseStudySlug: 'atlas-pizza-storefront',
  },
  {
    slug: 'curated-barbershop',
    image: curatedBarbershop,
    title: 'Curated Barbershop',
    client: 'Curated',
    category: 'Business Signage',
    description:
      'Storefront identity for an independent Bay Area barbershop. Clean type, high-contrast install, designed to read from across the street.',
    scope: 'Storefront signage',
    materials: 'Cut vinyl on glass',
  },
  {
    slug: 'elevated-925-storefront',
    image: elevated,
    title: 'Elevated 925 Storefront',
    client: 'Elevated 925',
    category: 'Business Signage',
    description:
      'Full storefront branding install — sign, window vinyl, and exterior identity coordinated as one package.',
    scope: 'Storefront package',
    materials: 'Vinyl + rigid substrate',
  },
  {
    slug: 'plu2o-dispensary',
    image: plu2oDispensary,
    title: 'Plu2o Dispensary Signage',
    client: 'Plu2o',
    category: 'Business Signage',
    description:
      'Interior + exterior signage for a licensed dispensary. Compliance-aware sizing, brand-aligned finishes.',
    scope: 'Multi-surface signage',
    materials: 'Rigid + vinyl',
  },
  {
    slug: 'safeway-in-store',
    image: safewayInstall,
    title: 'Safeway In-Store Install',
    client: 'Safeway',
    category: 'Business Signage',
    description:
      'In-store signage rollout — built in-shop, installed on location with zero downtime to store operations.',
    scope: 'In-store rollout',
    materials: 'Mounted graphics',
    hideOnMobile: true,
  },
  {
    slug: 'lake-life-storage-sign',
    image: igLakeLife,
    title: 'Lake Life Storage Sign',
    client: 'Lake Life Storage',
    category: 'Business Signage',
    description:
      'Roadside post-mounted signage for a local outdoor boat & RV storage business. Built to read clean from drive-by traffic and survive the elements.',
    scope: 'Post-mounted roadside sign',
    materials: 'Outdoor-grade rigid substrate',
  },

  // ── Events ────────────────────────────────────────────────────
  {
    slug: 'wedding-vinyl-floor-1',
    image: weddingFloor1,
    title: 'Wedding Floor Vinyl',
    category: 'Events',
    description:
      'Custom dance-floor vinyl printed and installed for a Bay Area wedding. Designed to monogram, removed clean post-event.',
    scope: 'Event vinyl',
    materials: 'Removable dance-floor vinyl',
  },
  {
    slug: 'wedding-vinyl-floor-2',
    image: weddingFloor2,
    title: 'Wedding Floor Graphics',
    category: 'Events',
    description:
      'Bride/groom monogram floor decal, full-color print, installed day-of and lifted clean before venue close.',
    scope: 'Event vinyl',
    materials: 'Removable dance-floor vinyl',
  },
  {
    slug: 'wedding-vinyl-floor-3',
    image: weddingFloor3,
    title: 'Custom Floor Decal',
    category: 'Events',
    description:
      'Centerpiece vinyl floor graphic for a private event. Scaled to room, walk-tested for grip and seam tolerance.',
    scope: 'Event vinyl',
    materials: 'Removable floor vinyl',
  },
  {
    slug: 'cultural-dance-floor-1',
    image: culturalDanceFloor1,
    title: 'Cultural Dance Floor Vinyl',
    category: 'Events',
    description:
      'Large-scale custom floor vinyl for a cultural celebration. Pattern-matched seams, no visible joins on the dance area.',
    scope: 'Event vinyl',
    materials: 'Removable floor vinyl',
  },
  {
    slug: 'cultural-dance-floor-2',
    image: culturalDanceFloor2,
    title: 'Cultural Event Floor Vinyl',
    category: 'Events',
    description:
      'Full-coverage cultural event flooring with intricate pattern work. Installed and removed within the event window.',
    scope: 'Event vinyl',
    materials: 'Removable floor vinyl',
  },
  {
    slug: 'wedding-display-signage',
    image: weddingDisplay,
    title: 'Wedding Display Signage',
    category: 'Events',
    description:
      'Event-day signage package — welcome boards, seating chart, table numbers — printed and finished to display quality.',
    scope: 'Event signage suite',
    materials: 'Rigid display board',
  },
  {
    slug: 'event-booth',
    image: eventBooth,
    title: 'Event Booth Setup',
    client: 'The Sticker Smith',
    category: 'Events',
    description:
      'In-house booth design and build for live events. Backdrop, signage, and giveaway sticker setup ready in a single haul.',
    scope: 'Tradeshow booth',
    materials: 'Tension fabric + rigid graphics',
  },
  {
    slug: 'feather-flags',
    image: featherFlags,
    title: 'Custom Feather Flags',
    category: 'Events',
    description:
      'Outdoor feather flags printed dye-sub on knit polyester. Pole-and-base included, packs down small for transport.',
    scope: 'Outdoor signage',
    materials: 'Knit polyester, dye-sub print',
  },

  // ── Stickers ──────────────────────────────────────────────────
  {
    slug: 'stickers-die-cut',
    image: stkDieCut,
    title: 'Die-Cut Vinyl Stickers',
    category: 'Stickers',
    description:
      'Contour-cut vinyl stickers with white ink underbase. Outdoor-grade — 3 to 5 year UV-stable adhesive.',
    scope: 'Die-cut singles',
    materials: 'Premium vinyl + laminate',
  },
  {
    slug: 'stickers-holographic',
    image: stkHolo,
    title: 'Holographic Stickers',
    category: 'Stickers',
    description:
      'Holographic vinyl with rainbow refraction. Durable laminate keeps the shift effect even after wear.',
    scope: 'Specialty finish',
    materials: 'Holographic vinyl',
  },
  {
    slug: 'stickers-laptop',
    image: stkLaptop,
    title: 'Sticker Collection',
    category: 'Stickers',
    description:
      'Mixed-design die-cut packs — the kind that end up on every laptop, water bottle, and toolbox in the city.',
    scope: 'Variety pack',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'stickers-sheet',
    image: stkSheet,
    title: 'Kiss-Cut Sticker Sheets',
    category: 'Stickers',
    description:
      'Kiss-cut sheets — multiple designs on one peel-back backer. Great for merch packs and giveaway drops.',
    scope: 'Multi-design sheets',
    materials: 'Vinyl on kraft backer',
  },
  {
    slug: 'stickers-roll',
    image: stkRoll,
    title: 'Stickers on Roll',
    category: 'Stickers',
    description:
      'Roll-format stickers built for production lines — labels for product packaging, hand-applied or machine-fed.',
    scope: 'Production roll',
    materials: 'BOPP or vinyl on liner',
  },
  {
    slug: 'floodline-sticker',
    image: stkFloodline,
    title: 'Flood Line — Sticker Design',
    client: 'Flood Line',
    category: 'Stickers',
    description:
      'Custom illustrated sticker for Flood Line — neighborhood flood scene with brand wordmark, integrated QR. End-to-end graphic design before print.',
    scope: 'Illustration + die-cut sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'fremontgear-stickers',
    image: igFremontGear,
    title: 'Fremont Gear',
    client: 'Fremont Gear',
    category: 'Stickers',
    description:
      'Rectangular die-cut stickers for Fremont Gear — bold mountain mark over a deep blue/orange palette. 24-hour turnaround.',
    scope: 'Die-cut stickers',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'brothersbroadleaf-halloween',
    image: igBrothersBroadleaf,
    title: 'Brothers Broadleaf — Halloween Drop',
    client: 'Brothers Broadleaf',
    category: 'Stickers',
    description:
      'Custom Halloween-themed die-cut stickers for Brothers Broadleaf — Jack-o-lantern character with smoke trails. Printed and shipped in 24 hours.',
    scope: 'Seasonal die-cut sticker drop',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'elevated925-backwoods',
    image: igElevated925Backwoods,
    title: 'Elevated 925 — Backwoods Whiskey',
    client: 'Elevated 925',
    category: 'Stickers',
    description:
      'Cartoon-illustrated die-cut sticker for Elevated 925\'s Backwoods Whiskey Cigars line. Strong character work, full-bleed color.',
    scope: 'Die-cut illustration sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'elevated925-smoke-with-pleasure',
    image: igElevated925Smoke,
    title: 'Elevated 925 — Smoke With Pleasure',
    client: 'Elevated 925',
    category: 'Stickers',
    description:
      'Photo-based die-cut sticker design — vintage celebrity portrait framed in a green-bordered "Smoke With Pleasure" lockup. Full-color print on vinyl.',
    scope: 'Die-cut photo sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'fundraisers-castle-f',
    image: igFundraisers,
    title: 'The Fundraisers — Castle F',
    client: 'The Fundraisers',
    category: 'Stickers',
    description:
      'Die-cut "Castle F" mark for The Fundraisers. Crisp black-and-white contour cut, clean white border.',
    scope: 'Die-cut sticker run',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'tastedeeztreatz-stiiizy',
    image: igTasteDeezStiiizy,
    title: 'Taste Deez Treatz × STIIIZY',
    client: 'Taste Deez Treatz × STIIIZY',
    category: 'Stickers',
    description:
      'Collab die-cut stickers for Taste Deez Treatz and STIIIZY. Pink/yellow color stack, layered logo design — built for retail drop visibility.',
    scope: 'Collab die-cut sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'tastedeeztreatz-tresleches',
    image: igTasteDeezTresLeches,
    title: 'Taste Deez Treatz — Tres Leches',
    client: 'Taste Deez Treatz',
    category: 'Stickers',
    description:
      'Die-cut tres leches cake stickers for Taste Deez Treatz — illustrated whipped cream and strawberry detail. Dropped with the Helado launch at Lemonnade Sacramento.',
    scope: 'Product launch sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'ducktape-ducksace',
    image: igDuckTape,
    title: 'Duck Tape — Ducksace',
    client: 'Duck Tape Graphics',
    category: 'Stickers',
    description:
      'Versace-style "Ducksace" die-cut for Duck Tape Graphics — intricate baroque pattern with duck character mark, screaming yellow accent.',
    scope: 'Detailed die-cut sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'botanas-sinaloa',
    image: igBotanas,
    title: 'Botanas Sinaloa',
    client: 'Botanas 100',
    category: 'Stickers',
    description:
      'Mexican license-plate-style die-cut stickers for Botanas 100 — Sinaloa branding, full-bleed color, repeat-print volume.',
    scope: 'Bulk die-cut sticker run',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'calibullconnect-bulldog',
    image: igCaliBull,
    title: 'The Cali Bull Connect',
    client: 'The Cali Bull Connect',
    category: 'Stickers',
    description:
      'Die-cut sticker for The Cali Bull Connect — illustrated bulldog + lowrider scene with palm trees. Color-rich, full-bleed.',
    scope: 'Die-cut illustration sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'fuegofamilyfarms-circle',
    image: igFuego,
    title: 'Fuego Family Farms',
    client: 'Fuego Family Farms',
    category: 'Stickers',
    description:
      '3-inch circular stickers for Fuego Family Farms — soil-grown Santa Cruz cannabis branding. 500 stickers for $100 spec pack.',
    scope: '500x 3in circle stickers',
    materials: 'Vinyl + laminate',
  },

  // ── Mylar Packaging ───────────────────────────────────────────
  {
    slug: 'shockco-candyshock-green',
    image: mylarCandyshockGreen,
    title: 'Candy Shock — Green',
    client: 'Shock Co.',
    category: 'Mylar Packaging',
    description:
      'Custom 3.5g mylar pouch design for Shock Co. Candy-themed illustration, bold display type, lightning brand mark, full compliance icons baked into the layout.',
    scope: 'Brand + packaging design',
    materials: 'CR mylar pouch, full-color print',
  },
  {
    slug: 'shockco-candyshock-blue',
    image: mylarCandyshockBlue,
    title: 'Candy Shock — Blue',
    client: 'Shock Co.',
    category: 'Mylar Packaging',
    description:
      'Companion colorway in the Shock Co. Candy Shock series — same brand system, cool palette. Designed as part of a shelf-set so the variants read as a family.',
    scope: 'Brand + packaging design',
    materials: 'CR mylar pouch, full-color print',
  },
  {
    slug: 'shockco-atomicshock',
    image: mylarAtomicshock,
    title: 'Atomic Shock',
    client: 'Shock Co.',
    category: 'Mylar Packaging',
    description:
      'Atomic Shock 3.5g pouch — illustrated mushroom-cloud over city, graffiti-style display type. End-to-end design + print, compliance-ready for licensed retail.',
    scope: 'Brand + packaging design',
    materials: 'CR mylar pouch, full-color print',
  },
  {
    slug: 'triple-a-cannabis',
    image: mylarTripleA,
    title: 'Triple A — Cannabis Flower',
    client: 'Triple A',
    category: 'Mylar Packaging',
    description:
      'High-end black marble + gold foil treatment for a 3.5g cannabis flower pouch. Custom monogram crown mark, full back-panel compliance, retail-shelf ready.',
    scope: 'Front + back panel design',
    materials: 'Premium mylar, metallic finish',
  },
  {
    slug: 'elevated925-mystery-snack-pack',
    image: igElevated925Snack,
    title: 'Elevated 925 — Mystery Exotic Snack Pack',
    client: 'Elevated 925',
    category: 'Mylar Packaging',
    description:
      'Custom 14x16in (pound-size) mylar pouches for Elevated 925 — collage of exotic snack-pack artwork, "Flavors From All Over The World" tagline. Made for large-format packaging needs.',
    scope: '14x16in pound bag — custom print',
    materials: 'Custom-print mylar pouch',
  },

  // ── Business Print ────────────────────────────────────────────
  {
    slug: 'cleopatra-ink-discount-cards',
    image: bpCleopatraCards,
    title: 'Cleopatra Ink — Card Suite',
    client: 'Cleopatra Ink Tattoo & Piercing',
    category: 'Business Print',
    description:
      'Full card suite for Cleopatra Ink Berkeley — premium business card with brand mark + 10/20/30% discount cards. Black/white/orange print on heavy stock.',
    scope: 'Business cards + discount cards',
    materials: 'Heavy matte stock',
  },
  {
    slug: 'cleopatra-ink-tattoo-flyer',
    image: bpCleopatraFlyer,
    title: 'Cleopatra Ink — Tattoo Flyer',
    client: 'Cleopatra Ink Tattoo & Piercing',
    category: 'Business Print',
    description:
      '"We Make Extraordinary Tattoos For Extraordinary People" — full-color portrait flyer with real artist work shown. Brand-consistent with the rest of the Cleopatra suite.',
    scope: 'Marketing flyer',
    materials: 'Premium gloss',
  },
  {
    slug: 'empire-automotive-flyer',
    image: bpEmpireAuto,
    title: 'Empire Automotive — Flyer + Coupon Pack',
    client: 'Empire Automotive Services',
    category: 'Business Print',
    description:
      'Service flyer + 4-up coupon sheet for Empire Automotive (Hayward, CA). Oil change, brake inspection, smog check, and 15% service offers — all printed as a coordinated pack.',
    scope: 'Flyer + coupon sheet',
    materials: 'Full-color print',
  },
  {
    slug: 'cleopatra-ink-wall-poster',
    image: bpCleopatraPoster,
    title: 'Cleopatra Ink — Wall Poster',
    client: 'Cleopatra Ink Tattoo & Piercing',
    category: 'Business Print',
    description:
      'Large-format wall poster for Cleopatra Ink Sacramento — "The Largest & Most Awarded Tattoo Company Worldwide." Awards, country flags, and shop contact info in one piece.',
    scope: 'Large-format poster',
    materials: 'Premium photo paper',
  },
]

export const projectCategories = [
  'All',
  'Vehicle Graphics',
  'Business Signage',
  'Stickers',
  'Business Print',
  'Mylar Packaging',
  'Events',
] as const

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}

// Homepage gallery — curated subset (mix of categories)
export const homepageGallerySlugs = [
  'brothers-carwash-fleet',
  'atlas-pizza-storefront',
  'tastedeeztreatz-stiiizy',
  'shockco-atomicshock',
  'elevated925-mystery-snack-pack',
  'cleopatra-ink-discount-cards',
]

const homepageGalleryImages: Partial<Record<string, string>> = {
  'brothers-carwash-fleet': homeBrothersCarwash,
  'atlas-pizza-storefront': homeAtlasPizza,
  'tastedeeztreatz-stiiizy': homeTasteDeezStiiizy,
  'shockco-atomicshock': homeMylarAtomicshock,
  'elevated925-mystery-snack-pack': homeElevatedSnack,
  'cleopatra-ink-discount-cards': homeCleopatraCards,
}

export const homepageGallery = homepageGallerySlugs
  .map((slug) => projects.find((p) => p.slug === slug))
  .map((project) => project && { ...project, image: homepageGalleryImages[project.slug] ?? project.image })
  .filter((p): p is Project => Boolean(p))
