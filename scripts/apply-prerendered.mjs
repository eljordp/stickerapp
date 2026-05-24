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

function patchHtml(html) {
  // Strip every existing /assets/*.js script + /assets/*.css link.
  html = html.replace(/<script[^>]+src="\/assets\/[^"]+\.js"[^>]*><\/script>\s*/g, '')
  html = html.replace(/<link[^>]+href="\/assets\/[^"]+\.css"[^>]*>\s*/g, '')
  // Inject the fresh ones right before </head>.
  html = html.replace(/<\/head>/i, `    ${freshTags}\n  </head>`)
  return html
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

await walk(SRC, DEST)
console.log('[apply-prerendered] copied prerendered/ -> dist/ with refreshed asset tags')
