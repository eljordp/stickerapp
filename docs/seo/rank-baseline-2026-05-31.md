# SEO Rank Baseline - 2026-05-31

Baseline captured in Chrome using Google search with `num=20`, `pws=0`, `hl=en`, `gl=us`.
Rank can vary by searcher location, personalization, and device. Use this as the weekly comparison baseline, not an absolute universal rank.

## Ranking Snapshot

| Query | TSS Organic Rank | Local/GBP Visibility | Notes |
| --- | ---: | --- | --- |
| bay area stickers | Not top 20 | Not visible | Results are mostly merch/product marketplaces, not printers. This query may need content that clarifies custom printing intent. |
| bay area custom stickers | 8 | Visible in result text | Ranking URL was homepage, not `/stickers`. Opportunity: move relevance to `/stickers` and support pages. |
| custom stickers bay area | Not top 20 | Not visible | Competitors: Davis Sign Co, FedEx, DecalSF, SF Bay Signs, Urban Sticker, Minuteman. |
| sticker printing bay area | Not top 20 | Not visible | Competitors: Reddit, Davis Sign Co, Urban Sticker, SF Bay Signs, FedEx, Minuteman, DecalSF. |
| custom stickers hayward | 1 | Visible in local pack | Strong local query. TSS also appears in local/Places. |
| sticker printing hayward | 1 | Visible in local pack | Strong local query. TSS also appears in local/Places. |
| custom labels bay area | Not top 20 | Not visible | Competitors: AAA Label, Minuteman, Davis Sign Co, Sidco, AlphaGraphics, DecalSF. |
| die cut stickers bay area | Not top 20 | Not visible | Competitors: Davis Sign Co, Minuteman, Banner Printing SF, SF Bay Signs, Jukebox, UPrinting. |

## Crawl/Indexing Finding

Public terminal requests to `https://tssprint.com/stickers`, `https://www.tssprint.com/stickers`, and `https://tssprint.vercel.app/stickers` returned:

- `403`
- `x-vercel-mitigated: deny`

The same happened with a Googlebot user agent. Vercel dashboard showed:

- Firewall active
- Bot Protection active
- 1 custom firewall rule

This is the top crawl risk to verify in Google Search Console URL Inspection. If Google cannot fetch `/stickers`, fix Vercel Firewall/Bot Protection before doing more content work.

## Crawl/Indexing Fix

Fixed after the baseline on 2026-05-31:

- Disabled Vercel `bot_protection` managed rule, which was denying non-browser crawlers.
- Kept Vercel firewall enabled.
- Kept the custom scanner-probe deny rule active for paths like `/wp-admin`, `/.env`, and `/xmlrpc.php`.
- Public `curl -I -L https://tssprint.com/stickers` now returns `HTTP/2 200`.
- Googlebot user-agent `curl` for `/stickers` now returns `HTTP/2 200`.
- Public `https://tssprint.com/sitemap.xml` now exposes `/stickers` plus the new support pages.

Still verify `/stickers` in Google Search Console Live URL Inspection, then request indexing.

## Work Added After Baseline

- Strengthened `/stickers` metadata and schema.
- Added `/stickers` FAQ content.
- Requested indexing for `/stickers` in Google Search Console. At request time, GSC reported `URL is not on Google` and `Discovered - currently not indexed`.
- Added product-intent support pages:
  - `/die-cut-stickers`
  - `/sticker-sheets`
  - `/roll-labels`
  - `/holographic-stickers`
  - `/custom-labels`
- Added support pages to sitemap and prerender list.
- Added internal links from `/stickers` and footer to support pages.
- Added real sticker and packaging project proof directly to `/stickers`.
- Requested indexing for `/services/business-signage` and `/services/event-displays`. At request time, GSC reported both as `URL is not on Google` and `URL is unknown to Google`.
- Strengthened `/services/business-signage` around Hayward and Bay Area business signage intent.
- Strengthened `/services/event-displays` around Bay Area event displays, canopies, table covers, flags, and booth materials.

## Next Tracking Goals

1. Get `/stickers` indexed and ranking for `bay area custom stickers`.
2. Move ranking URL from homepage to `/stickers`.
3. Get first visibility for `custom stickers bay area`, `sticker printing bay area`, `custom labels bay area`, and `die cut stickers bay area`.
4. Get `/services/business-signage` indexed and visible for `business signage hayward`, `storefront signs hayward`, and `a frame signs hayward`.
5. Get `/services/event-displays` indexed and visible for `event displays bay area`, `custom canopy bay area`, and `table covers bay area`.
6. Keep Hayward sticker rankings at #1 while expanding Bay Area visibility.
