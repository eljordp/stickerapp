// Copy committed prerendered HTML into dist/ after vite build.
// Used by Vercel (which can't run puppeteer in its build env).
// The prerendered/ folder is generated locally by scripts/prerender.mjs.

import { cp, stat } from 'node:fs/promises'
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

await cp(SRC, DEST, { recursive: true, force: true })
console.log('[apply-prerendered] copied prerendered/ -> dist/')
