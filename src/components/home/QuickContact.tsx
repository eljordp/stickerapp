import { useState, useRef, type FormEvent } from 'react'
import { Send, ArrowRight, Loader2, Paperclip, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { contactSchema, validateAttachment, type ContactFormErrors } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { sendContactEmail } from '@/lib/email'
import { toast } from 'sonner'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjgbqwzo'

const services = ['Stickers & Labels', 'Vehicle Graphics', 'Business Signage', 'Event Displays', 'Mylar Packaging', 'Business Print', 'Other']

export default function QuickContact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    if (attachmentError) {
      toast.error(attachmentError)
      return
    }

    setLoading(true)
    try {
      let res: Response
      if (attachment) {
        const payload = new FormData()
        payload.append('name', formData.name.trim())
        payload.append('email', formData.email.trim())
        if (formData.phone.trim()) payload.append('phone', formData.phone.trim())
        if (formData.service) payload.append('service', formData.service)
        payload.append('message', formData.message.trim())
        payload.append('_subject', `New quick message from ${formData.name.trim()}`)
        payload.append('Upload File', attachment, attachment.name)
        res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: payload,
        })
      } else {
        res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            service: formData.service || undefined,
            message: formData.message.trim(),
            _subject: `New quick message from ${formData.name.trim()}`,
          }),
        })
      }

      if (!res.ok) throw new Error(`Formspree returned ${res.status}`)

      // Best-effort log to Supabase + Resend confirmation. Non-blocking.
      supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        service: formData.service || null,
        message: formData.message.trim(),
        source: 'quick-contact',
      }).then(() => {})
      sendContactEmail({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        service: formData.service || undefined,
        message: formData.message.trim(),
      })

      setSubmitted(true)
      toast.success('Message sent!')
    } catch (err) {
      toast.error("Couldn't send — please email thestickersmith@gmail.com directly.")
      console.error('QuickContact submit failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="py-16 md:py-24 bg-card/30">
        <div className="section-container text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Send className="w-7 h-7 text-primary" aria-hidden="true" /></div>
          <h3 className="text-2xl font-bold mb-2">Message sent!</h3>
          <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-card/30 border-t border-border/50">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Have a Question?</h2>
            <p className="text-muted-foreground text-lg">Drop us a quick message or request a free quote</p>
          </motion.div>
          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="quick-name" className="sr-only">Your Name</label>
                <input
                  id="quick-name"
                  type="text" placeholder="Your Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-5 py-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.name ? 'border-destructive' : 'border-border'}`}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="quick-email" className="sr-only">Your Email</label>
                <input
                  id="quick-email"
                  type="email" placeholder="Your Email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-5 py-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.email ? 'border-destructive' : 'border-border'}`}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="quick-phone" className="sr-only">Phone</label>
                <input
                  id="quick-phone"
                  type="tel" placeholder="Phone (optional)" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="quick-service" className="sr-only">Select a Service</label>
                <select
                  id="quick-service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a Service</option>
                  {services.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="quick-message" className="sr-only">Message</label>
                <input
                  id="quick-message"
                  type="text" placeholder="What do you need?" value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-5 py-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.message ? 'border-destructive' : 'border-border'}`}
                />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                id="quick-attachment"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  if (!file) { setAttachment(null); setAttachmentError(null); return }
                  const err = validateAttachment(file)
                  if (err) { setAttachment(null); setAttachmentError(err); if (fileInputRef.current) fileInputRef.current.value = ''; return }
                  setAttachment(file)
                  setAttachmentError(null)
                }}
              />
              {attachment ? (
                <div className="flex items-center justify-between gap-3 px-5 py-3 rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-3 min-w-0">
                    <Paperclip size={18} className="text-primary shrink-0" />
                    <span className="text-sm truncate">{attachment.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove attachment"
                    onClick={() => {
                      setAttachment(null)
                      setAttachmentError(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="quick-attachment"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground cursor-pointer transition-colors"
                >
                  <Paperclip size={18} />
                  <span className="text-sm">Attach a file (optional — PDF, JPG, PNG, GIF, SVG, 10 MB max)</span>
                </label>
              )}
              {attachmentError && <p className="text-sm text-destructive mt-1">{attachmentError}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button type="submit" className="btn-primary px-8 py-3.5" disabled={loading}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Message<Send size={18} /></>}
              </button>
              <Link to="/contact" className="btn-secondary px-8 py-3.5">Full Contact Form<ArrowRight size={18} /></Link>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
