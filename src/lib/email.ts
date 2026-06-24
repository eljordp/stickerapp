import { supabase } from './supabase'

export async function sendContactEmail(data: {
  name: string; email: string; phone?: string; service?: string; message: string
}) {
  try {
    const { error } = await supabase.functions.invoke('send-contact-email', { body: data })
    if (error) throw error
  } catch (error) {
    console.error('Contact email failed:', error)
    throw error
  }
}

export async function sendOrderEmail(data: {
  orderId: string; customerName: string; email: string
  items: { name: string; size: string; option: string; price: number; quantity: number; addOns?: { name: string; price: number }[] }[]
  total: string; address: string
}) {
  try {
    const { error } = await supabase.functions.invoke('send-order-email', { body: data })
    if (error) throw error
  } catch (error) {
    console.error('Order email failed:', error)
    throw error
  }
}
