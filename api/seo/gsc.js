import { gscConfig, getAccessToken, querySearchAnalytics, isoDate } from '../../server/gsc-api.js'

// Merge queries that are the same words in a different order into one row
// (e.g. "custom stickers bay area" + "bay area custom stickers"). Stats are
// summed; position is impression-weighted; the highest-impression variant is
// shown as the label.
function groupByWordSet(rows) {
  const groups = new Map()
  for (const r of rows) {
    const key = r.query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ')
    if (!key) continue
    const g = groups.get(key) || { best: r, variants: 0, clicks: 0, impressions: 0, posWeighted: 0 }
    if (r.impressions > g.best.impressions) g.best = r
    g.variants += 1
    g.clicks += r.clicks
    g.impressions += r.impressions
    g.posWeighted += r.position * r.impressions
    groups.set(key, g)
  }
  return [...groups.values()]
    .map(g => ({
      query: g.best.query,
      variants: g.variants,
      clicks: g.clicks,
      impressions: g.impressions,
      ctr: g.impressions ? g.clicks / g.impressions : 0,
      position: g.impressions ? g.posWeighted / g.impressions : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, 25)
}

// Returns top Search Console queries (last 28 days) with clicks, impressions,
// CTR, and average position — grouped so different word orders count as one.
export default async function handler(req, res) {
  const config = gscConfig()
  if (!config) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ configured: false })
  }

  try {
    const token = await getAccessToken(config)
    const data = await querySearchAnalytics(token, config.siteUrl, {
      startDate: isoDate(28),
      endDate: isoDate(1),
      dimensions: ['query'],
      rowLimit: 250,
      orderBy: [{ field: 'clicks', descending: true }],
    })

    const rows = (data.rows || []).map(r => ({
      query: r.keys?.[0] || '',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }))

    // Cache only successful responses so a transient error never sticks.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({
      configured: true,
      range: { start: isoDate(28), end: isoDate(1) },
      grouped: groupByWordSet(rows),
      rows: rows.slice(0, 25),
    })
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ configured: true, error: error.message || 'Search Console request failed' })
  }
}
