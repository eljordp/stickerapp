import dieCutImage from '@/assets/projects/stickers-die-cut-stack.jpg'
import holographicImage from '@/assets/projects/stickers-holographic.jpg'
import sheetImage from '@/assets/projects/stickers-sheet.jpg'
import rollImage from '@/assets/projects/stickers-roll.jpg'
import labelsImage from '@/assets/stickers/custom-labels-showcase.png'

export type StickerSupportPageConfig = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  eyebrow: string
  heroTitle: string
  heroSubtitle: string
  image: string
  imageAlt: string
  serviceType: string
  intro: string
  bestFor: string[]
  details: string[]
  faqs: { q: string; a: string }[]
}

export const stickerSupportPages: StickerSupportPageConfig[] = [
  {
    slug: 'die-cut-stickers',
    title: 'Die-Cut Stickers',
    metaTitle: 'Die-Cut Stickers Bay Area | The Sticker Smith',
    metaDescription:
      'Custom die-cut stickers printed in Hayward for Bay Area brands, artists, shops, and events. Waterproof vinyl, clean cut lines, free digital proof, and local pickup.',
    eyebrow: 'Custom Die-Cut Stickers',
    heroTitle: 'Die-cut stickers for Bay Area brands.',
    heroSubtitle:
      'Any-shape waterproof vinyl stickers with clean cut lines, bold color, and a proof before production.',
    image: dieCutImage,
    imageAlt: 'Stack of custom die-cut stickers printed by The Sticker Smith',
    serviceType: 'Bay Area die-cut sticker printing',
    intro:
      'Die-cut stickers are the go-to format when the shape of the sticker matters as much as the artwork. We contour cut around logos, characters, badge shapes, product graphics, and event art so the finished piece feels custom instead of generic.',
    bestFor: [
      'Logo stickers and brand drops',
      'Artist merch and character art',
      'Packaging inserts and launch promos',
      'Outdoor waterproof vinyl stickers',
    ],
    details: [
      'White border, full bleed, and custom contour-cut options',
      'Matte, gloss, holographic, clear, and specialty vinyl options',
      'Proof checks for cut path, bleed, sizing, and small text before printing',
    ],
    faqs: [
      {
        q: 'Can you cut around any shape?',
        a: 'Yes, as long as the artwork has enough clean edge space for a safe cut path. We set up the cut line during proofing and send it for approval before printing.',
      },
      {
        q: 'Are die-cut stickers waterproof?',
        a: 'Our standard vinyl die-cut stickers are waterproof and built for indoor or outdoor use. Lamination and material choice affect final durability.',
      },
    ],
  },
  {
    slug: 'sticker-sheets',
    title: 'Sticker Sheets',
    metaTitle: 'Custom Sticker Sheets Bay Area | The Sticker Smith',
    metaDescription:
      'Custom sticker sheets printed in Hayward for Bay Area creators, brands, events, schools, and packaging. Multiple designs on one sheet with free digital proof.',
    eyebrow: 'Custom Sticker Sheets',
    heroTitle: 'Sticker sheets with multiple designs on one print.',
    heroSubtitle:
      'Kiss-cut sheets for merch drops, packaging, events, schools, and creator packs.',
    image: sheetImage,
    imageAlt: 'Custom sticker sheet printed by The Sticker Smith',
    serviceType: 'Bay Area custom sticker sheet printing',
    intro:
      'Sticker sheets are best when you need several shapes, small icons, labels, or mini designs together. They keep your stickers organized, feel more premium as a handout, and work well for events, packaging, and retail merch.',
    bestFor: [
      'Creator and artist sticker packs',
      'Brand icon sheets',
      'School, event, and club giveaways',
      'Packaging labels grouped by product line',
    ],
    details: [
      'Multiple kiss-cut stickers on one backing sheet',
      'Custom sheet sizes for handouts, retail, and inserts',
      'Proofed for spacing, peelability, cut lines, and small-detail legibility',
    ],
    faqs: [
      {
        q: 'How many stickers can fit on one sheet?',
        a: 'It depends on the final sheet size and sticker sizes. We can help lay out the sheet so each sticker has enough spacing to peel cleanly.',
      },
      {
        q: 'Can each sticker on the sheet be a different shape?',
        a: 'Yes. Each piece can have its own kiss-cut path, so sheets can mix circles, icons, characters, labels, and custom shapes.',
      },
    ],
  },
  {
    slug: 'roll-labels',
    title: 'Roll Labels',
    metaTitle: 'Custom Roll Labels Bay Area | The Sticker Smith',
    metaDescription:
      'Custom roll labels for Bay Area product packaging, bottles, jars, bags, and retail goods. Printed in Hayward with proofing and local pickup.',
    eyebrow: 'Custom Roll Labels',
    heroTitle: 'Roll labels for packaging that needs to move fast.',
    heroSubtitle:
      'Clean product labels on rolls for bottles, jars, bags, boxes, and retail packaging.',
    image: rollImage,
    imageAlt: 'Custom roll labels printed for product packaging',
    serviceType: 'Bay Area custom roll label printing',
    intro:
      'Roll labels are built for production workflows: fast peeling, consistent placement, and clean presentation across product runs. They are ideal for packaging teams that need labels ready for bottles, jars, pouches, mailers, and retail goods.',
    bestFor: [
      'Food, beverage, and retail packaging',
      'Bottle, jar, and pouch labels',
      'Batch labels and reorderable product lines',
      'Brands applying labels by hand or machine',
    ],
    details: [
      'Matte, gloss, clear, and specialty label materials',
      'Sized for containers, bags, boxes, and product wraps',
      'Proofed for barcode readability, ingredient text, and placement needs',
    ],
    faqs: [
      {
        q: 'Can roll labels be used on bottles and jars?',
        a: 'Yes. We size labels around your container dimensions and recommend materials based on whether the product sees moisture, cold storage, or heavy handling.',
      },
      {
        q: 'Do you help with label sizing?',
        a: 'Yes. Send the container size or a photo with dimensions and we can recommend a label size that fits the product cleanly.',
      },
    ],
  },
  {
    slug: 'holographic-stickers',
    title: 'Holographic Stickers',
    metaTitle: 'Holographic Stickers Bay Area | The Sticker Smith',
    metaDescription:
      'Holographic stickers printed in Hayward for Bay Area artists, brands, drops, packaging, and events. Rainbow vinyl effect, waterproof options, and free proof.',
    eyebrow: 'Holographic Stickers',
    heroTitle: 'Holographic stickers that catch light from every angle.',
    heroSubtitle:
      'Rainbow-shift vinyl for merch drops, packaging, events, and high-impact brand stickers.',
    image: holographicImage,
    imageAlt: 'Holographic custom stickers printed by The Sticker Smith',
    serviceType: 'Bay Area holographic sticker printing',
    intro:
      'Holographic stickers turn simple art into a premium piece. They work especially well for drops, cannabis and retail packaging, music merch, artists, and anything where the sticker needs to feel collectible.',
    bestFor: [
      'Limited drops and merch launches',
      'Premium packaging stickers',
      'Artist stickers and collectible designs',
      'Event giveaways with extra shine',
    ],
    details: [
      'Holographic vinyl with custom cut shapes',
      'White ink and artwork setup guidance for stronger contrast',
      'Proofing to make sure dark art, small text, and fine lines stay readable',
    ],
    faqs: [
      {
        q: 'Will all colors look holographic?',
        a: 'The holographic effect shows through transparent or lighter parts of the artwork. We can set up white ink or backing areas when you need certain colors to stay solid.',
      },
      {
        q: 'Are holographic stickers durable?',
        a: 'Yes. Material and laminate choices affect final durability, but holographic stickers can be made for indoor, packaging, or outdoor use.',
      },
    ],
  },
  {
    slug: 'custom-labels',
    title: 'Custom Labels',
    metaTitle: 'Custom Labels Bay Area | The Sticker Smith',
    metaDescription:
      'Custom labels for Bay Area brands, packaging, bottles, jars, mylar bags, boxes, and retail products. Printed in Hayward with proofing and pickup.',
    eyebrow: 'Custom Product Labels',
    heroTitle: 'Custom labels for products, packaging, and retail shelves.',
    heroSubtitle:
      'Labels for bottles, jars, boxes, bags, mylar, and product lines that need to look finished.',
    image: labelsImage,
    imageAlt: 'Custom product labels and packaging labels by The Sticker Smith',
    serviceType: 'Bay Area custom label printing',
    intro:
      'Custom labels are where print quality meets customer trust. We help Bay Area brands turn packaging into something that looks ready for retail, markets, pop-ups, deliveries, and wholesale accounts.',
    bestFor: [
      'Product labels and packaging stickers',
      'Bottle, jar, and pouch labels',
      'Mylar bag labels and retail packaging',
      'Small-batch launches and reorders',
    ],
    details: [
      'Vinyl, paper, clear, matte, gloss, and specialty label materials',
      'Short-run and reorder-friendly production',
      'Proof checks for compliance text, ingredients, QR codes, barcodes, and sizing',
    ],
    faqs: [
      {
        q: 'Can you print labels for mylar bags and packaging?',
        a: 'Yes. We print mylar labels, product labels, and packaging stickers, and can also help with full custom mylar packaging when labels are not enough.',
      },
      {
        q: 'Can you check QR codes and barcodes before printing?',
        a: 'Yes. We check that codes are readable during proofing, but final compliance requirements are still the customer’s responsibility.',
      },
    ],
  },
]

export const stickerSupportPageBySlug = Object.fromEntries(
  stickerSupportPages.map((page) => [page.slug, page]),
) as Record<string, StickerSupportPageConfig>
