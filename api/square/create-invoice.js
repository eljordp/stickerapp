import {
  getSquareConnection,
  idempotencyKey,
  logSquareInvoice,
  readBody,
  requireAdmin,
  requireEnv,
  sendJson,
  squareFetch,
} from '../../server/square-api.js'

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return {
    given_name: parts[0] || undefined,
    family_name: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
  }
}

function addDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function moneyToCents(value) {
  return Math.round(Number(value) * 100)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requireEnv(res)) return

  try {
    const user = await requireAdmin(req)
    const body = await readBody(req)
    const customerName = String(body.customerName || '').trim()
    const customerEmail = String(body.customerEmail || '').trim().toLowerCase()
    const customerPhone = String(body.customerPhone || '').trim()
    const title = String(body.title || 'Custom print invoice').trim()
    const description = String(body.description || '').trim()
    const amount = Number(body.amount)
    const dueDate = body.dueDate || addDays(7)

    if (!customerName || !customerEmail || !title || !Number.isFinite(amount) || amount <= 0) {
      return sendJson(res, 400, { error: 'Customer name, email, title, and amount are required.' })
    }

    const connection = await getSquareConnection({ includeToken: true })
    if (!connection?.access_token || !connection.location_id) {
      return sendJson(res, 400, { error: 'Square is not connected yet.' })
    }

    const customerPayload = {
      idempotency_key: idempotencyKey(),
      ...splitName(customerName),
      email_address: customerEmail,
      phone_number: customerPhone || undefined,
    }
    const customerResult = await squareFetch('/v2/customers', connection.access_token, {
      method: 'POST',
      body: JSON.stringify(customerPayload),
    })

    const lineItems = Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : [{ name: title, amount, quantity: 1 }]

    const orderResult = await squareFetch('/v2/orders', connection.access_token, {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: idempotencyKey(),
        order: {
          location_id: connection.location_id,
          line_items: lineItems.map((item) => ({
            name: String(item.name || title).trim(),
            quantity: String(item.quantity || 1),
            note: description || undefined,
            base_price_money: {
              amount: moneyToCents(item.amount || amount),
              currency: 'USD',
            },
          })),
        },
      }),
    })

    const invoiceResult = await squareFetch('/v2/invoices', connection.access_token, {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: idempotencyKey(),
        invoice: {
          location_id: connection.location_id,
          order_id: orderResult.order.id,
          title,
          description: description || undefined,
          primary_recipient: {
            customer_id: customerResult.customer.id,
          },
          delivery_method: 'EMAIL',
          payment_requests: [
            {
              request_type: 'BALANCE',
              due_date: dueDate,
              tipping_enabled: false,
            },
          ],
          accepted_payment_methods: {
            card: true,
            square_gift_card: false,
            bank_account: false,
            buy_now_pay_later: false,
          },
        },
      }),
    })

    const publishResult = await squareFetch(`/v2/invoices/${invoiceResult.invoice.id}/publish`, connection.access_token, {
      method: 'POST',
      body: JSON.stringify({
        version: invoiceResult.invoice.version,
        idempotency_key: idempotencyKey(),
      }),
    })

    const invoice = publishResult.invoice
    await logSquareInvoice({
      square_invoice_id: invoice.id,
      square_invoice_number: invoice.invoice_number || null,
      square_order_id: orderResult.order.id,
      square_customer_id: customerResult.customer.id,
      customer_email: customerEmail,
      customer_name: customerName,
      title,
      description: description || null,
      amount,
      currency: 'USD',
      status: invoice.status || 'sent',
      public_url: invoice.public_url || null,
      due_date: dueDate,
      created_by: user.id,
    })

    sendJson(res, 200, {
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        publicUrl: invoice.public_url,
      },
    })
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Could not create Square invoice.' })
  }
}
