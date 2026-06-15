import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function envValue(name) {
  const raw = process.env[name]
  if (!raw) return ''
  const trimmed = raw.trim()
  const quoted = trimmed.match(/^(['"])(.*)\1$/)
  return quoted ? quoted[2] : trimmed
}

export const ARTWORK_BUCKET = 'order-artwork'
const MAX_FILE_SIZE = 50 * 1024 * 1024
const SUPABASE_URL = envValue('SUPABASE_URL') || envValue('VITE_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = envValue('SUPABASE_SERVICE_ROLE_KEY') || envValue('SUPABASE_SECRET_KEY') || envValue('SUPABASE_SERVICE_KEY')
const ALLOWED_EXTENSIONS = new Set(['.ai', '.eps', '.gif', '.heic', '.jpeg', '.jpg', '.pdf', '.png', '.psd', '.svg', '.tif', '.tiff', '.webp'])

let supabaseAdmin
let bucketReady = false

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase storage environment is not configured.')
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return supabaseAdmin
}

function fileExtension(fileName) {
  const clean = String(fileName || '').toLowerCase().split('?')[0]
  const dot = clean.lastIndexOf('.')
  return dot >= 0 ? clean.slice(dot) : ''
}

export function cleanFileName(fileName) {
  const fallback = 'artwork-file'
  const base = String(fileName || fallback)
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
  return base || fallback
}

export function validateArtworkUpload({ fileName, size }) {
  const safeName = cleanFileName(fileName)
  const ext = fileExtension(safeName)
  const numericSize = Number(size)

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Unsupported artwork file type. Upload PNG, JPG, PDF, AI, EPS, SVG, PSD, TIFF, HEIC, or WebP.')
  }

  if (!Number.isFinite(numericSize) || numericSize <= 0) {
    throw new Error('Artwork file is empty or invalid.')
  }

  if (numericSize > MAX_FILE_SIZE) {
    throw new Error('Artwork file is too large. Please upload a file under 50 MB or contact us directly.')
  }

  return { safeName, size: numericSize }
}

export function artworkPath(fileName) {
  const today = new Date().toISOString().slice(0, 10)
  return `pending/${today}/${randomUUID()}-${cleanFileName(fileName)}`
}

export async function ensureArtworkBucket() {
  if (bucketReady) return

  const admin = getAdminClient()
  const { error: getError } = await admin.storage.getBucket(ARTWORK_BUCKET)

  if (!getError) {
    bucketReady = true
    return
  }

  const { error: createError } = await admin.storage.createBucket(ARTWORK_BUCKET, {
    public: false,
    fileSizeLimit: MAX_FILE_SIZE,
  })

  if (createError && !createError.message?.toLowerCase().includes('already exists')) {
    throw createError
  }

  bucketReady = true
}

export async function createArtworkUpload({ fileName, contentType, size }) {
  const { safeName } = validateArtworkUpload({ fileName, size })
  await ensureArtworkBucket()

  const path = artworkPath(safeName)
  const admin = getAdminClient()
  const { data, error } = await admin.storage.from(ARTWORK_BUCKET).createSignedUploadUrl(path)

  if (error) throw error

  return {
    bucket: ARTWORK_BUCKET,
    path,
    token: data.token,
    fileName: safeName,
    contentType: contentType || 'application/octet-stream',
    maxBytes: MAX_FILE_SIZE,
  }
}

export async function createArtworkDownloadUrl(path, fileName) {
  await ensureArtworkBucket()

  const cleanPath = String(path || '').trim()
  if (!cleanPath.startsWith('pending/')) throw new Error('Invalid artwork path.')

  const admin = getAdminClient()
  const { data, error } = await admin.storage
    .from(ARTWORK_BUCKET)
    .createSignedUrl(cleanPath, 60 * 10, { download: cleanFileName(fileName) })

  if (error) throw error
  return data.signedUrl
}
