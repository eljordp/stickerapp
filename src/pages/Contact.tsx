import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, Phone, MapPin } from 'lucide-react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const body = [`Name: ${formData.name}`, `Email: ${formData.email}`, formData.phone ? `Phone: ${formData.phone}` : '', formData.service ? `Service: ${formData.service}` : '', '', formData.message].filter(Boolean).join('\n')
    window.location.href = `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent('Quote Request')}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }
  return (
    <section className="py-8 md:py-16">
      <div className="section-container max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">Get a Free Quote</h1>
          <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-primary to-primary/40 mb-4" />
          <p className="text-muted-foreground text-lg">Tell us about your project and we'll get back to you within 24 hours</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {submitted ? (
              <div className="text-center py-16">
                <Send size={48} className="mx-auto text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-2">Quote Request Sent!</h2>
                <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  <input type="email" placeholder="Your Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                <textarea placeholder="Tell us about your project..." required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none" />
                <button type="submit" className="btn-primary w-full">Send Quote Request<Send size={18} /></button>
              </form>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <Mail className="text-primary mb-3" size={24} />
              <h3 className="font-bold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">thestickersmith@gmail.com</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <Phone className="text-primary mb-3" size={24} />
              <h3 className="font-bold mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground">Bay Area, CA</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <MapPin className="text-primary mb-3" size={24} />
              <h3 className="font-bold mb-1">Location</h3>
              <p className="text-sm text-muted-foreground">Hayward, California</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
