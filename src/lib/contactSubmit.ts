import { sendContactEmail } from './email'
import { supabase } from './supabase'
import { trackLeadSubmission } from './analytics'

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

function splitName(name?: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || null,
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
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
  const payload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    service: data.service || null,
    message: data.message.trim(),
    source: data.source || 'contact',
  }

  const { error } = await supabase.from('contact_submissions').insert(payload)
  if (error) throw error

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

  sendContactEmail({
    name: payload.name,
    email: payload.email,
    phone: payload.phone || undefined,
    service: payload.service || undefined,
    message: payload.message,
  })

  trackLeadSubmission({
    source: payload.source,
    service: payload.service,
    subscribed: !!data.subscribe,
    tags: data.tags,
  })

  return { success: true }
}
