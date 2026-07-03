// Copy committed prerendered HTML into dist/ after vite build.
// Used by Vercel (which can't run puppeteer in its build env).
// The prerendered/ folder is generated locally by scripts/prerender.mjs.
//
// IMPORTANT: vite generates new content-hashed asset filenames on every
// build, so the script/link tags inside prerendered HTML go stale the
// moment vite rebuilds. This script rewrites the asset references in
// every prerendered HTML file to match the fresh vite build output.

import { cp, stat, readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_SHELL_ROUTES, appShellHtmlForRoute } from './app-shell-meta.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'prerendered')
const DEST = path.join(ROOT, 'dist')
try {
  await stat(SRC)
} catch {
  console.warn('[apply-prerendered] no prerendered/ folder — skipping (run `npm run prerender` locally before pushing)')
  process.exit(0)
}

// Pull the fresh asset tags from the just-built dist/index.html so we can
// stamp them into every prerendered HTML.
const freshIndex = await readFile(path.join(DEST, 'index.html'), 'utf8')

function extractAll(html, regex) {
  const out = []
  let m
  while ((m = regex.exec(html)) !== null) out.push(m[0])
  return out
}

// All vite-emitted asset references in the fresh build's <head>.
const freshScripts = extractAll(freshIndex, /<script[^>]+src="\/assets\/[^"]+\.js"[^>]*><\/script>/g)
const freshStyles = extractAll(freshIndex, /<link[^>]+href="\/assets\/[^"]+\.css"[^>]*>/g)
const freshTags = [...freshScripts, ...freshStyles].join('\n    ')

if (freshScripts.length === 0) {
  console.error('[apply-prerendered] no <script src="/assets/*.js"> found in fresh dist/index.html — aborting')
  process.exit(1)
}

console.log(`[apply-prerendered] fresh build references ${freshScripts.length} JS + ${freshStyles.length} CSS asset(s)`)

// Map of base name ("stickers-roll.jpg") -> current hashed filename
// ("stickers-roll-Ch1ndUCG.jpg") from the fresh build. Vite re-hashes assets
// on every build, so prerendered HTML's baked-in image/media/font references go
// stale whenever a source file changes. We rewrite them to the fresh names so
// the build self-heals instead of failing the asset-existence check.
const HASH_RE = /^(.+)-[A-Za-z0-9_-]{8}(\.[A-Za-z0-9]+)$/
async function buildAssetMap() {
  const map = new Map()
  let files = []
  try {
    files = await readdir(path.join(DEST, 'assets'))
  } catch {
    return map
  }
  for (const f of files) {
    const m = f.match(HASH_RE)
    if (m) map.set(m[1] + m[2], f)
  }
  return map
}
const assetMap = await buildAssetMap()

function patchHtml(html) {
  // Strip every existing /assets/*.js script + /assets/*.css link.
  html = html.replace(/<script[^>]+src="\/assets\/[^"]+\.js"[^>]*><\/script>\s*/g, '')
  html = html.replace(/<link[^>]+href="\/assets\/[^"]+\.css"[^>]*>\s*/g, '')
  // Inject the fresh ones right before </head>.
  html = html.replace(/<\/head>/i, `    ${freshTags}\n  </head>`)
  // Rewrite any remaining hashed asset references (images, fonts, media) to the
  // fresh build's filenames, matched by base name. Unknown refs pass through.
  html = html.replace(/\/assets\/([A-Za-z0-9._-]+)/g, (full, file) => {
    const m = file.match(HASH_RE)
    if (!m) return full
    const fresh = assetMap.get(m[1] + m[2])
    return fresh ? `/assets/${fresh}` : full
  })
  return html
}

async function assertReferencedAssetsExist(dir) {
  const missing = []

  async function scan(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const file = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await scan(file)
        continue
      }
      if (!entry.name.endsWith('.html')) continue

      const html = await readFile(file, 'utf8')
      const assets = new Set()
      for (const match of html.matchAll(/["'(](\/assets\/[^"'()?#]+\.[a-z0-9]+)(?:[?#][^"'()]*)?["')]/gi)) {
        assets.add(match[1])
      }

      for (const asset of assets) {
        try {
          await stat(path.join(DEST, asset))
        } catch {
          missing.push(`${path.relative(DEST, file)} -> ${asset}`)
        }
      }
    }
  }

  await scan(dir)

  if (missing.length > 0) {
    console.error('[apply-prerendered] prerendered HTML references missing built assets:')
    missing.slice(0, 30).forEach((item) => console.error(`  - ${item}`))
    if (missing.length > 30) console.error(`  ...and ${missing.length - 30} more`)
    process.exit(1)
  }
}

async function walk(srcDir, destDir) {
  await mkdir(destDir, { recursive: true })
  const entries = await readdir(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const s = path.join(srcDir, entry.name)
    const d = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      await walk(s, d)
    } else if (entry.name.endsWith('.html')) {
      const original = await readFile(s, 'utf8')
      const patched = patchHtml(original)
      await writeFile(d, patched, 'utf8')
    } else {
      await cp(s, d, { force: true })
    }
  }
}

async function writeAppShellAliases(html) {
  for (const route of APP_SHELL_ROUTES) {
    const routeHtml = appShellHtmlForRoute(html, route)
    const sub = route.replace(/^\//, '')
    const outDir = path.join(DEST, sub)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), routeHtml, 'utf8')

    const aliasFile = path.join(DEST, `${sub}.html`)
    await mkdir(path.dirname(aliasFile), { recursive: true })
    await writeFile(aliasFile, routeHtml, 'utf8')
  }
}

await walk(SRC, DEST)
await writeAppShellAliases(freshIndex)
await assertReferencedAssetsExist(DEST)
console.log('[apply-prerendered] copied prerendered/ -> dist/ with refreshed asset tags and app-shell route aliases')
