import { useEffect, useRef, useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

type SquareTokenResult = {
  status: string
  token?: string
  errors?: Array<{ message?: string; detail?: string; code?: string }>
}

type SquareCard = {
  attach: (selector: string) => Promise<void>
  tokenize: (details: SquareVerificationDetails) => Promise<SquareTokenResult>
  destroy: () => Promise<boolean>
}

type SquarePayments = {
  card: () => Promise<SquareCard>
}

type SquareVerificationDetails = {
  amount: string
  billingContact: {
    givenName: string
    familyName: string
    email: string
    phone?: string
    addressLines?: string[]
    city?: string
    state?: string
    postalCode?: string
    countryCode: 'US'
  }
  currencyCode: 'USD'
  intent: 'CHARGE'
  customerInitiated: true
  sellerKeyedIn: false
}

type SquareCheckoutConfig = {
  available: boolean
  applicationId?: string
  locationId?: string
  environment?: 'production' | 'sandbox'
  reason?: string
}

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => SquarePayments
    }
  }
}

type Customer = {
  deliveryMethod: 'shipping' | 'pickup'
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
}

type Props = {
  amount: number
  customer: Customer
  disabled: boolean
  processing: boolean
  onAvailabilityChange?: (available: boolean) => void
  onPaymentToken: (token: string, attemptId: string) => Promise<void>
  onError: (message: string) => void
}

let squareScriptPromise: Promise<void> | null = null

function loadSquareScript(environment: 'production' | 'sandbox'): Promise<void> {
  if (window.Square) return Promise.resolve()
  if (squareScriptPromise) return squareScriptPromise

  squareScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = environment === 'sandbox'
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js'
    script.async = true
    script.onload = () => window.Square ? resolve() : reject(new Error('Square loaded without its payment API.'))
    script.onerror = () => reject(new Error('The secure Square card form could not load.'))
    document.head.appendChild(script)
  }).catch((error) => {
    squareScriptPromise = null
    throw error
  })

  return squareScriptPromise
}

function tokenError(result: SquareTokenResult) {
  const detail = result.errors?.map(error => error.message || error.detail || error.code).filter(Boolean).join(' ')
  return detail || 'Check the card details and try again.'
}

export default function SquareCardPayment({
  amount,
  customer,
  disabled,
  processing,
  onAvailabilityChange,
  onPaymentToken,
  onError,
}: Props) {
  const cardRef = useRef<SquareCard | null>(null)
  const attemptIdRef = useRef<string | null>(null)
  const [available, setAvailable] = useState(false)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const setup = async () => {
      try {
        const response = await fetch('/api/square/checkout-config', { cache: 'no-store' })
        const config = await response.json() as SquareCheckoutConfig
        if (!active || !config.available || !config.applicationId || !config.locationId) {
          if (active) onAvailabilityChange?.(false)
          return
        }

        setAvailable(true)
        onAvailabilityChange?.(true)
        await loadSquareScript(config.environment || 'production')
        if (!active || !window.Square) return

        const payments = window.Square.payments(config.applicationId, config.locationId)
        const card = await payments.card()
        await card.attach('#square-card-container')
        if (!active) {
          await card.destroy().catch(() => false)
          return
        }
        cardRef.current = card
        setReady(true)
      } catch (error) {
        if (!active) return
        console.error('Square card form setup failed:', error)
        setAvailable(false)
        onAvailabilityChange?.(false)
      }
    }

    void setup()
    return () => {
      active = false
      const card = cardRef.current
      cardRef.current = null
      if (card) void card.destroy().catch(() => false)
    }
  }, [onAvailabilityChange])

  if (!available) return null

  const submit = async () => {
    if (!cardRef.current || disabled || processing || submitting) return
    setSubmitting(true)
    onError('')
    try {
      const billingContact: SquareVerificationDetails['billingContact'] = {
        givenName: customer.firstName.trim(),
        familyName: customer.lastName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim() || undefined,
        countryCode: 'US',
      }
      if (customer.deliveryMethod === 'shipping') {
        billingContact.addressLines = [customer.address.trim()]
        billingContact.city = customer.city.trim()
        billingContact.state = customer.state.trim()
        billingContact.postalCode = customer.zip.trim()
      }

      const result = await cardRef.current.tokenize({
        amount: amount.toFixed(2),
        billingContact,
        currencyCode: 'USD',
        intent: 'CHARGE',
        customerInitiated: true,
        sellerKeyedIn: false,
      })
      if (result.status !== 'OK' || !result.token) throw new Error(tokenError(result))

      attemptIdRef.current ||= crypto.randomUUID()
      await onPaymentToken(result.token, attemptIdRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The card payment could not be processed.'
      onError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">Credit or debit card</p>
          <p className="text-xs text-muted-foreground">Processed securely by Square</p>
        </div>
        <CreditCard size={20} className="text-primary" aria-hidden="true" />
      </div>
      <div id="square-card-container" className="min-h-24" aria-busy={!ready} />
      {!ready && (
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Loading secure card form…
        </div>
      )}
      <button
        type="button"
        onClick={() => { void submit() }}
        disabled={!ready || disabled || processing || submitting}
        className="btn-primary mt-3 min-h-12 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting || processing ? <><Loader2 size={17} className="animate-spin" /> Processing…</> : <>Pay ${amount.toFixed(2)} by card</>}
      </button>
    </div>
  )
}
