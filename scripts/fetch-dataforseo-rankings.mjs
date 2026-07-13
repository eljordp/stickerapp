// Fetch neutral, geolocated Google organic rankings from DataForSEO.
// This script is fail-closed: it only makes paid API calls with --execute.
//
// Required environment variables:
//   DATAFORSEO_LOGIN
//   DATAFORSEO_PASSWORD
//
// Usage:
//   node scripts/fetch-dataforseo-rankings.mjs              # plan only, no API calls
//   node scripts/fetch-dataforseo-rankings.mjs --execute    # 26 paid checks
//
// Output is compatible with scripts/save-rankings.mjs.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const QUERY = 'bay area stickers'
const TARGET = 'tssprint.com*'
const OUTPUT = '/tmp/tss-rankings.json'
const DEPTH = 20

const CITIES = [
  'Hayward',
  'Oakland',
  'San Leandro',
  'Fremont',
  'Union City',
  'Castro Valley',
  'San Jose',
  'San Francisco',
  'Berkeley',
  'Alameda',
  'Walnut Creek',
  'Dublin',
  'Pleasanton',
]
const DEVICES = ['desktop', 'mobile']

const checks = CITIES.flatMap(city => DEVICES.map(device => ({ city, device })))
const execute = process.argv.includes('--execute')

if (!execute) {
  console.log(`[dataforseo-rankings] PLAN ONLY — ${checks.length} paid checks would run`)
  console.log(JSON.stringify({ query: QUERY, target: TARGET, depth: DEPTH, checks }, null, 2))
  console.log('[dataforseo-rankings] Add --execute only after credentials and spend are approved.')
  process.exit(0)
}

function credential(name) {
  if (process.env[name]) return process.env[name]
  try {
    const line = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
      .split('\n')
      .find(candidate => candidate.startsWith(`${name}=`))
    return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, '') || null
  } catch {
    return null
  }
}

const login = credential('DATAFORSEO_LOGIN')
const password = credential('DATAFORSEO_PASSWORD')
if (!login || !password) {
  console.error('[dataforseo-rankings] missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD; no calls made')
  process.exit(1)
}

const authorization = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`

async function fetchCheck({ city, device }) {
  const locationName = `${city},California,United States`
  const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: {
      authorization,
      'content-type': 'application/json',
    },
    body: JSON.stringify([{
      keyword: QUERY,
      location_name: locationName,
      language_code: 'en',
      device,
      os: device === 'mobile' ? 'android' : 'windows',
      depth: DEPTH,
      target: TARGET,
    }]),
  })

  const body = await response.json().catch(() => null)
  if (!response.ok || !body || body.status_code !== 20000) {
    throw new Error(`${city}/${device}: HTTP ${response.status}; ${body?.status_message || 'invalid response'}`)
  }

  const task = body.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(`${city}/${device}: ${task?.status_message || 'task failed'}`)
  }

  const result = task.result?.[0]
  const organic = (result?.items || [])
    .filter(item => item.type === 'organic' && item.url)
    .sort((a, b) => (a.rank_group || 9999) - (b.rank_group || 9999))[0]
  const rank = Number.isInteger(organic?.rank_group) ? organic.rank_group : null

  return {
    row: {
      query: QUERY,
      city,
      device,
      rank,
      ranking_url: organic?.url || null,
      local_pack: false,
      serp_feature: rank == null ? 'none' : 'organic',
      notes: `[verified] DataForSEO Google organic live/advanced; location=${locationName}; device=${device}; depth=${DEPTH}; checked=${result?.datetime || new Date().toISOString()}`,
    },
    cost: Number(task.cost || 0),
  }
}

const rows = []
let totalCost = 0
for (const check of checks) {
  const { row, cost } = await fetchCheck(check)
  rows.push(row)
  totalCost += cost
  console.log(`[dataforseo-rankings] ${row.city}/${row.device}: ${row.rank == null ? 'not top 20' : `#${row.rank}`}`)
}

writeFileSync(OUTPUT, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`[dataforseo-rankings] wrote ${rows.length} verified rows to ${OUTPUT}; API-reported cost $${totalCost.toFixed(4)}`)
