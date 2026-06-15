import { gscConfig, getAccessToken, querySearchAnalytics, isoDate } from '../../server/gsc-api.js'

// Returns top Search Console queries (last 28 days) with clicks, impressions,
// CTR, and average Google position. Degrades gracefully when not configured.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  const config = gscConfig()
  if (!config) {
    return res.status(200).json({ configured: false })
  }

  try {
    const token = await getAccessToken(config)
    const data = await querySearchAnalytics(token, config.siteUrl, {
      startDate: isoDate(28),
      endDate: isoDate(1),
      dimensions: ['query'],
      rowLimit: 25,
      orderBy: [{ field: 'clicks', descending: true }],
    })

    const rows = (data.rows || []).map(r => ({
      query: r.keys?.[0] || '',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }))

    return res.status(200).json({
      configured: true,
      range: { start: isoDate(28), end: isoDate(1) },
      rows,
    })
  } catch (error) {
    return res.status(200).json({ configured: true, error: error.message || 'Search Console request failed' })
  }
}
