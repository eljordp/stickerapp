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
    { name: 'Gloss', type: 'multiplier', value: 1.0 },
    { name: 'Holo', type: 'multiplier', value: 1.25 },
    { name: 'UV', type: 'multiplier', value: 2.0 },
    { name: 'Paper', type: 'multiplier', value: 0.9 },
    { name: 'Embossed', type: 'multiplier', value: 2.0 },
  ],
  products: [
    {
      name: 'Mylar Packaging',
      items: [
        { size: 'Eighths (3"×5")', quantities: [{ qty: 100, price: 0.90 }, { qty: 250, price: 0.80 }, { qty: 500, price: 0.75 }, { qty: 1000, price: 0.70 }] },
        { size: 'Quarters (4"×6")', quantities: [{ qty: 100, price: 1.00 }, { qty: 250, price: 0.90 }, { qty: 500, price: 0.80 }, { qty: 1000, price: 0.72 }] },
        { size: 'Ounce Bags (5"×8")', quantities: [{ qty: 100, price: 2.00 }, { qty: 250, price: 1.90 }, { qty: 500, price: 1.80 }, { qty: 1000, price: 1.75 }] },
        { size: 'Half Pound (10"×12")', quantities: [{ qty: 100, price: 7.50 }, { qty: 250, price: 7.00 }, { qty: 500, price: 6.50 }, { qty: 1000, price: 6.00 }] },
        { size: 'Pound Bags (14"×16")', quantities: [{ qty: 100, price: 10.00 }, { qty: 250, price: 9.00 }, { qty: 500, price: 8.00 }, { qty: 1000, price: 7.50 }] },
        { size: '2oz Jar Labels', quantities: [{ qty: 100, price: 2.00 }, { qty: 250, price: 1.90 }, { qty: 500, price: 1.85 }, { qty: 1000, price: 1.80 }] },
      ],
      addOns: [
        { name: 'Holographic Upgrade', type: 'multiplier', value: 1.15 },
        { name: 'Direct Print', type: 'flat', value: 0.25 },
        { name: 'Window Cutout', type: 'flat', value: 0.10 },
        { name: 'Foil Finish', type: 'multiplier', value: 1.10 },
      ],
    },
    {
      name: 'Event Canopies',
      items: [
        { size: '5\'×5\' Steel', quantities: [{ qty: 1, price: 399 }] },
        { size: '5\'×5\' Aluminum', quantities: [{ qty: 1, price: 549 }] },
        { size: '10\'×10\' Steel', quantities: [{ qty: 1, price: 728 }] },
        { size: '10\'×10\' Aluminum', quantities: [{ qty: 1, price: 899 }] },
        { size: '10\'×15\' Steel', quantities: [{ qty: 1, price: 1200 }] },
        { size: '10\'×15\' Aluminum', quantities: [{ qty: 1, price: 1400 }] },
        { size: '10\'×20\' Steel', quantities: [{ qty: 1, price: 1500 }] },
        { size: '10\'×20\' Aluminum', quantities: [{ qty: 1, price: 1750 }] },
      ],
      addOns: [
        { name: 'Sidewalls (set of 4)', type: 'flat', value: 199 },
        { name: 'Half Walls (set of 4)', type: 'flat', value: 149 },
      ],
    },
    {
      name: 'Backdrops & Displays',
      items: [
        { size: '8\'×7.5\' Graphic Only', quantities: [{ qty: 1, price: 99 }] },
        { size: '8\'×7.5\' With Frame', quantities: [{ qty: 1, price: 199 }] },
        { size: '10\'×7.5\' Graphic Only', quantities: [{ qty: 1, price: 149 }] },
        { size: '10\'×7.5\' With Frame', quantities: [{ qty: 1, price: 349 }] },
      ],
      addOns: [
        { name: 'Vinyl Upgrade', type: 'flat', value: 20 },
        { name: 'Pop-Up Display', type: 'flat', value: 50 },
        { name: 'Tension Fabric', type: 'flat', value: 30 },
      ],
    },
    {
      name: 'Table Covers',
      items: [
        { size: '6ft Rectangular', quantities: [{ qty: 1, price: 190 }] },
        { size: '8ft Rectangular', quantities: [{ qty: 1, price: 210 }] },
        { size: '31" Round', quantities: [{ qty: 1, price: 159 }] },
        { size: '36" Round', quantities: [{ qty: 1, price: 179 }] },
        { size: '48" Round', quantities: [{ qty: 1, price: 209 }] },
        { size: '60" Round', quantities: [{ qty: 1, price: 225 }] },
      ],
      addOns: [],
    },
    {
      name: 'Retractable Banners',
      items: [
        { size: 'Economy (33"×78")', quantities: [{ qty: 1, price: 89 }, { qty: 2, price: 80 }, { qty: 6, price: 70 }] },
        { size: 'Standard (33"×81")', quantities: [{ qty: 1, price: 129 }, { qty: 2, price: 109 }, { qty: 6, price: 95 }] },
        { size: 'Premium (36"×85")', quantities: [{ qty: 1, price: 169 }, { qty: 2, price: 145 }, { qty: 6, price: 125 }] },
        { size: 'Wide (47"×85")', quantities: [{ qty: 1, price: 229 }, { qty: 2, price: 199 }, { qty: 6, price: 175 }] },
      ],
      addOns: [
        { name: 'Double-Sided', type: 'flat', value: 50 },
        { name: 'Outdoor Base', type: 'flat', value: 40 },
        { name: 'Travel Case', type: 'flat', value: 25 },
      ],
    },
    {
      name: 'Business Cards',
      items: [
        { size: 'Standard (3.5"×2")', quantities: [{ qty: 250, price: 49 }, { qty: 500, price: 79 }, { qty: 1000, price: 129 }] },
        { size: 'Square (2.5"×2.5")', quantities: [{ qty: 250, price: 59 }, { qty: 500, price: 89 }, { qty: 1000, price: 149 }] },
        { size: 'Mini (3"×1")', quantities: [{ qty: 250, price: 39 }, { qty: 500, price: 59 }, { qty: 1000, price: 99 }] },
      ],
      addOns: [
        { name: 'Soft-Touch', type: 'flat', value: 15 },
        { name: 'Spot UV', type: 'flat', value: 25 },
        { name: 'Foil Stamping', type: 'flat', value: 35 },
        { name: 'Rounded Corners', type: 'flat', value: 10 },
      ],
    },
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
      if (!parsed.products) parsed.products = defaultPricing.products
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
