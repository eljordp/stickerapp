import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ArrowLeft, Lock, ShieldCheck, Tag, X, Check, MapPin, Truck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import SquareCardPayment from '@/components/SquareCardPayment'
import { checkoutSchema, type CheckoutFormErrors } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { linkReferral } from '@/lib/referrals'
import { isReferralCode, processReferralConversion } from '@/lib/referralRewards'
import { sendOrderEmail } from '@/lib/email'
import { getAnalyticsIdentity, trackCheckoutStarted, trackPaymentCapture } from '@/lib/analytics'
import { toast } from 'sonner'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

interface CustomerInfo {
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

export default function Checkout() {
  const { items, total, clearCart, markConverted, setCartEmail, promoCode, promoDiscount, promoLabel, applyPromo, removePromo, finalizePromo } = useCart()
  const navigate = useNavigate()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    deliveryMethod: 'shipping',
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
  })
  const [formValid, setFormValid] = useState(false)
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [paymentError, setPaymentError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [squareAvailable, setSquareAvailable] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState(false)
  const checkoutStartedTracked = useRef(false)

  const finalTotal = Math.max(0, +(total - promoDiscount).toFixed(2))

  useEffect(() => {
    if (checkoutStartedTracked.current || items.length === 0) return
    checkoutStartedTracked.current = true
    trackCheckoutStarted({
      items,
      value: finalTotal,
      subtotal: total,
      promoCode,
      promoDiscount,
    })
  }, [finalTotal, items, promoCode, promoDiscount, total])

  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl font-black mb-4">Nothing to Checkout</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty.</p>
          <Link to="/stickers" className="btn-primary">Make Custom Stickers</Link>
        </div>
      </section>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...customerInfo, [e.target.name]: e.target.value }
    setCustomerInfo(updated)

    // Persist email back to cart context so the cart_sessions row carries it.
    // Enables cross-device cart restore by email later.
    if (e.target.name === 'email') {
      const trimmed = e.target.value.trim()
      if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setCartEmail(trimmed)
      }
    }

    const result = checkoutSchema.safeParse(updated)
    if (result.success) {
      setErrors({})
      setFormValid(true)
    } else {
      setFormValid(false)
    }
  }

  const handleDeliveryMethod = (deliveryMethod: CustomerInfo['deliveryMethod']) => {
    const updated = { ...customerInfo, deliveryMethod }
    setCustomerInfo(updated)
    const result = checkoutSchema.safeParse(updated)
    setFormValid(result.success)
    if (deliveryMethod === 'pickup') {
      setErrors(prev => {
        const next = { ...prev }
        delete next.address
        delete next.city
        delete next.state
        delete next.zip
        return next
      })
    }
  }

  const handleBlur = (field: keyof CustomerInfo) => {
    const result = checkoutSchema.safeParse(customerInfo)
    if (!result.success) {
      const fieldError = result.error.issues.find(issue => issue.path[0] === field)
      if (fieldError) {
        setErrors(prev => ({ ...prev, [field]: fieldError.message }))
      } else {
        setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
      }
    } else {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return
    const result = applyPromo(promoInput.trim())
    if (result.valid) {
      setPromoError('')
      setPromoSuccess(true)
      setTimeout(() => setPromoSuccess(false), 2000)
    } else {
      setPromoError(result.error || 'Invalid code')
    }
  }

  const orderDescription = items
    .map(i => `${i.name} (${i.option}, ${i.size}) x${i.quantity}`)
    .join(', ')

  const customerName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim()
  const shippingAddress = customerInfo.deliveryMethod === 'pickup'
    ? 'Local pickup — 23673 Connecticut St, Hayward, CA 94545'
    : `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`

  const checkoutPayload = () => {
    const identity = getAnalyticsIdentity()
    return {
      items: items.map(item => ({ ...item })),
      customerInfo: { ...customerInfo },
      promoCode,
      promoDiscount,
      total: finalTotal.toFixed(2),
      orderDescription,
      visitorId: identity.visitorId,
      sessionId: identity.sessionId,
      attribution: identity.attribution,
    }
  }

  const readCheckoutApiResponse = async (response: Response) => {
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || 'Checkout payment request failed.')
    }
    return data
  }

  const createPayPalOrder = async () => {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload()),
    })
    const data = await readCheckoutApiResponse(response)
    if (!data.id) throw new Error('PayPal did not return an order ID.')
    return data.id as string
  }

  const capturePayPalOrder = async (orderID: string) => {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...checkoutPayload(), orderID }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return {
        ok: false,
        instrumentDeclined: data.instrumentDeclined === true,
        error: data.error || 'PayPal capture failed.',
      }
    }
    return {
      ok: true,
      orderId: (data.orderID || data.id || orderID) as string,
      orderSaved: data.orderSaved === true,
      orderSaveIssue: typeof data.orderSaveIssue === 'string' ? data.orderSaveIssue : '',
    }
  }

  const captureSquarePayment = async (sourceId: string, attemptId: string) => {
    setProcessing(true)
    setPaymentError('')
    try {
      const response = await fetch('/api/square/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checkoutPayload(), sourceId, attemptId }),
      })
      const data = await readCheckoutApiResponse(response)
      const paymentId = String(data.paymentId || '').trim()
      if (!paymentId) throw new Error('Square did not return a payment ID.')
      await completeSuccessfulOrder({
        orderId: paymentId,
        provider: 'square',
        orderSaved: data.orderSaved === true,
        orderSaveIssue: typeof data.orderSaveIssue === 'string' ? data.orderSaveIssue : '',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The card payment could not be processed.'
      console.error('Square payment error:', error)
      setPaymentError(message)
      toast.error('Card payment failed')
      throw error
    } finally {
      setProcessing(false)
    }
  }

  const formatOrderRecoveryMessage = (orderId: string, reason: string, provider: 'paypal' | 'square') => {
    const itemLines = items.map(item => {
      const addOnText = item.addOns?.length
        ? `, add-ons: ${item.addOns.map(addOn => `${addOn.name} (+$${addOn.price.toFixed(2)})`).join('; ')}`
        : ''
      return `- ${item.name}: ${item.option}, ${item.size}, qty ${item.quantity}, base $${item.price.toFixed(2)}${addOnText}`
    }).join('\n')

    return [
      `Paid ${provider === 'square' ? 'Square' : 'PayPal'} order needs manual recovery.`,
      `Payment ID: ${orderId}`,
      `Reason: ${reason}`,
      `Customer: ${customerName || 'Unknown'}`,
      `Email: ${customerInfo.email.trim()}`,
      `Phone: ${customerInfo.phone.trim()}`,
      `Delivery: ${shippingAddress}`,
      `Total paid: $${finalTotal.toFixed(2)}`,
      `Items:\n${itemLines}`,
    ].join('\n')
  }

  const recordOrderRecovery = async (orderId: string, reason: string, provider: 'paypal' | 'square') => {
    const identity = getAnalyticsIdentity()
    const { error } = await supabase.from('contact_submissions').insert({
      name: customerName || 'Paid checkout customer',
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
      service: 'Paid order recovery',
      source: 'checkout-post-payment-fallback',
      message: formatOrderRecoveryMessage(orderId, reason, provider),
      visitor_id: identity.visitorId,
      session_id: identity.sessionId,
      attribution: identity.attribution,
    })

    if (error) throw error
  }

  const saveOrder = async (orderId: string, skipRemoteInsert = false, provider: 'paypal' | 'square' = 'paypal') => {
    const identity = getAnalyticsIdentity()
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: { ...customerInfo },
      items: items.map(i => ({ ...i })),
      total: finalTotal.toFixed(2),
      subtotal: total.toFixed(2),
      promoCode: promoCode || undefined,
      promoDiscount: promoDiscount > 0 ? promoDiscount.toFixed(2) : undefined,
      status: 'processing' as const,
      paymentStatus: 'captured' as const,
      paymentProvider: provider,
    }

    const prev = JSON.parse(localStorage.getItem('tss-orders') || '[]')
    localStorage.setItem('tss-orders', JSON.stringify([order, ...prev]))

    if (skipRemoteInsert) return

    const { error } = await supabase.from('orders').insert({
      id: orderId,
      customer_first_name: customerInfo.firstName.trim(),
      customer_last_name: customerInfo.lastName.trim(),
      customer_email: customerInfo.email.trim(),
      customer_phone: customerInfo.phone.trim(),
      customer_address: customerInfo.deliveryMethod === 'pickup' ? 'Local pickup' : customerInfo.address.trim(),
      customer_city: customerInfo.deliveryMethod === 'pickup' ? 'Hayward' : customerInfo.city.trim(),
      customer_state: customerInfo.deliveryMethod === 'pickup' ? 'CA' : customerInfo.state.trim(),
      customer_zip: customerInfo.deliveryMethod === 'pickup' ? '94545' : customerInfo.zip.trim(),
      items: items.map(i => ({ ...i })),
      total: parseFloat(finalTotal.toFixed(2)),
      status: 'processing',
      payment_provider: provider,
      payment_reference: orderId,
      visitor_id: identity.visitorId,
      session_id: identity.sessionId,
      attribution: identity.attribution,
    })

    if (error) {
      if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate')) return
      throw error
    }
  }

  const completeSuccessfulOrder = async ({
    orderId,
    provider,
    orderSaved,
    orderSaveIssue,
  }: {
    orderId: string
    provider: 'paypal' | 'square'
    orderSaved: boolean
    orderSaveIssue?: string
  }) => {
    finalizePromo()
    trackPaymentCapture({
      provider,
      orderId,
      items,
      value: finalTotal,
      subtotal: total,
      promoCode,
      promoDiscount,
    })

    let processingIssue = ''
    try {
      await saveOrder(orderId, orderSaved, provider)
      if (orderSaveIssue) console.warn('Server order save warning:', orderSaveIssue)

      try {
        const { data: customerId } = await supabase.rpc('get_or_create_customer', {
          _email: customerInfo.email.trim(),
          _first_name: customerInfo.firstName.trim(),
          _last_name: customerInfo.lastName.trim(),
          _phone: customerInfo.phone.trim(),
          _source: 'checkout',
        })
        if (customerId) {
          await linkReferral(customerId)
          await supabase.rpc('record_purchase', {
            _email: customerInfo.email.trim(),
            _order_id: orderId,
            _total: parseFloat(finalTotal.toFixed(2)),
          })
        }
      } catch { /* CRM is non-blocking */ }

      if (promoCode && isReferralCode(promoCode)) {
        try {
          processReferralConversion(
            promoCode,
            customerInfo.email.trim(),
            customerName,
            orderId,
            parseFloat(finalTotal.toFixed(2))
          )
        } catch { /* referral rewards are non-blocking */ }
      }

      await sendOrderEmail({
        orderId,
        customerName: customerName || customerInfo.email.trim(),
        email: customerInfo.email.trim(),
        items: items.map(i => ({ ...i })),
        total: finalTotal.toFixed(2),
        address: shippingAddress,
      })
    } catch (postPaymentError) {
      const reason = postPaymentError instanceof Error ? postPaymentError.message : 'Unknown post-payment error'
      console.error('Post-payment order processing error:', postPaymentError)
      try {
        await recordOrderRecovery(orderId, reason, provider)
        processingIssue = 'Payment received, but our confirmation system needs manual review. We saved your order details for the team.'
      } catch (recoveryError) {
        console.error('Order recovery lead failed:', recoveryError)
        processingIssue = `Payment received, but the automatic order record failed. Please email us with payment ID ${orderId}.`
      }
    }

    await markConverted()
    clearCart()
    localStorage.setItem('tss_order_completed', 'true')

    toast.success(processingIssue ? 'Payment received — order needs review' : 'Payment successful!')
    navigate('/order-confirmation', {
      state: {
        orderId,
        payerName: customerName,
        email: customerInfo.email,
        total: finalTotal.toFixed(2),
        processingIssue,
      },
    })
  }

  const inputClass = (field: keyof CustomerInfo) =>
    `w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${errors[field] ? 'border-destructive' : 'border-border'}`

  const checkoutContent = (
      <section className="py-8 md:py-16">
        <div className="section-container max-w-6xl">
          <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={18} /> Back to Cart
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black mb-8"
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-firstName" className="block text-sm font-medium text-muted-foreground mb-1.5">First Name *</label>
                    <input
                      id="checkout-firstName"
                      type="text" name="firstName" value={customerInfo.firstName}
                      onChange={handleChange} onBlur={() => handleBlur('firstName')}
                      className={inputClass('firstName')}
                      placeholder="John" autoComplete="given-name"
                    />
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-lastName" className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name *</label>
                    <input
                      id="checkout-lastName"
                      type="text" name="lastName" value={customerInfo.lastName}
                      onChange={handleChange} onBlur={() => handleBlur('lastName')}
                      className={inputClass('lastName')}
                      placeholder="Doe" autoComplete="family-name"
                    />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className="block text-sm font-medium text-muted-foreground mb-1.5">Email *</label>
                    <input
                      id="checkout-email"
                      type="email" name="email" value={customerInfo.email}
                      onChange={handleChange} onBlur={() => handleBlur('email')}
                      className={inputClass('email')}
                      placeholder="john@example.com" autoComplete="email"
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="block text-sm font-medium text-muted-foreground mb-1.5">Phone <span className="text-xs">(optional)</span></label>
                    <input
                      id="checkout-phone"
                      type="tel" name="phone" value={customerInfo.phone}
                      onChange={handleChange} onBlur={() => handleBlur('phone')}
                      className={inputClass('phone')}
                      placeholder="(555) 123-4567" autoComplete="tel"
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <fieldset className="bg-card border border-border rounded-2xl p-6">
                <legend className="px-1 text-xl font-bold">Delivery</legend>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">Choose free shipping or pick up from the Hayward shop.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleDeliveryMethod('shipping')}
                    aria-pressed={customerInfo.deliveryMethod === 'shipping'}
                    className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${customerInfo.deliveryMethod === 'shipping' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/40'}`}
                  >
                    <Truck size={20} className="shrink-0 text-primary" />
                    <span><span className="block font-bold">Free shipping</span><span className="text-xs text-muted-foreground">USPS or UPS</span></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeliveryMethod('pickup')}
                    aria-pressed={customerInfo.deliveryMethod === 'pickup'}
                    className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${customerInfo.deliveryMethod === 'pickup' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/40'}`}
                  >
                    <MapPin size={20} className="shrink-0 text-primary" />
                    <span><span className="block font-bold">Hayward pickup</span><span className="text-xs text-muted-foreground">23673 Connecticut St</span></span>
                  </button>
                </div>

                {customerInfo.deliveryMethod === 'shipping' ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="checkout-address" className="block text-sm font-medium text-muted-foreground mb-1.5">Street Address *</label>
                    <input
                      id="checkout-address"
                      type="text" name="address" value={customerInfo.address}
                      onChange={handleChange} onBlur={() => handleBlur('address')}
                      className={inputClass('address')}
                      placeholder="123 Main St" autoComplete="shipping street-address"
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="checkout-city" className="block text-sm font-medium text-muted-foreground mb-1.5">City *</label>
                      <input
                        id="checkout-city"
                        type="text" name="city" value={customerInfo.city}
                        onChange={handleChange} onBlur={() => handleBlur('city')}
                        className={inputClass('city')}
                        placeholder="Sacramento" autoComplete="shipping address-level2"
                      />
                      {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="checkout-state" className="block text-sm font-medium text-muted-foreground mb-1.5">State *</label>
                      <input
                        id="checkout-state"
                        type="text" name="state" value={customerInfo.state}
                        onChange={handleChange} onBlur={() => handleBlur('state')}
                        className={inputClass('state')}
                        placeholder="CA" autoComplete="shipping address-level1"
                      />
                      {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label htmlFor="checkout-zip" className="block text-sm font-medium text-muted-foreground mb-1.5">ZIP Code *</label>
                      <input
                        id="checkout-zip"
                        type="text" name="zip" value={customerInfo.zip}
                        onChange={handleChange} onBlur={() => handleBlur('zip')}
                        className={inputClass('zip')}
                        placeholder="95814" autoComplete="shipping postal-code"
                      />
                      {errors.zip && <p className="text-sm text-destructive mt-1">{errors.zip}</p>}
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                    <p className="font-bold">Pickup in Hayward</p>
                    <p className="mt-1 text-muted-foreground">We will email you when the proof is approved and the order is ready. Do not arrive before receiving the ready-for-pickup message.</p>
                  </div>
                )}
              </fieldset>

              {/* Promo Code */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={18} className="text-primary" />
                  <h2 className="text-xl font-bold">Promo Code</h2>
                </div>

                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-400/10 border border-green-400/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-400" />
                      <span className="font-bold text-green-400">{promoCode}</span>
                      <span className="text-sm text-muted-foreground">— {promoLabel}</span>
                    </div>
                    <button onClick={removePromo} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="Enter promo code"
                        className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase tracking-wider"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                          promoSuccess
                            ? 'bg-green-600 text-white'
                            : 'bg-primary text-primary-foreground hover:brightness-110'
                        }`}
                      >
                        {promoSuccess ? 'Applied!' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-destructive mt-2">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-2">Payment</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Lock size={14} aria-hidden="true" /> {squareAvailable ? 'Secure card checkout by Square or continue with PayPal' : 'Secure checkout with PayPal'}
                </div>

                {!formValid && (
                  <p className="text-sm text-muted-foreground mb-4 bg-muted/50 rounded-xl p-4">
                    Fill out the required fields above to enable payment.
                  </p>
                )}

                {paymentError && (
                  <div className="text-sm text-destructive mb-4 bg-destructive/10 rounded-xl p-4" role="alert">
                    {paymentError}
                  </div>
                )}

                <SquareCardPayment
                  amount={finalTotal}
                  customer={customerInfo}
                  disabled={!formValid}
                  processing={processing}
                  onAvailabilityChange={setSquareAvailable}
                  onPaymentToken={captureSquarePayment}
                  onError={setPaymentError}
                />

                {PAYPAL_CLIENT_ID ? (
                  <div className={`${squareAvailable ? 'mt-5 border-t border-border pt-5' : ''} ${!formValid || processing ? 'opacity-40 pointer-events-none' : ''}`}>
                    {squareAvailable && (
                      <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="h-px flex-1 bg-border" /> or use PayPal <span className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 50 }}
                      disabled={!formValid}
                      createOrder={createPayPalOrder}
                      onApprove={async (data, actions) => {
                        setProcessing(true)
                        setPaymentError('')
                        try {
                          const capture = await capturePayPalOrder(data.orderID)
                          if (!capture.ok) {
                            if (capture.instrumentDeclined) {
                              await actions.restart()
                              return
                            }
                            throw new Error(capture.error)
                          }

                          const orderId = capture.orderId
                          if (!orderId) throw new Error('PayPal did not return an order ID.')
                          await completeSuccessfulOrder({
                            orderId,
                            provider: 'paypal',
                            orderSaved: capture.orderSaved,
                            orderSaveIssue: capture.orderSaveIssue,
                          })
                        } catch (err) {
                          console.error('Payment capture error:', err)
                          setPaymentError('Payment capture failed. Please contact us if you were charged.')
                          toast.error('Payment issue — please contact us')
                        } finally {
                          setProcessing(false)
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err)
                        setPaymentError('Payment failed. Please try again or contact us.')
                        toast.error('Payment failed')
                      }}
                    />
                  </div>
                ) : (
                  !squareAvailable && <div className="text-sm text-destructive bg-destructive/10 rounded-xl p-4" role="alert">
                    Online checkout is temporarily unavailable. Please contact us to complete your order.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map(item => {
                    const addOnTotal = item.addOns?.reduce((a, b) => a + b.price, 0) || 0
                    const itemTotal = (item.price + addOnTotal) * item.quantity
                    return (
                      <div key={item.id} className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.option} · {item.size}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          {item.addOns && item.addOns.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">+ {item.addOns.map(a => a.name).join(', ')}</p>
                          )}
                          {item.artworkIntent === 'send_later' && <p className="text-xs text-primary mt-1">Artwork after checkout</p>}
                          {item.artworkIntent === 'design_help' && <p className="text-xs text-primary mt-1">Design help requested</p>}
                          {item.artworkIntent === 'uploaded' && item.artwork && <p className="text-xs text-green-400 mt-1">Artwork attached</p>}
                        </div>
                        <span className="font-bold text-primary shrink-0">${itemTotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                  {promoCode && promoDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1.5">
                        <Tag size={12} />
                        Promo ({promoCode})
                      </span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground"><span>{customerInfo.deliveryMethod === 'pickup' ? 'Pickup' : 'Shipping'}</span><span className="text-green-400">Free</span></div>
                  <div className="flex justify-between text-xl font-black pt-2 border-t border-border"><span>Total</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={16} className="text-green-400 shrink-0" aria-hidden="true" />
                  <span>{squareAvailable ? 'Card details are handled by Square; PayPal remains available as a separate option.' : 'Payment details are handled securely by PayPal.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )

  if (!PAYPAL_CLIENT_ID) return checkoutContent

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
      {checkoutContent}
    </PayPalScriptProvider>
  )
}
