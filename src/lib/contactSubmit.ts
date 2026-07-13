import { sendContactEmail } from './email'
import { supabase } from './supabase'
import { getAnalyticsIdentity, trackLeadSubmission } from './analytics'

export type ContactRequest = {
  name: string
  email: string
  phone?: string
  service?: string
  message: string
  subject: string
  source?: string
  subscribe?: boolean
  tags?: string[]
}

export type ContactSubmitResult = {
  success?: boolean
  message?: string
}

export type SubscribeRequest = {
  email: string
  name?: string
  phone?: string
  source: string
  service?: string
  tags?: string[]
}

const DUPLICATE_SUBMISSION_WINDOW_MS = 10 * 60 * 1000
const recentSubmissions = new Set<string>()

function splitName(name?: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || null,
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
  }
}

function normalizeFingerprintValue(value?: string | null) {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function contactFingerprint(payload: {
  email: string
  source: string
  service: string | null
  message: string
}) {
  return [
    normalizeFingerprintValue(payload.email),
    normalizeFingerprintValue(payload.source),
    normalizeFingerprintValue(payload.service),
    normalizeFingerprintValue(payload.message),
  ].join('|')
}

function recentStorageKey(fingerprint: string) {
  return `tss_contact_submission_${fingerprint}`
}

function wasRecentlySubmitted(fingerprint: string) {
  if (recentSubmissions.has(fingerprint)) return true
  if (typeof window === 'undefined') return false

  try {
    const submittedAt = Number(window.sessionStorage.getItem(recentStorageKey(fingerprint)) || 0)
    return submittedAt > 0 && Date.now() - submittedAt < DUPLICATE_SUBMISSION_WINDOW_MS
  } catch {
    return false
  }
}

function markRecentlySubmitted(fingerprint: string) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(recentStorageKey(fingerprint), String(Date.now()))
  } catch {
    // Session storage is best-effort; the in-memory guard still catches double-clicks.
  }
}

export async function subscribeEmail(data: SubscribeRequest): Promise<ContactSubmitResult> {
  const email = data.email.trim().toLowerCase()
  if (!email) throw new Error('Email is required')

  const { error } = await supabase.rpc('upsert_email_subscriber', {
    _email: email,
    _name: data.name?.trim() || null,
    _phone: data.phone?.trim() || null,
    _source: data.source,
    _service_interest: data.service || null,
    _tags: data.tags || [],
  })

  if (error) throw error
  return { success: true }
}

async function upsertCustomer(data: ContactRequest) {
  const { firstName, lastName } = splitName(data.name)
  try {
    await supabase.rpc('get_or_create_customer', {
      _email: data.email.trim(),
      _first_name: firstName,
      _last_name: lastName,
      _phone: data.phone?.trim() || null,
      _source: data.source || 'contact',
    })
  } catch {
    // CRM is helpful, but the lead record is the source of truth.
  }
}

export async function submitContactRequest(data: ContactRequest): Promise<ContactSubmitResult> {
  const identity = getAnalyticsIdentity()
  const payload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    service: data.service || null,
    message: data.message.trim(),
    source: data.source || 'contact',
    visitor_id: identity.visitorId,
    session_id: identity.sessionId,
  }

  const fingerprint = contactFingerprint(payload)
  if (wasRecentlySubmitted(fingerprint)) return { success: true, message: 'Duplicate submission ignored.' }

  recentSubmissions.add(fingerprint)
  try {
    const { error } = await supabase.from('contact_submissions').insert(payload)
    if (error) throw error
    markRecentlySubmitted(fingerprint)

    await upsertCustomer(data)

    if (data.subscribe) {
      await subscribeEmail({
        email: payload.email,
        name: payload.name,
        phone: payload.phone || undefined,
        source: payload.source,
        service: payload.service || undefined,
        tags: data.tags || [payload.service || 'lead'].filter(Boolean),
      })
    }

    try {
      await sendContactEmail({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || undefined,
        service: payload.service || undefined,
        message: payload.message,
      })
    } catch (error) {
      console.warn('Contact saved, but email delivery failed:', error)
    }

    trackLeadSubmission({
      source: payload.source,
      service: payload.service,
      subscribed: !!data.subscribe,
      tags: data.tags,
    })

    return { success: true }
  } finally {
    recentSubmissions.delete(fingerprint)
  }
}
