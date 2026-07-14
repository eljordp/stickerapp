// Prerender public marketing routes into static HTML for SEO.
// Crawls the built SPA via `vite preview` with puppeteer, then writes
// the rendered HTML to dist/<route>/index.html so Vercel serves static
// content to Googlebot. The SPA still rehydrates client-side.
//
// Notes:
// - Stages output in memory and writes to disk only at the end. This
//   keeps dist/index.html as the empty shell while routes are processed,
//   so vite preview's SPA fallback works uniformly.
// - Skips PrinterIntro via a window flag set before app boot.
// - Waits for route-specific content (page <title>) before snapshotting.

import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { APP_SHELL_ROUTES, appShellHtmlForRoute } from './app-shell-meta.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
// Mirror of the prerender output that is committed to git so Vercel
// (which can't run puppeteer in its build env) can copy it into dist/.
const PRERENDERED = path.join(ROOT, 'prerendered')
const CITY_SLUGS = [
  'hayward',
  'oakland',
  'san-leandro',
  'castro-valley',
  'union-city',
  'fremont',
  'san-lorenzo',
  'newark',
]

// Per-route titles — used both as a content-ready signal during prerender
// and as a sanity check. Must match what App.tsx HeadManager sets.
const ROUTE_TITLES = {
  '/': 'The Sticker Smith | Custom Stickers, Labels & Printing - Bay Area',
  '/stickers': 'Custom Stickers Bay Area | Die-Cut, Labels & Fast Proofs',
  '/die-cut-stickers': 'Die-Cut Stickers Bay Area | Waterproof Vinyl Stickers',
  '/sticker-sheets': 'Custom Sticker Sheets Bay Area | The Sticker Smith',
  '/roll-labels': 'Custom Roll Labels Hayward & Bay Area | The Sticker Smith',
  '/holographic-stickers': 'Holographic Stickers Bay Area | The Sticker Smith',
  '/custom-labels': 'Custom Labels Bay Area | Fast Proofs & Hayward Pickup',
  '/services': 'Print & Branding Services | The Sticker Smith',
  '/services/vehicle-graphics': 'Vehicle Graphics Hayward & Bay Area | The Sticker Smith',
  '/services/business-signage': 'Business Signs Hayward | Storefront Signs & A-Frames',
  '/services/event-displays': 'Custom Canopies Hayward & Bay Area | The Sticker Smith',
  '/services/business-print': 'Custom Printing in Hayward | Business Cards, Flyers & Stationery | The Sticker Smith',
  '/services/window-film': 'Window Film, Tint & Graphics | The Sticker Smith',
  '/mylar': 'Custom Mylar Bags Hayward & Bay Area | The Sticker Smith',
  '/projects': 'Print Projects & Portfolio | The Sticker Smith',
  '/about': 'About The Sticker Smith | Bay Area Print Studio',
  '/contact': 'Contact & Free Quote | The Sticker Smith',
  '/quote': 'Fast Print Quote | Stickers, Signs, Wraps & Event Displays',
  '/referral': 'Referral Program | The Sticker Smith',
  '/hayward': 'Custom Stickers & Printing in Hayward, CA | The Sticker Smith',
  '/oakland': 'Custom Stickers & Print in Oakland, CA | The Sticker Smith',
  '/san-leandro': 'Custom Stickers, Signage & Print in San Leandro | The Sticker Smith',
  '/castro-valley': 'Castro Valley Signage, Window Film & Print | The Sticker Smith',
  '/union-city': 'Vehicle Graphics, Banners & Signage in Union City | The Sticker Smith',
  '/fremont': 'Fremont Custom Stickers, Signage & Vehicle Wraps | The Sticker Smith',
  '/san-lorenzo': 'Custom Stickers & Local Print in San Lorenzo | The Sticker Smith',
  '/newark': 'Newark Retail Signage, Labels & Vehicle Graphics | The Sticker Smith',
}

const ROUTES = Object.keys(ROUTE_TITLES)

function waitForHttp(url, expectedSignal, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryFetch = async () => {
      try {
        const res = await fetch(url)
        const body = await res.text()
        if (res.ok && body.includes(expectedSignal)) return resolve()
      } catch {}
      if (Date.now() - start > timeoutMs) reject(new Error(`Timed out waiting for ${url}`))
      else setTimeout(tryFetch, 300)
    }
    tryFetch()
  })
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found. Run `vite build` first.')
    process.exit(1)
  }

  const appShellHtml = await readFile(path.join(DIST, 'index.html'), 'utf8')

  const port = 4179
  console.log(`[prerender] starting vite preview on :${port}`)
  const preview = spawn(
    'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  preview.stdout.on('data', (b) => process.stdout.write(`[preview] ${b}`))
  preview.stderr.on('data', (b) => process.stderr.write(`[preview] ${b}`))

  try {
    await waitForHttp(`http://127.0.0.1:${port}/`, 'The Sticker Smith')
    console.log('[prerender] vite preview ready')

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    // Stage rendered HTML in memory — only write to disk after all routes
    // are rendered. This guarantees dist/index.html stays as the empty
    // shell throughout the prerender run, so vite preview always falls
    // back to the SPA shell when serving an unknown route to puppeteer.
    const rendered = new Map()

    for (const route of ROUTES) {
      const expectedTitle = ROUTE_TITLES[route]
      // ?prerender=1 tells the SPA to skip the PrinterIntro overlay.
      const url = `http://127.0.0.1:${port}${route}?prerender=1`
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 900 })

      // Belt-and-suspenders: set a global flag before any app code runs.
      await page.evaluateOnNewDocument(() => {
        window.__prerender = true
      })

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

      // Wait until React has actually swapped the document title to the
      // route-specific one. That's our signal the route component mounted.
      try {
        await page.waitForFunction(
          (expected) => document.title === expected,
          { timeout: 15000 },
          expectedTitle,
        )
      } catch {
        console.warn(`[prerender] ${route}: title never became "${expectedTitle}" (got "${await page.title()}")`)
      }

      // Strip the prerender query string from the canonical/og:url tags
      // and any in-document links so the static HTML reflects clean URLs.
      await page.evaluate(() => {
        const clean = (v) => (v || '').replace(/[?&]prerender=1/, '')
        document.querySelectorAll('link[rel="canonical"]').forEach((el) => {
          if (el.href) el.href = clean(el.href)
        })
        document.querySelectorAll('meta[property="og:url"]').forEach((el) => {
          const v = el.getAttribute('content')
          if (v) el.setAttribute('content', clean(v))
        })
      })

      const html = await page.content()
      rendered.set(route, html)
      console.log(`[prerender] rendered ${route} (${html.length} bytes)`)
      await page.close()
    }

    await browser.close()

    // Write everything to disk now — to BOTH dist/ (for local testing)
    // AND prerendered/ (which is committed to git so Vercel can use it).
    for (const [route, html] of rendered) {
      const sub = route === '/' ? '' : route.replace(/^\//, '')
      for (const base of [DIST, PRERENDERED]) {
        const outDir = sub ? path.join(base, sub) : base
        await mkdir(outDir, { recursive: true })
        const outFile = path.join(outDir, 'index.html')
        await writeFile(outFile, html, 'utf8')

        // Also write clean-url aliases like dist/stickers.html and
        // dist/services/vehicle-graphics.html. Some static servers only
        // serve route/index.html for the trailing-slash URL, while our
        // sitemap/canonicals use no trailing slash. Vercel cleanUrls can
        // then serve /stickers directly from stickers.html.
        if (sub) {
          const aliasFile = path.join(base, `${sub}.html`)
          await mkdir(path.dirname(aliasFile), { recursive: true })
          await writeFile(aliasFile, html, 'utf8')
        }
      }
      console.log(`[prerender] wrote ${route}`)
    }

    for (const route of APP_SHELL_ROUTES) {
      const html = appShellHtmlForRoute(appShellHtml, route)
      const sub = route.replace(/^\//, '')
      for (const base of [DIST, PRERENDERED]) {
        const outDir = path.join(base, sub)
        await mkdir(outDir, { recursive: true })
        await writeFile(path.join(outDir, 'index.html'), html, 'utf8')

        const aliasFile = path.join(base, `${sub}.html`)
        await mkdir(path.dirname(aliasFile), { recursive: true })
        await writeFile(aliasFile, html, 'utf8')
      }
      console.log(`[prerender] wrote app shell ${route}`)
    }

    console.log(`[prerender] done. ${ROUTES.length} routes rendered.`)
  } finally {
    preview.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
