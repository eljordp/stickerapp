import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Send } from 'lucide-react'
import { submitContactRequest } from '@/lib/contactSubmit'

export type EstimateField =
  | { name: string; label: string; type: 'text'; placeholder?: string; required?: boolean }
  | { name: string; label: string; type: 'select'; options: string[]; required?: boolean }
  | { name: string; label: string; type: 'textarea'; placeholder?: string; required?: boolean }

type Props = {
  service: string
  eyebrow?: string
  title?: string
  subtitle?: string
  fields: EstimateField[]
  initialProject?: string
}

export default function EstimateForm({
  service,
  eyebrow = 'Custom Quote',
  title,
  subtitle = "Every project is different. Send the scope and we'll reply by email with availability, questions, and an exact estimate.",
  fields,
  initialProject,
}: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const setField = (name: string, value: string) =>
    setCustomValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    setStatus('sending')

    // Build a readable message from the custom fields
    const lines = fields
      .map((f) => {
        const val = customValues[f.name]?.trim()
        return val ? `${f.label}: ${val}` : null
      })
      .filter(Boolean) as string[]
    if (initialProject) lines.unshift(`Selected price guide:\n${initialProject}`)
    if (notes.trim()) lines.push(`\nNotes:\n${notes.trim()}`)
    const message = lines.length ? lines.join('\n') : 'No additional details provided.'

    try {
      await submitContactRequest({
        name,
        email,
        phone: phone || undefined,
        service,
        message,
        subject: `New ${service} estimate request from ${name}`,
        source: `${service.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-estimate-form`,
        subscribe: emailOptIn,
        tags: ['estimate-request', service],
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-3xl p-10 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={28} className="text-primary" />
        </div>
        <h3 className="text-2xl font-black mb-2">Request received.</h3>
        <p className="text-muted-foreground">
          We sent a confirmation to <span className="text-foreground font-semibold">{email}</span>.
          The request is in the lead queue. JP or the team will reply by email with availability and next steps for your {service.toLowerCase()} estimate.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-6 md:p-10"
    >
      <div className="text-center mb-8">
        <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{eyebrow}</p>
        <h3 className="text-2xl md:text-3xl font-black mb-3">
          {title ?? `Get a ${service} Estimate`}
        </h3>
        <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {initialProject && (
          <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm" aria-live="polite">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">Your selected starting point</p>
            <p className="whitespace-pre-line text-foreground">{initialProject}</p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-base"
              placeholder="Your name"
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-base"
              placeholder="you@company.com"
            />
          </Field>
        </div>
        <Field label="Phone (optional)">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-base"
            placeholder="(555) 123-4567"
          />
        </Field>

        {fields.map((f) => (
          <Field key={f.name} label={f.label} required={f.required}>
            {f.type === 'text' && (
              <input
                value={customValues[f.name] ?? ''}
                onChange={(e) => setField(f.name, e.target.value)}
                required={f.required}
                className="input-base"
                placeholder={f.placeholder}
              />
            )}
            {f.type === 'textarea' && (
              <textarea
                value={customValues[f.name] ?? ''}
                onChange={(e) => setField(f.name, e.target.value)}
                required={f.required}
                className="input-base min-h-[80px] resize-none"
                placeholder={f.placeholder}
              />
            )}
            {f.type === 'select' && (
              <select
                value={customValues[f.name] ?? ''}
                onChange={(e) => setField(f.name, e.target.value)}
                required={f.required}
                className="input-base"
              >
                <option value="">Select…</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ))}

        <Field label="Anything else we should know?">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-base min-h-[80px] resize-none"
            placeholder="Timeline, budget, links to inspiration, etc."
          />
        </Field>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={(e) => setEmailOptIn(e.target.checked)}
            className="mt-1 accent-primary"
          />
          <span>Send me occasional print deals, file tips, and project ideas.</span>
        </label>

        <button
          type="submit"
          disabled={status === 'sending' || !name || !email}
          className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? (
            'Sending…'
          ) : (
            <>
              Request Estimate <Send size={16} />
            </>
          )}
        </button>
        {status === 'error' && (
          <p className="text-sm text-destructive text-center">
            Couldn't submit — try again or email thestickersmith@gmail.com directly.
          </p>
        )}
      </form>
    </motion.div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </span>
      {children}
    </label>
  )
}
