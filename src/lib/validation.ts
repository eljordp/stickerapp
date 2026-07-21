import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().trim().max(20, 'Phone number is too long').optional().or(z.literal('')),
  service: z.string().optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long'),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>

export const checkoutSchema = z.object({
  deliveryMethod: z.enum(['shipping', 'pickup']),
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Too long'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().trim().max(20, 'Too long').optional().or(z.literal('')),
  address: z.string().trim().max(200, 'Too long').optional().or(z.literal('')),
  city: z.string().trim().max(100, 'Too long').optional().or(z.literal('')),
  state: z.string().trim().max(50, 'Too long').optional().or(z.literal('')),
  zip: z.string().trim().max(10, 'Too long').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod !== 'shipping') return
  const requiredShippingFields: Array<['address' | 'city' | 'state' | 'zip', string]> = [
    ['address', 'Street address is required for shipping'],
    ['city', 'City is required for shipping'],
    ['state', 'State is required for shipping'],
    ['zip', 'ZIP code is required for shipping'],
  ]
  requiredShippingFields.forEach(([field, message]) => {
    if (!data[field]?.trim()) ctx.addIssue({ code: 'custom', path: [field], message })
  })
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormData, string>>
