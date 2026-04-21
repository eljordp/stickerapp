const STORAGE_KEY = 'tss-pricing'

export interface AddOn {
  name: string
  type: 'multiplier' | 'flat'
  value: number
}

export interface ProductTier {
  size: string
  quantities: { qty: number; price: number }[]
}

export interface ProductCategory {
  name: string
  items: ProductTier[]
  addOns: AddOn[]
}

export interface PricingConfig {
  basePrices: { maxQty: number; price: number }[]
  materialMultipliers: { name: string; multiplier: number }[]
  stickerAddOns: AddOn[]
  products: ProductCategory[]
}

export const defaultPricing: PricingConfig = {
  basePrices: [
    { maxQty: 50, price: 0.45 },
    { maxQty: 100, price: 0.35 },
    { maxQty: 200, price: 0.28 },
    { maxQty: 500, price: 0.22 },
    { maxQty: Infinity, price: 0.18 },
  ],
  materialMultipliers: [
    { name: 'Matte Vinyl', multiplier: 1.0 },
    { name: 'Glossy Vinyl', multiplier: 1.0 },
    { name: 'Clear', multiplier: 1.2 },
    { name: 'Holographic', multiplier: 1.4 },
    { name: 'Paper', multiplier: 1.0 },
  ],
  stickerAddOns: [
    { name: 'Gloss', type: 'flat', value: 0.05 },
    { name: 'Holo', type: 'flat', value: 0.15 },
    { name: 'UV', type: 'flat', value: 0.25 },
    { name: 'Paper', type: 'flat', value: 0.03 },
    { name: 'Embossed', type: 'flat', value: 0.30 },
  ],
  products: [
    // 0: Mylar Packaging
    { name: 'Mylar Packaging', items: [
      { size: 'Eighths (3"×5")', quantities: [{ qty: 100, price: 0.90 }, { qty: 250, price: 0.85 }, { qty: 500, price: 0.80 }, { qty: 1000, price: 0.75 }, { qty: 2500, price: 0.70 }] },
      { size: 'Quarters (4"×6")', quantities: [{ qty: 100, price: 1.00 }, { qty: 250, price: 0.97 }, { qty: 500, price: 0.90 }, { qty: 1000, price: 0.87 }, { qty: 2500, price: 0.72 }] },
      { size: 'Ounce Bags (5"×8")', quantities: [{ qty: 100, price: 2.00 }, { qty: 250, price: 1.95 }, { qty: 500, price: 1.85 }, { qty: 1000, price: 1.80 }, { qty: 2500, price: 1.75 }] },
      { size: 'Half Pound (10"×12")', quantities: [{ qty: 50, price: 7.50 }, { qty: 100, price: 7.00 }, { qty: 250, price: 6.50 }, { qty: 500, price: 6.00 }] },
      { size: 'Pound Bags (14"×16")', quantities: [{ qty: 50, price: 10.00 }, { qty: 100, price: 9.00 }, { qty: 250, price: 8.00 }, { qty: 500, price: 7.50 }] },
      { size: '2oz Jar Labels', quantities: [{ qty: 100, price: 2.00 }, { qty: 250, price: 1.95 }, { qty: 500, price: 1.90 }, { qty: 1000, price: 1.85 }, { qty: 2500, price: 1.80 }] },
    ], addOns: [
      { name: 'Holographic Upgrade', type: 'flat', value: 0.15 },
      { name: 'Direct Print', type: 'flat', value: 0.25 },
      { name: 'Window Cutout', type: 'flat', value: 0.10 },
      { name: 'Foil Finish', type: 'flat', value: 0.10 },
    ]},
    // 1: Event Displays
    { name: 'Event Displays', items: [
      { size: '5\'×5\' Steel', quantities: [{ qty: 1, price: 399 }] },
      { size: '5\'×5\' Aluminum', quantities: [{ qty: 1, price: 549 }] },
      { size: '10\'×10\' Steel', quantities: [{ qty: 1, price: 728 }] },
      { size: '10\'×10\' Aluminum', quantities: [{ qty: 1, price: 899 }] },
      { size: '10\'×15\' Steel', quantities: [{ qty: 1, price: 1200 }] },
      { size: '10\'×15\' Aluminum', quantities: [{ qty: 1, price: 1400 }] },
      { size: '10\'×20\' Steel', quantities: [{ qty: 1, price: 1500 }] },
      { size: '10\'×20\' Aluminum', quantities: [{ qty: 1, price: 1750 }] },
    ], addOns: [
      { name: 'Sidewalls (set of 4)', type: 'flat', value: 199 },
      { name: 'Half Walls (set of 4)', type: 'flat', value: 149 },
    ]},
    // 2: Backdrops & Displays
    { name: 'Backdrops & Displays', items: [
      { size: '8\'×7.5\' Graphic Only', quantities: [{ qty: 1, price: 99 }] },
      { size: '8\'×7.5\' With Frame', quantities: [{ qty: 1, price: 199 }] },
      { size: '10\'×7.5\' Graphic Only', quantities: [{ qty: 1, price: 149 }] },
      { size: '10\'×7.5\' With Frame', quantities: [{ qty: 1, price: 349 }] },
    ], addOns: [
      { name: 'Vinyl Upgrade', type: 'flat', value: 20 },
      { name: 'Pop-Up Display', type: 'flat', value: 50 },
      { name: 'Tension Fabric', type: 'flat', value: 30 },
    ]},
    // 3: Table Covers
    { name: 'Table Covers', items: [
      { size: '6ft Rectangular', quantities: [{ qty: 1, price: 190 }] },
      { size: '8ft Rectangular', quantities: [{ qty: 1, price: 210 }] },
      { size: '31" Round', quantities: [{ qty: 1, price: 159 }] },
      { size: '36" Round', quantities: [{ qty: 1, price: 179 }] },
      { size: '48" Round', quantities: [{ qty: 1, price: 209 }] },
      { size: '60" Round', quantities: [{ qty: 1, price: 225 }] },
    ], addOns: []},
    // 4: Retractable Banners
    { name: 'Retractable Banners', items: [
      { size: 'Economy (33"×78")', quantities: [{ qty: 1, price: 89 }, { qty: 2, price: 80 }, { qty: 6, price: 70 }] },
      { size: 'Standard (33"×81")', quantities: [{ qty: 1, price: 129 }, { qty: 2, price: 109 }, { qty: 6, price: 95 }] },
      { size: 'Premium (36"×85")', quantities: [{ qty: 1, price: 169 }, { qty: 2, price: 145 }, { qty: 6, price: 125 }] },
      { size: 'Wide (47"×85")', quantities: [{ qty: 1, price: 229 }, { qty: 2, price: 199 }, { qty: 6, price: 175 }] },
    ], addOns: [
      { name: 'Double-Sided', type: 'flat', value: 50 },
      { name: 'Outdoor Base', type: 'flat', value: 40 },
      { name: 'Travel Case', type: 'flat', value: 25 },
    ]},
    // 5: Business Cards
    { name: 'Business Cards', items: [
      { size: 'Standard (3.5"×2")', quantities: [{ qty: 250, price: 49 }, { qty: 500, price: 79 }, { qty: 1000, price: 129 }] },
      { size: 'Square (2.5"×2.5")', quantities: [{ qty: 250, price: 59 }, { qty: 500, price: 89 }, { qty: 1000, price: 149 }] },
      { size: 'Mini (3"×1")', quantities: [{ qty: 250, price: 39 }, { qty: 500, price: 59 }, { qty: 1000, price: 99 }] },
    ], addOns: [
      { name: 'Soft-Touch', type: 'flat', value: 15 },
      { name: 'Spot UV', type: 'flat', value: 25 },
      { name: 'Foil Stamping', type: 'flat', value: 35 },
      { name: 'Rounded Corners', type: 'flat', value: 10 },
    ]},
    // 6: Storefront Graphics
    { name: 'Storefront Graphics', items: [
      { size: 'Vinyl Lettering – Small (up to 10 sq ft)', quantities: [{ qty: 1, price: 150 }] },
      { size: 'Vinyl Lettering – Medium (10-25 sq ft)', quantities: [{ qty: 1, price: 300 }] },
      { size: 'Vinyl Lettering – Large (25+ sq ft)', quantities: [{ qty: 1, price: 500 }] },
      { size: 'Printed Graphics – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 375 }] },
      { size: 'Printed Graphics – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 600 }] },
      { size: 'Printed Graphics – Large (50+ sq ft)', quantities: [{ qty: 1, price: 1000 }] },
      { size: 'Perforated Window – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 450 }] },
      { size: 'Perforated Window – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 750 }] },
      { size: 'Perforated Window – Large (50+ sq ft)', quantities: [{ qty: 1, price: 1200 }] },
    ], addOns: [
      { name: 'Professional Installation', type: 'flat', value: 150 },
      { name: 'Design Service', type: 'flat', value: 75 },
      { name: 'Permit Assistance', type: 'flat', value: 50 },
    ]},
    // 7: A-Frame Signs
    { name: 'A-Frame Signs', items: [
      { size: 'Small (20"×20")', quantities: [{ qty: 1, price: 129 }, { qty: 3, price: 120 }, { qty: 6, price: 108 }] },
      { size: 'Standard (24"×36")', quantities: [{ qty: 1, price: 259 }, { qty: 3, price: 240 }, { qty: 6, price: 218 }] },
    ], addOns: [
      { name: 'Changeable Inserts', type: 'flat', value: 20 },
      { name: 'Chalkboard Surface', type: 'flat', value: 15 },
      { name: 'Weighted Base', type: 'flat', value: 25 },
    ]},
    // 8: Wall Graphics
    { name: 'Wall Graphics', items: [
      { size: 'Vinyl Decals – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 250 }] },
      { size: 'Vinyl Decals – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 400 }] },
      { size: 'Vinyl Decals – Large (50-100 sq ft)', quantities: [{ qty: 1, price: 600 }] },
      { size: 'Full Color Mural – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 450 }] },
      { size: 'Full Color Mural – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 750 }] },
      { size: 'Full Color Mural – Large (50-100 sq ft)', quantities: [{ qty: 1, price: 1200 }] },
    ], addOns: [
      { name: 'Professional Installation', type: 'flat', value: 200 },
      { name: 'Removable Vinyl', type: 'flat', value: 50 },
      { name: 'Textured Wall Prep', type: 'flat', value: 75 },
    ]},
    // 9: Decals & Lettering (Vehicle)
    { name: 'Decals & Lettering', items: [
      { size: 'Door Decals (pair)', quantities: [{ qty: 1, price: 150 }, { qty: 3, price: 130 }, { qty: 5, price: 110 }] },
      { size: 'Rear Window Decal', quantities: [{ qty: 1, price: 120 }, { qty: 3, price: 100 }, { qty: 5, price: 85 }] },
      { size: 'Vinyl Lettering (per vehicle)', quantities: [{ qty: 1, price: 200 }, { qty: 3, price: 175 }, { qty: 5, price: 150 }] },
      { size: 'Spot Graphics (logo/badge)', quantities: [{ qty: 1, price: 80 }, { qty: 3, price: 65 }, { qty: 5, price: 55 }] },
    ], addOns: [
      { name: 'Reflective Vinyl', type: 'flat', value: 40 },
      { name: 'Custom Shape Cut', type: 'flat', value: 25 },
    ]},
    // 10: Full Vehicle Wraps
    { name: 'Full Wraps', items: [
      { size: 'Compact Car', quantities: [{ qty: 1, price: 2500 }, { qty: 2, price: 2250 }, { qty: 4, price: 2000 }] },
      { size: 'Sedan / SUV', quantities: [{ qty: 1, price: 3200 }, { qty: 2, price: 2900 }, { qty: 4, price: 2600 }] },
      { size: 'Truck / Van', quantities: [{ qty: 1, price: 4000 }, { qty: 2, price: 3600 }, { qty: 4, price: 3200 }] },
      { size: 'Box Truck / Trailer', quantities: [{ qty: 1, price: 5500 }] },
    ], addOns: [
      { name: 'Chrome Delete', type: 'flat', value: 300 },
      { name: 'Paint Protection Film', type: 'flat', value: 500 },
      { name: 'Rush Turnaround', type: 'flat', value: 250 },
    ]},
    // 11: Partial Vehicle Wraps
    { name: 'Partial Wraps', items: [
      { size: 'Quarter Wrap', quantities: [{ qty: 1, price: 500 }, { qty: 2, price: 450 }, { qty: 4, price: 400 }] },
      { size: 'Half Wrap', quantities: [{ qty: 1, price: 900 }, { qty: 2, price: 800 }, { qty: 4, price: 700 }] },
      { size: 'Three-Quarter Wrap', quantities: [{ qty: 1, price: 1400 }, { qty: 2, price: 1250 }, { qty: 4, price: 1100 }] },
    ], addOns: [
      { name: 'Perforated Window Graphics', type: 'flat', value: 150 },
      { name: 'Roof Wrap', type: 'flat', value: 200 },
    ]},
    // 12: Frosted & Decorative Film
    { name: 'Frosted & Decorative', items: [
      { size: 'Standard Frosted – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 200 }] },
      { size: 'Standard Frosted – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 400 }] },
      { size: 'Standard Frosted – Large (50-100 sq ft)', quantities: [{ qty: 1, price: 600 }] },
      { size: 'Custom Cut Frosted – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 375 }] },
      { size: 'Custom Cut Frosted – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 600 }] },
      { size: 'Custom Cut Frosted – Large (50-100 sq ft)', quantities: [{ qty: 1, price: 1000 }] },
      { size: 'Decorative Pattern – Small (up to 25 sq ft)', quantities: [{ qty: 1, price: 400 }] },
      { size: 'Decorative Pattern – Medium (25-50 sq ft)', quantities: [{ qty: 1, price: 700 }] },
      { size: 'Decorative Pattern – Large (50-100 sq ft)', quantities: [{ qty: 1, price: 1100 }] },
    ], addOns: [
      { name: 'Professional Installation', type: 'flat', value: 150 },
      { name: 'Custom Logo Cutout', type: 'flat', value: 75 },
    ]},
    // 13: Solar & UV Film
    { name: 'Solar & UV Protection', items: [
      { size: 'Light Tint (50%) – Small (up to 50 sq ft)', quantities: [{ qty: 1, price: 600 }] },
      { size: 'Light Tint (50%) – Medium (50-150 sq ft)', quantities: [{ qty: 1, price: 1000 }] },
      { size: 'Light Tint (50%) – Large (150+ sq ft)', quantities: [{ qty: 1, price: 1500 }] },
      { size: 'Medium Tint (35%) – Small (up to 50 sq ft)', quantities: [{ qty: 1, price: 700 }] },
      { size: 'Medium Tint (35%) – Medium (50-150 sq ft)', quantities: [{ qty: 1, price: 1200 }] },
      { size: 'Medium Tint (35%) – Large (150+ sq ft)', quantities: [{ qty: 1, price: 1800 }] },
      { size: 'Ceramic Film – Small (up to 50 sq ft)', quantities: [{ qty: 1, price: 1000 }] },
      { size: 'Ceramic Film – Medium (50-150 sq ft)', quantities: [{ qty: 1, price: 1800 }] },
      { size: 'Ceramic Film – Large (150+ sq ft)', quantities: [{ qty: 1, price: 2700 }] },
    ], addOns: [
      { name: 'Professional Installation', type: 'flat', value: 200 },
      { name: 'Anti-Graffiti Coating', type: 'flat', value: 100 },
    ]},
    // 14: Security Film
    { name: 'Security Film', items: [
      { size: '4 Mil Clear – Small (up to 50 sq ft)', quantities: [{ qty: 1, price: 500 }] },
      { size: '4 Mil Clear – Medium (50-150 sq ft)', quantities: [{ qty: 1, price: 900 }] },
      { size: '4 Mil Clear – Large (150+ sq ft)', quantities: [{ qty: 1, price: 1200 }] },
      { size: '8 Mil Clear – Small (up to 50 sq ft)', quantities: [{ qty: 1, price: 700 }] },
      { size: '8 Mil Clear – Medium (50-150 sq ft)', quantities: [{ qty: 1, price: 1200 }] },
      { size: '8 Mil Clear – Large (150+ sq ft)', quantities: [{ qty: 1, price: 1800 }] },
      { size: '12 Mil Clear – Small (up to 50 sq ft)', quantities: [{ qty: 1, price: 900 }] },
      { size: '12 Mil Clear – Medium (50-150 sq ft)', quantities: [{ qty: 1, price: 1600 }] },
      { size: '12 Mil Clear – Large (150+ sq ft)', quantities: [{ qty: 1, price: 2400 }] },
    ], addOns: [
      { name: 'Professional Installation', type: 'flat', value: 200 },
      { name: 'Anchored Frame System', type: 'flat', value: 300 },
      { name: 'Tinted Security', type: 'flat', value: 150 },
    ]},
    // 15: Automotive Window Tint
    { name: 'Automotive Window Tint', items: [
      { size: 'Sedan – Front 2 Windows', quantities: [{ qty: 1, price: 120 }] },
      { size: 'Sedan – Rear + Back Window', quantities: [{ qty: 1, price: 180 }] },
      { size: 'Sedan – Full Car (all windows)', quantities: [{ qty: 1, price: 280 }] },
      { size: 'SUV / Truck – Front 2 Windows', quantities: [{ qty: 1, price: 140 }] },
      { size: 'SUV / Truck – Rear + Back Window', quantities: [{ qty: 1, price: 220 }] },
      { size: 'SUV / Truck – Full Vehicle (all windows)', quantities: [{ qty: 1, price: 350 }] },
      { size: 'Windshield Visor Strip', quantities: [{ qty: 1, price: 60 }] },
      { size: 'Full Windshield Tint', quantities: [{ qty: 1, price: 150 }] },
    ], addOns: [
      { name: 'Ceramic Tint Upgrade', type: 'flat', value: 100 },
      { name: 'Carbon Tint Upgrade', type: 'flat', value: 60 },
      { name: 'Old Tint Removal', type: 'flat', value: 50 },
    ]},
    // 16: Flyers & Door Hangers
    { name: 'Flyers & Door Hangers', items: [
      { size: '8.5"×11" Flyer', quantities: [{ qty: 100, price: 55 }, { qty: 250, price: 99 }, { qty: 500, price: 159 }, { qty: 1000, price: 249 }] },
      { size: '5.5"×8.5" Half-Page Flyer', quantities: [{ qty: 100, price: 39 }, { qty: 250, price: 69 }, { qty: 500, price: 109 }, { qty: 1000, price: 179 }] },
      { size: 'Door Hangers', quantities: [{ qty: 100, price: 69 }, { qty: 250, price: 119 }, { qty: 500, price: 189 }, { qty: 1000, price: 299 }] },
    ], addOns: [
      { name: 'Glossy Finish', type: 'flat', value: 10 },
      { name: 'Double-Sided', type: 'flat', value: 20 },
    ]},
    // 17: Postcards
    { name: 'Postcards', items: [
      { size: '4"×6" Postcard', quantities: [{ qty: 100, price: 45 }, { qty: 250, price: 79 }, { qty: 500, price: 129 }, { qty: 1000, price: 199 }] },
      { size: '5"×7" Postcard', quantities: [{ qty: 100, price: 55 }, { qty: 250, price: 95 }, { qty: 500, price: 149 }, { qty: 1000, price: 239 }] },
    ], addOns: [
      { name: 'Soft-Touch', type: 'flat', value: 15 },
      { name: 'Spot UV', type: 'flat', value: 25 },
      { name: 'Glossy Finish', type: 'flat', value: 10 },
    ]},
    // 18: Vehicle Magnets
    { name: 'Vehicle Magnets', items: [
      { size: '12"×18"', quantities: [{ qty: 1, price: 35 }, { qty: 2, price: 30 }, { qty: 5, price: 25 }] },
      { size: '18"×24"', quantities: [{ qty: 1, price: 49 }, { qty: 2, price: 42 }, { qty: 5, price: 35 }] },
      { size: '24"×36"', quantities: [{ qty: 1, price: 69 }, { qty: 2, price: 59 }, { qty: 5, price: 49 }] },
    ], addOns: [
      { name: 'Rounded Corners', type: 'flat', value: 10 },
      { name: 'UV Laminate', type: 'flat', value: 8 },
    ]},
  ],
}

export function getPricing(): PricingConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Restore Infinity for the last tier
      parsed.basePrices = parsed.basePrices.map((t: { maxQty: number | null; price: number }) => ({
        ...t,
        maxQty: t.maxQty === null ? Infinity : t.maxQty,
      }))
      // Ensure new fields exist with defaults
      if (!parsed.stickerAddOns) parsed.stickerAddOns = defaultPricing.stickerAddOns
      if (!parsed.products) {
        parsed.products = defaultPricing.products
      } else if (parsed.products.length < defaultPricing.products.length) {
        // Append any new default categories that were added after the user last saved
        for (let i = parsed.products.length; i < defaultPricing.products.length; i++) {
          parsed.products.push(defaultPricing.products[i])
        }
      }
      return parsed
    }
  } catch { /* use defaults */ }
  return defaultPricing
}

export function savePricing(config: PricingConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getBasePrice(quantity: number, config: PricingConfig): number {
  for (const tier of config.basePrices) {
    if (quantity <= tier.maxQty) return tier.price
  }
  return config.basePrices[config.basePrices.length - 1].price
}

export function getMaterialMultiplier(material: string, config: PricingConfig): number {
  const found = config.materialMultipliers.find(m => m.name === material)
  return found ? found.multiplier : 1.0
}
