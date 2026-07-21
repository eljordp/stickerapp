import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'The Sticker Smith <noreply@thestickersmith.com>'
const CONTACT_NOTIFICATION_EMAILS = (Deno.env.get('CONTACT_NOTIFICATION_EMAILS') || Deno.env.get('CONTACT_OWNER_EMAIL') || 'mrjxrdip@icloud.com,thestickersmith@gmail.com')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendResendEmail(payload: Record<string, unknown>) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend email failed (${response.status}): ${body}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { name, email, phone, service, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = escapeHtml(phone)
    const safeService = escapeHtml(service)
    const safeMessage = escapeHtml(message)

    await sendResendEmail({
      from: FROM_EMAIL,
      to: CONTACT_NOTIFICATION_EMAILS,
      reply_to: email,
      subject: `New Quote Request from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Quote Request</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 100px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${safePhone}">${safePhone}</a></td></tr>` : ''}
            ${service ? `<tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0;">${safeService}</td></tr>` : ''}
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      `,
    })

    // Send confirmation to customer
    await sendResendEmail({
      from: FROM_EMAIL,
      to: [email],
      subject: 'We received your quote request!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thanks for reaching out, ${safeName}!</h2>
          <p>We've received your quote request. The team now has your project details and will reply by email with availability and next steps.</p>
          <p style="color: #666;">Here's what you sent us:</p>
          <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <p style="color: #666; font-size: 14px;">- The Sticker Smith Team</p>
        </div>
      `,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
