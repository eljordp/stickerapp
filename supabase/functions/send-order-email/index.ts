import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'The Sticker Smith <noreply@thestickersmith.com>'
const OWNER_EMAIL = 'thestickersmith@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  name: string; size: string; option: string
  price: number; quantity: number
  addOns?: { name: string; price: number }[]
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
    const { orderId, customerName, email, items, total, address } = await req.json()

    if (!orderId || !email || !items) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const itemRows = (items as OrderItem[]).map(item => {
      const addOnTotal = item.addOns?.reduce((a, b) => a + b.price, 0) || 0
      const lineTotal = ((item.price + addOnTotal) * item.quantity).toFixed(2)
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}<br><span style="color: #666; font-size: 12px;">${item.option} · ${item.size}</span></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${lineTotal}</td>
        </tr>
      `
    }).join('')

    const orderHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Order ID: <strong>${orderId}</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right;">Total:</td>
              <td style="padding: 12px 8px; font-weight: bold; text-align: right; font-size: 18px;">$${total}</td>
            </tr>
          </tfoot>
        </table>
        ${address ? `<p style="color: #666; font-size: 14px;">Shipping to: ${address}</p>` : ''}
      </div>
    `

    const emailFailures: string[] = []

    // Send confirmation to customer
    try {
      await sendResendEmail({
        from: FROM_EMAIL,
        to: [email],
        subject: `Order Confirmed — ${orderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thanks for your order, ${customerName}!</h2>
            <p>Your payment was successful. We'll start working on your order right away.</p>
            ${orderHtml}
            <p style="margin-top: 24px; color: #666; font-size: 14px;">Questions? Reply to this email or contact us at thestickersmith@gmail.com</p>
            <p style="color: #666; font-size: 14px;">— The Sticker Smith Team</p>
          </div>
        `,
      })
    } catch (error) {
      emailFailures.push(`customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Send notification to business owner
    try {
      await sendResendEmail({
        from: FROM_EMAIL,
        to: [OWNER_EMAIL],
        subject: `New Order — $${total} from ${customerName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Order Received!</h2>
            <p>Customer: <strong>${customerName}</strong> (<a href="mailto:${email}">${email}</a>)</p>
            ${orderHtml}
          </div>
        `,
      })
    } catch (error) {
      emailFailures.push(`owner: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    if (emailFailures.length > 0) {
      throw new Error(emailFailures.join(' | '))
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
