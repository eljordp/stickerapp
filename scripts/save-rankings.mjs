// Persist a weekly SEO ranking snapshot into Supabase `seo_rankings`.
// Fed by the local `tss-seo-rank-monitor` Codex automation; displayed in the
// admin "SEO Rankings" tab (it auto-compares each snapshot to the baseline).
//
// Usage:
//   node scripts/save-rankings.mjs <path-to-json>   (or pipe JSON via stdin)
//
// JSON shape — an array of verified exact-SERP observations:
//   { query, city?, device?, rank?, ranking_url?, local_pack?, serp_feature?, source?, notes }
//   rank: integer position, or null/omitted = "not ranking" (not in top 20).
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadCreds() {
  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  let key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    try {
      for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) {
        const m = line.match(/^(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)=(.*)$/)
        if (!m) continue
        const val = m[2].trim().replace(/^["']|["']$/g, '')
        if (m[1].endsWith('URL')) url = url || val
        else key = key || val
      }
    } catch { /* no .env.local — rely on process.env */ }
  }
  return { url, key }
}

const DRY_RUN = process.argv.includes('--dry-run')

function readRows() {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--'))
  const raw = file ? readFileSync(file, 'utf8') : readFileSync(0, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('Expected a JSON array of ranking rows')
  const checkedAt = new Date().toISOString()
  const rows = data
    .map((r, index) => ({
      inputIndex: index,
      query: String(r.query || '').trim(),
      city: r.city ?? null,
      device: r.device || 'desktop',
      rank: r.rank == null ? null : Number(r.rank),
      ranking_url: r.ranking_url ?? null,
      local_pack: !!r.local_pack,
      serp_feature: r.serp_feature ?? null,
      source: r.source || 'serp_exact',
      notes: r.notes ?? null,
      checked_at: checkedAt,
    }))
    .filter((r) => r.query)

  for (const row of rows) {
    if (!['desktop', 'mobile'].includes(row.device)) {
      throw new Error(`Row ${row.inputIndex + 1}: device must be desktop or mobile`)
    }
    if (row.rank != null && (!Number.isInteger(row.rank) || row.rank < 1 || row.rank > 20)) {
      throw new Error(`Row ${row.inputIndex + 1}: rank must be an integer from 1 to 20 or null`)
    }
    if (row.source === 'serp_exact' && !/^\[verified\]/i.test(String(row.notes || ''))) {
      throw new Error(`Row ${row.inputIndex + 1}: exact SERP rows require notes beginning with [verified]`)
    }
    if (/proxy|mirrored|placeholder|not independently verified/i.test(String(row.notes || ''))) {
      throw new Error(`Row ${row.inputIndex + 1}: proxy, mirrored, or placeholder observations cannot be stored as ranks`)
    }
  }

  return rows.map(({ inputIndex: _inputIndex, ...row }) => row)
}

const { url, key } = loadCreds()
if (!url || !key) {
  console.error('[save-rankings] missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

let rows
try {
  rows = readRows()
} catch (e) {
  console.error('[save-rankings] bad input:', e.message)
  process.exit(1)
}
if (rows.length === 0) {
  console.error('[save-rankings] no valid rows to insert')
  process.exit(1)
}

if (DRY_RUN) {
  console.log(`[save-rankings] DRY RUN — would insert ${rows.length} rows:`)
  console.log(JSON.stringify(rows, null, 2))
  process.exit(0)
}

const supabase = createClient(url, key)
const { error } = await supabase.from('seo_rankings').insert(rows)
if (error) {
  console.error('[save-rankings] insert failed:', error.message)
  process.exit(1)
}
console.log(`[save-rankings] inserted ${rows.length} rows (source=${rows[0].source}, checked_at=${rows[0].checked_at})`)
