import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Mail, MapPin, Loader2 } from 'lucide-react'
import { contactSchema, type ContactFormErrors } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { sendContactEmail } from '@/lib/email'
import { toast } from 'sonner'
import contactPrinter from '@/assets/pages/contact-printer.jpg'

export default function Contact() {
  const [searchParams] = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' })

  // Prefill from query params — lets other pages hand off context
  // (e.g. /contact?service=Bulk+Sticker+Order&qty=2500&size=3"+x+3"&material=Holographic)
  useEffect(() => {
    const service = searchParams.get('service')
    const qty = searchParams.get('qty')
    const size = searchParams.get('size')
    const material = searchParams.get('material')
    if (!service && !qty && !size && !material) return
    const parts: string[] = []
    if (qty) parts.push(`Quantity: ${qty}`)
    if (size) parts.push(`Size: ${size}`)
    if (material) parts.push(`Material: ${material}`)
    const prefillMsg = parts.length ? `Hi! I'd like a quote for:\n${parts.join('\n')}\n\n` : ''
    setFormData((prev) => ({
      ...prev,
      service: service || prev.service,
      message: prefillMsg || prev.message,
    }))
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: ContactFormErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactFormErrors
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      toast.error('Please fix the form errors')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        service: formData.service || null,
        message: formData.message.trim(),
        source: 'contact-page',
      })

      if (error) throw error
      sendContactEmail({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        service: formData.service || undefined,
        message: formData.message.trim(),
      })
      setSubmitted(true)
      toast.success('Quote request sent!')
    } catch {
      // Fallback to mailto if Supabase fails
      const body = [`Name: ${formData.name}`, `Email: ${formData.email}`, formData.phone ? `Phone: ${formData.phone}` : '', formData.service ? `Service: ${formData.service}` : '', '', formData.message].filter(Boolean).join('\n')
      window.location.href = `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent('Quote Request')}&body=${encodeURIComponent(body)}`
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="relative -mt-16 md:-mt-18 pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={contactPrinter} alt="The Sticker Smith print shop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-background" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center section-container z-10">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Custom Quote</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Get a Free Quote</h1>
          <p className="text-white/80 text-lg">Tell us about your project and we'll get back within 24 hours.</p>
        </motion.div>
      </div>
      <section className="py-8 md:py-16">
        <div className="section-container max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {submitted ? (
                <div className="text-center py-16">
                  <Send size={48} className="mx-auto text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Quote Request Sent!</h2>
                  <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="sr-only">Your Name</label>
                      <input
                        id="contact-name"
                        type="text" placeholder="Your Name" value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-5 py-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors.name ? 'border-destructive' : 'border-border'}`}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && <p id="name-error" className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="sr-only">Your Email</label>
                      <input
                        id="contact-email"
                        type="email" placeholder="Your Email" value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-5 py-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors.email ? 'border-destructive' : 'border-border'}`}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && <p id="email-error" className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="sr-only">Phone</label>
                    <input
                      id="contact-phone"
                      type="tel" placeholder="Phone" value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="sr-only">Project Details</label>
                    <textarea
                      id="contact-message"
                      placeholder="Tell us about your project..." rows={5} value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className={`w-full px-5 py-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none ${errors.message ? 'border-destructive' : 'border-border'}`}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && <p id="message-error" className="text-sm text-destructive mt-1">{errors.message}</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Quote Request<Send size={18} /></>}
                  </button>
                </form>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <Mail className="text-primary mb-3" size={24} aria-hidden="true" />
                <h3 className="font-bold mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">thestickersmith@gmail.com</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <MapPin className="text-primary mb-3" size={24} aria-hidden="true" />
                <h3 className="font-bold mb-1">Location</h3>
                <p className="text-sm text-muted-foreground">Hayward, California</p>
                <p className="text-xs text-muted-foreground mt-1">Bay Area pickup by appointment</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <Send className="text-primary mb-3" size={24} aria-hidden="true" />
                <h3 className="font-bold mb-1">Response Time</h3>
                <p className="text-sm text-muted-foreground">Within 24 hours, every business day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
