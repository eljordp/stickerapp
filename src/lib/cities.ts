// East Bay city configs for local SEO landing pages.
// Each city gets a dedicated page at /<slug> so Google can rank
// us for "[service] [city]" queries. Content is unique per city —
// no doorway-page boilerplate.

export type CityConfig = {
  slug: string
  name: string
  distanceMiles: number
  region: string
  intro: string
  whyHere: string
  neighborhoods: string[]
  commonProjects: string[]
  delivery: string
  faqs: { q: string; a: string }[]
  metaTitle: string
  metaDescription: string
}

export const cities: CityConfig[] = [
  {
    slug: 'hayward',
    name: 'Hayward',
    distanceMiles: 0,
    region: 'East Bay',
    intro:
      'Our studio is in Hayward — so this is home. Walk-in pickup, same-day rush jobs, and face-to-face proof reviews are part of the deal here.',
    whyHere:
      'We work with brands and businesses across Hayward every week — from downtown B Street storefronts and Cal State East Bay student orgs to fleet operators along Industrial Parkway and licensed packaging clients off Mission Boulevard. If you can drop by, you can hold the test print before you commit.',
    neighborhoods: [
      'Downtown / B Street',
      'Mission Boulevard',
      'Cal State East Bay',
      'Industrial Parkway',
      'Tennyson',
      'Mt. Eden',
    ],
    commonProjects: [
      'Storefront signage and window graphics for B Street + downtown shops',
      'Vehicle decals and fleet branding for Industrial Parkway businesses',
      'Mylar packaging and product labels for Hayward-based brands',
      'Event signage for Cal State East Bay clubs and conferences',
    ],
    delivery:
      'Walk-in pickup at the studio. Free local delivery on orders $100+ anywhere in Hayward city limits, usually same-day or next-day.',
    faqs: [
      {
        q: 'Can I pick up my order in Hayward the same day?',
        a: 'Often yes — small sticker orders proofed and approved before 11am can usually be ready for afternoon pickup. Larger jobs (signage, wraps, packaging) need the standard 3–5 business day window.',
      },
      {
        q: 'Do you do face-to-face design reviews?',
        a: 'Yes. If you\'re a local Hayward business and want to walk through your file in person before we print, book a time and come by the studio.',
      },
      {
        q: 'Do you install signage in Hayward?',
        a: 'Yes. We install most storefront signage, window graphics, and vehicle wraps ourselves around Hayward — no third-party installer needed.',
      },
    ],
    metaTitle: 'Custom Printing Company in Hayward, CA | Stickers, Signage & Stationery | The Sticker Smith',
    metaDescription:
      'Hayward\'s local custom printing company: stickers, business cards, stationery, vehicle graphics, storefront signage, custom labels and mylar packaging. Walk-in pickup, same-day rush jobs, free local delivery $100+.',
  },
  {
    slug: 'oakland',
    name: 'Oakland',
    distanceMiles: 15,
    region: 'East Bay',
    intro:
      'Oakland is the biggest sticker market in the East Bay — artists, food trucks, brands, dispensaries, fleets, all needing real print work, fast. We deliver throughout Oakland and most orders ship the same week.',
    whyHere:
      'Oakland\'s creative density means a lot of one-off, small-batch print work — die-cut vinyl for muralists and tattoo artists, mylar bags for licensed packaging, vehicle wraps for food trucks and trade fleets. We run small minimums and proof everything before printing so an Oakland artist ordering 100 stickers gets the same care as a wholesale account.',
    neighborhoods: [
      'Downtown / Uptown',
      'Temescal',
      'Rockridge',
      'Fruitvale',
      'Jack London Square',
      'Jingletown',
      'West Oakland',
      'East Oakland',
    ],
    commonProjects: [
      'Die-cut vinyl stickers for Oakland artists, muralists, and music collectives',
      'Mylar packaging and labels for licensed Oakland brands',
      'Vehicle wraps and decals for food trucks, mobile services, and trade fleets',
      'Event signage, banners, and step-and-repeats for Oakland venues and pop-ups',
    ],
    delivery:
      'Free delivery to Oakland on orders $250+. Standard turnaround 3–5 business days; rush available. Pickup at our Hayward studio is also a 20-minute drive on a clean day.',
    faqs: [
      {
        q: 'Do you deliver to Oakland?',
        a: 'Yes. Free delivery on Oakland orders $250+. Smaller orders can ship via USPS/UPS or you can pick up at our Hayward studio.',
      },
      {
        q: 'I\'m an Oakland artist — what\'s your minimum order on die-cut stickers?',
        a: 'No hard minimum. We regularly do small runs of 50–100 die-cut stickers for individual artists and creators. Per-unit price drops a lot at 500+.',
      },
      {
        q: 'Can you do mylar packaging for an Oakland brand?',
        a: 'Yes — we print custom mylar bags and product labels for licensed and unlicensed Oakland brands. Full color, custom shapes, your spec.',
      },
    ],
    metaTitle: 'Custom Stickers & Print in Oakland, CA | The Sticker Smith',
    metaDescription:
      'Oakland\'s print partner for die-cut stickers, vehicle wraps, mylar packaging, and event signage. Free delivery on orders $250+, small minimums, real proofs before we print.',
  },
  {
    slug: 'san-leandro',
    name: 'San Leandro',
    distanceMiles: 5,
    region: 'East Bay',
    intro:
      'San Leandro is right next door. We\'ve printed signage, fleet decals, and packaging for businesses up and down E 14th, MacArthur, and Marina — and most orders get hand-delivered.',
    whyHere:
      'San Leandro has the kind of mix we love — independent storefronts on E 14th, light industrial off MacArthur, marina-area businesses, and a strong Kaiser-anchored workforce that drives a lot of small-batch print work for healthcare, dental, and service pros. Five-mile delivery means we can run a sample over before the workday is out.',
    neighborhoods: [
      'Downtown / E 14th',
      'MacArthur Boulevard',
      'Marina / Mulford Gardens',
      'Estudillo Estates',
      'Bay Fair',
      'Bayfair Mall',
    ],
    commonProjects: [
      'Storefront signage and A-frames for E 14th + downtown businesses',
      'Vehicle decals and door graphics for service fleets',
      'Healthcare and dental signage, window graphics, and business cards',
      'Custom stickers and mylar for San Leandro brands',
    ],
    delivery:
      'Free local delivery on orders $150+. Same-day rush available for sticker jobs in by 11am. Studio pickup in Hayward is a 10-minute drive.',
    faqs: [
      {
        q: 'How fast can you turn around stickers for a San Leandro business?',
        a: 'Standard 3–5 business days. Rush orders in by 11am can often be ready next-day; very small runs can sometimes go same-day.',
      },
      {
        q: 'Do you do signage installs in San Leandro?',
        a: 'Yes. We install storefront vinyl, window graphics, A-frames, and most retractable signage ourselves throughout San Leandro.',
      },
      {
        q: 'Can you wrap a fleet vehicle in San Leandro?',
        a: 'Yes — full wraps, partial wraps, door graphics, and spot decals. We typically do the install at our shop; we can schedule mobile installs for fleets too.',
      },
    ],
    metaTitle: 'Custom Stickers, Signage & Print in San Leandro | The Sticker Smith',
    metaDescription:
      'San Leandro\'s local print shop next door in Hayward. Storefront signage, vehicle decals, custom stickers, mylar packaging. Free local delivery $150+ and same-day rush options.',
  },
  {
    slug: 'castro-valley',
    name: 'Castro Valley',
    distanceMiles: 6,
    region: 'East Bay',
    intro:
      'Castro Valley is a six-mile hop over the hill. We deliver weekly to professional offices, service businesses, and storefronts along Castro Valley Boulevard.',
    whyHere:
      'Castro Valley\'s business community leans toward professional services — dental, medical, legal, real estate, plus the retail along Castro Village and the Boulevard. Most projects we run here are clean, brand-consistent print work: office signage, window film for privacy, business cards, and the occasional event banner. Quiet, repeat-client work.',
    neighborhoods: [
      'Castro Valley Boulevard',
      'Castro Village',
      'Lake Chabot Road',
      'Crow Canyon',
      'Five Canyons',
      'Palomares Hills',
    ],
    commonProjects: [
      'Dental, medical, and professional office signage',
      'Privacy and frosted window film for offices and conference rooms',
      'Business cards, postcards, and marketing print',
      'Custom stickers for Castro Valley brands and youth sports teams',
    ],
    delivery:
      'Free local delivery on orders $150+. Studio pickup in Hayward is a 10–15 minute drive.',
    faqs: [
      {
        q: 'Do you install privacy window film in Castro Valley offices?',
        a: 'Yes. Frosted film, gradient bands, security film, and decorative window graphics — measured, printed, and installed by our team.',
      },
      {
        q: 'Can you print business cards and postcards for a Castro Valley business?',
        a: 'Yes — 16pt cardstock, multiple finishes, full color both sides. Small minimums for new businesses, volume pricing at 500+.',
      },
      {
        q: 'Do you work with Castro Valley schools and sports teams?',
        a: 'Yes — custom stickers, banners, and event signage for school clubs, youth sports, and PTA fundraisers.',
      },
    ],
    metaTitle: 'Castro Valley Signage, Window Film & Print | The Sticker Smith',
    metaDescription:
      'Local print + signage studio serving Castro Valley professional offices, storefronts, and brands. Window film, dental/medical signage, business print, custom stickers. Free delivery $150+.',
  },
  {
    slug: 'union-city',
    name: 'Union City',
    distanceMiles: 5,
    region: 'East Bay',
    intro:
      'Union City businesses — from the Decoto District storefronts to the warehouse and logistics corridor — turn to us for fast, no-drama print work.',
    whyHere:
      'Union City\'s mix of logistics, light industrial, and small business along Alvarado-Niles + the Decoto District means we see a lot of fleet vehicle graphics, warehouse signage, and outdoor banners. Five miles south of our Hayward shop, so delivery is fast and turnaround is tight.',
    neighborhoods: [
      'Decoto District',
      'Alvarado-Niles Road',
      'Union Landing',
      'Logistics Way',
      'Old Alvarado',
      'Mission Boulevard corridor',
    ],
    commonProjects: [
      'Vehicle fleet decals and door graphics for service and trade businesses',
      'Warehouse and industrial signage along Logistics Way',
      'Outdoor banners, A-frames, and storefront signage for Decoto-area shops',
      'Custom stickers and event displays for Union City brands and orgs',
    ],
    delivery:
      'Free local delivery on orders $150+. Same-day rush sticker jobs in by 11am can usually deliver by end of day.',
    faqs: [
      {
        q: 'Can you brand a whole fleet of service vehicles in Union City?',
        a: 'Yes. We do door graphics, partial wraps, and full wraps for service fleets — printed in Hayward, installed at our shop or on-site for larger fleets.',
      },
      {
        q: 'Do you make large outdoor banners for Union City events?',
        a: 'Yes — full-color heavy vinyl banners, mesh banners for windy installs, and feather flags for events. Grommeted or pole-pocket, sized to spec.',
      },
      {
        q: 'How fast can warehouse signage be made and installed?',
        a: 'Standard turnaround is 3–5 business days for production. Install timing depends on scope — most interior wayfinding and dock signage can be installed within a week of order.',
      },
    ],
    metaTitle: 'Vehicle Graphics, Banners & Signage in Union City | The Sticker Smith',
    metaDescription:
      'Union City\'s neighbor in Hayward for vehicle fleet graphics, warehouse signage, outdoor banners, and custom stickers. Free local delivery $150+. Fast turnaround.',
  },
  {
    slug: 'fremont',
    name: 'Fremont',
    distanceMiles: 10,
    region: 'East Bay',
    intro:
      'Fremont is everything from Tesla suppliers to Niles Boulevard antiques to biotech labs. Whatever your business does, we\'ve probably printed for someone like you.',
    whyHere:
      'Fremont\'s business scene is unusually broad: large-scale manufacturing (Tesla and its supplier ecosystem), biotech and life sciences along the Cushing Pkwy corridor, retail at Pacific Commons, and the small-business storefronts of Niles, Centerville, and Mission San Jose. We handle all of it — trade show event displays for Pacific Commons retailers, GHS-compliant labels for biotech, and storefront signage for the Niles antique district.',
    neighborhoods: [
      'Pacific Commons',
      'Niles Boulevard',
      'Mission San Jose',
      'Centerville',
      'Warm Springs',
      'Irvington',
      'Ardenwood',
    ],
    commonProjects: [
      'Trade show event displays, retractable banners, and table covers',
      'Vehicle wraps and fleet branding for Fremont service businesses',
      'Storefront signage for Niles, Centerville, and Mission San Jose',
      'Product labels and packaging for retail and consumer brands',
    ],
    delivery:
      'Free delivery to Fremont on orders $250+. Studio pickup in Hayward is a 15-minute drive on 880 or Mission.',
    faqs: [
      {
        q: 'Can you turn around event displays before a Fremont trade show?',
        a: 'Yes — we keep tent, table cover, feather flag, and retractable banner production tight. If you need it for a show, tell us the date and we\'ll back-time production around it.',
      },
      {
        q: 'Do you print product labels for Fremont consumer brands?',
        a: 'Yes — full color, custom shapes, weatherproof or indoor stock, on roll or sheet, with variable data for batch/lot codes if needed.',
      },
      {
        q: 'Can you do a full vehicle wrap for a Fremont business?',
        a: 'Yes. We use 3M and Avery cast vinyl, design in-house, and install at our Hayward shop.',
      },
    ],
    metaTitle: 'Fremont Custom Stickers, Signage & Vehicle Wraps | The Sticker Smith',
    metaDescription:
      'Fremont\'s East Bay print partner for trade show displays, vehicle wraps, storefront signage, and product labels. Free delivery $250+, fast turnaround, premium materials.',
  },
  {
    slug: 'san-lorenzo',
    name: 'San Lorenzo',
    distanceMiles: 2,
    region: 'East Bay',
    intro:
      'San Lorenzo is the closest city to our shop after Hayward proper. Two miles up, free local delivery, same-day rush on small sticker runs.',
    whyHere:
      'San Lorenzo is mostly residential with tight pockets of small business along Hesperian, Bockman, and the Village Center. We see a lot of small-batch work here — custom stickers for residents and brands, business cards for service pros, signage for the Village Center storefronts, and the occasional family-business rebrand.',
    neighborhoods: [
      'San Lorenzo Village',
      'Hesperian Boulevard',
      'Bockman Road',
      'Lewelling',
      'Ashland (border)',
    ],
    commonProjects: [
      'Custom stickers for San Lorenzo residents, brands, and creators',
      'Business cards and marketing print for service businesses',
      'Storefront signage and window graphics for Village Center',
      'Family-business branding refresh — logo decals, vehicle graphics, signage',
    ],
    delivery:
      'Free local delivery on orders $100+. Studio pickup is a 5-minute drive.',
    faqs: [
      {
        q: 'I just need 50 stickers — can you do that?',
        a: 'Yes. We do small runs as low as 25–50 die-cut stickers. Lower volume = higher per-unit cost, but no hard minimum.',
      },
      {
        q: 'Can you redesign the signage on a family business in San Lorenzo?',
        a: 'Yes — we handle design, production, and install. Drop off your current setup details and we\'ll quote a refresh.',
      },
      {
        q: 'How long does delivery take to San Lorenzo?',
        a: 'For local delivery (orders $100+), usually same-day or next-day. Shipping orders go USPS/UPS at standard transit.',
      },
    ],
    metaTitle: 'Custom Stickers & Local Print in San Lorenzo | The Sticker Smith',
    metaDescription:
      'San Lorenzo\'s nearest print studio — 2 miles up the road in Hayward. Custom stickers, business cards, storefront signage, family-business branding. Free local delivery $100+.',
  },
  {
    slug: 'newark',
    name: 'Newark',
    distanceMiles: 12,
    region: 'East Bay',
    intro:
      'Newark sits in the middle of the East Bay biotech and retail corridor. We handle signage, labels, and vehicle work for NewPark-area retailers and the Cedar/Mowry business strip.',
    whyHere:
      'Newark blends retail anchored around NewPark Mall, biotech and life sciences along Cedar and Mowry, and a working light-industrial base. Our most common Newark projects are retail signage and window graphics, GHS/regulatory labels for biotech, and vehicle graphics for service businesses based out of the Cedar Boulevard corridor.',
    neighborhoods: [
      'NewPark Mall area',
      'Cedar Boulevard',
      'Mowry Avenue',
      'Thornton Avenue',
      'Lake Boulevard',
    ],
    commonProjects: [
      'Retail signage, window graphics, and A-frames around NewPark',
      'GHS / product / regulatory labels for biotech and life sciences',
      'Vehicle decals and partial wraps for Newark service businesses',
      'Custom event displays for trade shows and pop-ups',
    ],
    delivery:
      'Free delivery to Newark on orders $250+. Studio pickup in Hayward is a 15-minute drive.',
    faqs: [
      {
        q: 'Can you print compliance and product labels for a Newark biotech company?',
        a: 'Yes — full-color, GHS-compatible, on weatherproof or indoor stock. We handle small-batch and roll formats.',
      },
      {
        q: 'Do you do retail window graphics for NewPark-area shops?',
        a: 'Yes. Cut vinyl, printed vinyl, perforated window film, and one-way glass treatments. We design, print, and install.',
      },
      {
        q: 'Can you brand a Newark service vehicle?',
        a: 'Yes — door graphics, partial wraps, full wraps in 3M / Avery cast vinyl, installed at our Hayward shop.',
      },
    ],
    metaTitle: 'Newark Retail Signage, Labels & Vehicle Graphics | The Sticker Smith',
    metaDescription:
      'East Bay print studio serving Newark retailers, biotech, and service businesses. Window graphics, regulatory labels, vehicle wraps, custom stickers. Free delivery $250+.',
  },
]

export const cityBySlug = Object.fromEntries(cities.map((c) => [c.slug, c]))
