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
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Too long'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().trim().min(1, 'Phone is required').max(20, 'Too long'),
  address: z.string().trim().min(1, 'Address is required').max(200, 'Too long'),
  city: z.string().trim().min(1, 'City is required').max(100, 'Too long'),
  state: z.string().trim().min(1, 'State is required').max(50, 'Too long'),
  zip: z.string().trim().min(1, 'ZIP code is required').max(10, 'Too long'),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormData, string>>
