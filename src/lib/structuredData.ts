import { cityBySlug, cities, type CityConfig } from './cities'
import { projects } from './projects'
import { stickerSupportPageBySlug, type StickerSupportPageConfig } from './stickerSupportPages'

export const SITE_URL = 'https://tssprint.com'
export const BUSINESS_ID = `${SITE_URL}/#localbusiness`

const serviceAreas = [
  ...cities.map((city) => ({ '@type': 'City', name: city.name })),
  { '@type': 'AdministrativeArea', name: 'San Francisco Bay Area' },
]

const serviceCatalog = [
  'Custom stickers and labels',
  'Custom labels in Hayward',
  'Die-cut stickers',
  'Kiss-cut stickers',
  'Sticker sheets',
  'Roll labels in Hayward',
  'Vehicle graphics and fleet wraps in Hayward',
  'Business signage and storefront graphics',
  'Custom canopies, event displays, tents, banners, and table covers',
  'Business cards, flyers, postcards, and marketing print',
  'Window film, tint, and decorative graphics',
  'Custom mylar bags and product labels in Hayward',
]

export const localBusinessSchema = {
  '@type': 'LocalBusiness',
  '@id': BUSINESS_ID,
  name: 'The Sticker Smith',
  alternateName: 'TSS Print',
  description:
    'Custom stickers, labels, decals, signage, vehicle graphics and mylar packaging in the Bay Area. Free digital proofs, fast turnaround, and local pickup in Hayward.',
  url: SITE_URL,
  telephone: '+1-510-634-8203',
  email: 'thestickersmith@gmail.com',
  image: `${SITE_URL}/videos/epic-rane-print.jpg`,
  logo: `${SITE_URL}/favicon.png`,
  priceRange: '$$',
  paymentAccepted: 'Cash, Visa, Mastercard, American Express, Apple Pay, PayPal',
  currenciesAccepted: 'USD',
  knowsAbout: [
    'Bay Area custom stickers',
    'Die-cut stickers',
    'Sticker sheets',
    'Product labels',
    'Vehicle wraps',
    'Fleet graphics',
    'Storefront signage',
    'Custom canopies',
    'Table covers',
    'Mylar packaging',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-510-634-8203',
    contactType: 'sales',
    areaServed: 'San Francisco Bay Area',
    availableLanguage: ['English'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '23673 Connecticut St',
    addressLocality: 'Hayward',
    addressRegion: 'CA',
    postalCode: '94545',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.6589,
    longitude: -122.1167,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '11:00',
      closes: '15:30',
    },
  ],
  areaServed: serviceAreas,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Print and Branding Services',
    itemListElement: serviceCatalog.map((name) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name,
        provider: { '@id': BUSINESS_ID },
      },
    })),
  },
  sameAs: [
    'https://www.instagram.com/thestickersmith',
    'https://www.facebook.com/thestickersmith',
    'https://www.tiktok.com/@thestickersmith',
    'https://www.yelp.com/biz/the-sticker-smith-hayward',
  ],
}

const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'The Sticker Smith',
  url: SITE_URL,
  publisher: { '@id': BUSINESS_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/projects?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

const serviceSchemas: Record<string, { name: string; description: string; serviceType: string }> = {
  '/stickers': {
    name: 'Bay Area Custom Stickers and Labels',
    serviceType: 'Bay Area custom stickers, labels, decals, and sticker printing',
    description:
      'Bay Area custom sticker printing for die-cut stickers, kiss-cut stickers, sticker sheets, roll labels, holographic stickers, matte stickers, and custom vinyl decals.',
  },
  '/services/vehicle-graphics': {
    name: 'Vehicle Graphics and Fleet Wraps in Hayward and the Bay Area',
    serviceType: 'Vehicle graphics, wraps, decals, vinyl lettering, and fleet branding in Hayward',
    description:
      'Custom vehicle graphics in Hayward and the Bay Area, including full wraps, partial wraps, door graphics, fleet branding, perforated window graphics, vinyl lettering, and vehicle decals.',
  },
  '/services/business-signage': {
    name: 'Business Signs and Signage in Hayward and the Bay Area',
    serviceType: 'Business signs, storefront signage, A-frame signs, banners, and wall graphics',
    description:
      'Custom business signs and signage in Hayward and the Bay Area, including storefront signs, wall graphics, A-frame sidewalk signs, retractable banners, acrylic signs, metal signs, window graphics, and illuminated signage.',
  },
  '/services/event-displays': {
    name: 'Custom Canopies, Banners, and Event Displays in Hayward and the Bay Area',
    serviceType: 'Custom printed canopy tents, banners, feather flags, table covers, and event displays in Hayward',
    description:
      'Custom canopies and event displays for Hayward and Bay Area businesses, including branded canopy tents, feather flags, vinyl banners, backdrops, table covers, retractable banners, and booth displays.',
  },
  '/services/business-print': {
    name: 'Business Print Materials',
    serviceType: 'Business cards, flyers, postcards, and marketing print',
    description:
      'Business cards, flyers, postcards, menus, rack cards, brochures, and printed marketing materials for Bay Area brands.',
  },
  '/services/window-film': {
    name: 'Window Film, Tint, and Graphics',
    serviceType: 'Window film, tint, privacy film, and window graphics',
    description:
      'Frosted window film, solar tint, security film, privacy film, decorative window graphics, and perforated window vinyl.',
  },
  '/mylar': {
    name: 'Custom Mylar Bags and Jar Labels in Hayward and the Bay Area',
    serviceType: 'Custom mylar bags, pouch packaging, jar labels, and product labels in Hayward',
    description:
      'Custom mylar bags in Hayward and the Bay Area, including pouch packaging, jar labels, and product labels for food projects, cannabis and CBD packaging, retail products, and launch runs.',
  },
}

const serviceProofByPath: Record<string, string[]> = {
  '/stickers': ['stickers-die-cut', 'fremontgear-stickers', 'stickers-roll'],
  '/services/vehicle-graphics': ['safeway-fleet-graphics', 'albertsons-fleet-graphics', 'bhogal-construction-truck-wrap'],
  '/services/business-signage': ['atlas-pizza-storefront', 'elevated-925-storefront', 'lake-life-storage-sign'],
  '/services/event-displays': ['event-booth', 'feather-flags', 'wedding-display-signage'],
  '/services/business-print': ['cleopatra-ink-discount-cards', 'cleopatra-ink-tattoo-flyer', 'empire-automotive-flyer'],
  '/mylar': ['shockco-candyshock-green', 'shockco-candyshock-blue', 'shockco-atomicshock', 'triple-a-cannabis', 'elevated925-mystery-snack-pack'],
}

function projectWorkSchema(slug: string) {
  const project = projects.find((item) => item.slug === slug)
  if (!project) return null

  return {
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: `${SITE_URL}${project.image}`,
    about: project.category,
    creator: { '@id': BUSINESS_ID },
  }
}

function serviceSchema(pathname: string) {
  const supportSlug = pathname.replace(/^\//, '')
  const supportPage = stickerSupportPageBySlug[supportSlug]
  const service = supportPage
    ? {
        name: supportPage.title,
        serviceType: supportPage.serviceType,
        description: supportPage.metaDescription,
      }
    : serviceSchemas[pathname]
  if (!service) return null

  const proof = serviceProofByPath[pathname]?.map(projectWorkSchema).filter(Boolean)

  return {
    '@type': 'Service',
    '@id': `${SITE_URL}${pathname}#service`,
    ...service,
    provider: { '@id': BUSINESS_ID },
    areaServed: serviceAreas,
    url: `${SITE_URL}${pathname}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@id': BUSINESS_ID },
      url: `${SITE_URL}${pathname}`,
    },
    ...(proof?.length ? { subjectOf: proof } : {}),
  }
}

function projectCollectionSchema() {
  return {
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/projects#collection`,
    name: 'The Sticker Smith project proof gallery',
    description:
      'Real Bay Area sticker, business signage, vehicle graphics, event display, mylar packaging, and business print projects completed by The Sticker Smith.',
    url: `${SITE_URL}/projects`,
    about: { '@id': BUSINESS_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.slice(0, 24).map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.title,
          description: project.description,
          image: `${SITE_URL}${project.image}`,
          about: project.category,
          creator: { '@id': BUSINESS_ID },
        },
      })),
    },
  }
}

const breadcrumbLabels: Record<string, string> = {
  '/': 'Home',
  '/stickers': 'Custom Stickers',
  '/services': 'Services',
  '/services/vehicle-graphics': 'Vehicle Graphics',
  '/services/business-signage': 'Business Signage',
  '/services/event-displays': 'Event Displays',
  '/services/business-print': 'Business Print',
  '/services/window-film': 'Window Film',
  '/mylar': 'Custom Mylar Packaging',
  '/contact': 'Contact',
  '/quote': 'Fast Quote',
  '/about': 'About',
  '/projects': 'Projects',
  '/referral': 'Referral Program',
}

function breadcrumbSchema(pathname: string) {
  const citySlug = pathname.replace(/^\//, '')
  const city = cityBySlug[citySlug]
  const stickerPage = stickerSupportPageBySlug[citySlug]
  const items = [{ name: 'Home', url: SITE_URL }]

  if (pathname.startsWith('/services/')) {
    items.push({ name: 'Services', url: `${SITE_URL}/services` })
  }
  if (stickerPage) {
    items.push({ name: 'Custom Stickers', url: `${SITE_URL}/stickers` })
  }

  if (city) {
    items.push({ name: `${city.name} Print Services`, url: `${SITE_URL}/${city.slug}` })
  } else if (stickerPage) {
    items.push({ name: stickerPage.title, url: `${SITE_URL}/${stickerPage.slug}` })
  } else if (pathname !== '/') {
    items.push({ name: breadcrumbLabels[pathname] ?? 'Page', url: `${SITE_URL}${pathname}` })
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${pathname === '/' ? '' : pathname}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

const stickerFaqSchema = {
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/stickers#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you print custom stickers in the Bay Area?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Sticker Smith prints custom stickers and labels in Hayward for Bay Area brands, artists, shops, events, and packaging projects, with local pickup available.',
      },
    },
    {
      '@type': 'Question',
      name: 'What sticker types can I order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can order die-cut stickers, kiss-cut stickers, sticker sheets, roll labels, holographic stickers, clear decals, matte stickers, and waterproof vinyl stickers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I get a proof before printing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every custom sticker order includes a digital proof before production so cut lines, bleed, sizing, material, and artwork quality can be checked before anything prints.',
      },
    },
  ],
}

const serviceFaqSchemas: Record<string, { q: string; a: string }[]> = {
  '/services/vehicle-graphics': [
    {
      q: 'Where can I get vehicle graphics in Hayward CA?',
      a: 'The Sticker Smith produces vehicle graphics in Hayward CA for Bay Area businesses, including door decals, vinyl lettering, partial wraps, full wraps, box truck graphics, van graphics, and fleet branding.',
    },
    {
      q: 'Do you handle vehicle wrap design and installation?',
      a: 'Yes. We can help with design, digital proofing, premium vinyl production, laminate, and professional installation for most vehicle graphic projects.',
    },
    {
      q: 'What should I send for a vehicle graphics quote?',
      a: 'Send the year, make, model, vehicle photos, logo files, the graphics you want, and whether you need decals, lettering, a partial wrap, full wrap, or fleet rollout.',
    },
  ],
  '/services/business-signage': [
    {
      q: 'Do you make business signs in Hayward?',
      a: 'Yes. The Sticker Smith makes custom business signs and signage in Hayward for storefronts, offices, restaurants, service companies, pop-ups, and retail locations across the East Bay.',
    },
    {
      q: 'Can you install storefront signs and window graphics?',
      a: 'Yes. Professional Bay Area installation is available for storefront signs, window graphics, wall graphics, vinyl lettering, acrylic signs, and A-frame signage.',
    },
    {
      q: 'What should I send for a signage quote?',
      a: 'Send photos of the install area, rough dimensions, your logo or artwork, the business location, and whether you need design help, printing only, or full installation.',
    },
  ],
  '/services/event-displays': [
    {
      q: 'Where can I order custom canopies in Hayward CA?',
      a: 'The Sticker Smith prints custom canopies in Hayward CA for Bay Area events, pop-ups, markets, trade shows, school events, and branded business booths.',
    },
    {
      q: 'Do you print custom canopy tents in the Bay Area?',
      a: 'Yes. The Sticker Smith prints custom canopy tents, table covers, flags, banners, and backdrops for Bay Area and Hayward events, markets, trade shows, and pop-ups.',
    },
    {
      q: 'Can I order a full booth kit?',
      a: 'Yes. You can bundle a canopy, table cover, feather flags, retractable banners, and backdrop graphics so your event setup looks consistent from every angle.',
    },
    {
      q: 'How early should I order before an event?',
      a: 'Most event displays need 5 to 10 business days after proof approval. Rush options depend on the product, hardware availability, and event date.',
    },
  ],
  '/mylar': [
    {
      q: 'Where can I print custom mylar bags in Hayward CA?',
      a: 'The Sticker Smith prints custom mylar bags in Hayward CA for Bay Area brands, including pouch packaging, eighth bags, quarter bags, ounce bags, pound bags, jar labels, and product labels.',
    },
    {
      q: 'Do you print custom mylar bags in the Bay Area?',
      a: 'Yes. The Sticker Smith prints custom mylar bags, pouch packaging, jar labels, and product labels from Hayward for Bay Area brands, shops, food projects, cannabis and CBD packaging, and retail launches.',
    },
    {
      q: 'What mylar bag sizes can I order?',
      a: 'Common options include eighth, quarter, ounce, half-pound, and pound-size mylar bags, plus 2oz jar labels and custom packaging quotes for larger or unusual product runs.',
    },
    {
      q: 'What should I send for a mylar packaging quote?',
      a: 'Send your bag size, quantity, artwork or logo, product type, finish preference, and any compliance notes. A digital proof is sent before production so the layout can be checked before printing.',
    },
  ],
}

function serviceFaqSchema(pathname: string) {
  const faqs = serviceFaqSchemas[pathname]
  if (!faqs) return null

  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}${pathname}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

function stickerSupportFaqSchema(page: StickerSupportPageConfig) {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/${page.slug}#faq`,
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

function cityServiceSchema(city: CityConfig) {
  return {
    '@type': 'Service',
    '@id': `${SITE_URL}/${city.slug}#service`,
    name: `Custom stickers, signage, and print in ${city.name}`,
    serviceType: 'Custom printing, stickers, signage, vehicle graphics, packaging, and business print',
    description: city.metaDescription,
    provider: { '@id': BUSINESS_ID },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'AdministrativeArea', name: 'San Francisco Bay Area' },
    },
    url: `${SITE_URL}/${city.slug}`,
  }
}

function cityFaqSchema(city: CityConfig) {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/${city.slug}#faq`,
    mainEntity: city.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export function getStructuredData(pathname: string) {
  const canonicalPath = pathname === '/' ? '' : pathname
  const citySlug = pathname.replace(/^\//, '')
  const graph: Array<Record<string, unknown>> = [
    localBusinessSchema,
    websiteSchema,
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${canonicalPath}#webpage`,
      url: `${SITE_URL}${canonicalPath}`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': BUSINESS_ID },
      breadcrumb: { '@id': `${SITE_URL}${canonicalPath}#breadcrumb` },
    },
    breadcrumbSchema(pathname),
  ]

  const service = serviceSchema(pathname)
  if (service) graph.push(service)

  if (pathname === '/stickers') graph.push(stickerFaqSchema)

  const serviceFaq = serviceFaqSchema(pathname)
  if (serviceFaq) graph.push(serviceFaq)

  const supportPage = stickerSupportPageBySlug[citySlug]
  if (supportPage) graph.push(stickerSupportFaqSchema(supportPage))

  if (pathname === '/projects') graph.push(projectCollectionSchema())

  const city = cityBySlug[citySlug]
  if (city) {
    graph.push(cityServiceSchema(city), cityFaqSchema(city))
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
