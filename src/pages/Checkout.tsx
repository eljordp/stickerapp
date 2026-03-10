import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ArrowLeft, Lock, ShieldCheck, Loader2, Tag, X, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { checkoutSchema, type CheckoutFormErrors } from '@/lib/validation'
import { supabase } from '@/lib/supabase'
import { linkReferral } from '@/lib/referrals'
import { sendOrderEmail } from '@/lib/email'
import { toast } from 'sonner'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'

interface CustomerInfo {
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
  const { items, total, clearCart, markConverted, promoCode, promoDiscount, promoLabel, applyPromo, removePromo, finalizePromo } = useCart()
  const navigate = useNavigate()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
  })
  const [formValid, setFormValid] = useState(false)
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [paymentError, setPaymentError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState(false)

  const finalTotal = Math.max(0, +(total - promoDiscount).toFixed(2))

  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl font-black mb-4">Nothing to Checkout</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty.</p>
          <Link to="/order" className="btn-primary">Make Custom Stickers</Link>
        </div>
      </section>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...customerInfo, [e.target.name]: e.target.value }
    setCustomerInfo(updated)

    const result = checkoutSchema.safeParse(updated)
    if (result.success) {
      setErrors({})
      setFormValid(true)
    } else {
      setFormValid(false)
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

  const saveOrder = async (orderId: string) => {
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: { ...customerInfo },
      items: items.map(i => ({ ...i })),
      total: finalTotal.toFixed(2),
      subtotal: total.toFixed(2),
      promoCode: promoCode || undefined,
      promoDiscount: promoDiscount > 0 ? promoDiscount.toFixed(2) : undefined,
      status: 'completed' as const,
    }

    const prev = JSON.parse(localStorage.getItem('tss-orders') || '[]')
    localStorage.setItem('tss-orders', JSON.stringify([order, ...prev]))

    try {
      await supabase.from('orders').insert({
        id: orderId,
        customer_first_name: customerInfo.firstName.trim(),
        customer_last_name: customerInfo.lastName.trim(),
        customer_email: customerInfo.email.trim(),
        customer_phone: customerInfo.phone.trim(),
        customer_address: customerInfo.address.trim(),
        customer_city: customerInfo.city.trim(),
        customer_state: customerInfo.state.trim(),
        customer_zip: customerInfo.zip.trim(),
        items: items.map(i => ({ ...i })),
        total: parseFloat(finalTotal.toFixed(2)),
        status: 'completed',
      })
    } catch {
      // localStorage backup already saved
    }
  }

  const inputClass = (field: keyof CustomerInfo) =>
    `w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${errors[field] ? 'border-destructive' : 'border-border'}`

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
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
                    <label htmlFor="checkout-phone" className="block text-sm font-medium text-muted-foreground mb-1.5">Phone *</label>
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

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkout-address" className="block text-sm font-medium text-muted-foreground mb-1.5">Street Address *</label>
                    <input
                      id="checkout-address"
                      type="text" name="address" value={customerInfo.address}
                      onChange={handleChange} onBlur={() => handleBlur('address')}
                      className={inputClass('address')}
                      placeholder="123 Main St" autoComplete="street-address"
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
                        placeholder="Sacramento" autoComplete="address-level2"
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
                        placeholder="CA" autoComplete="address-level1"
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
                        placeholder="95814" autoComplete="postal-code"
                      />
                      {errors.zip && <p className="text-sm text-destructive mt-1">{errors.zip}</p>}
                    </div>
                  </div>
                </div>
              </div>

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

              {/* PayPal Payment */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-2">Payment</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Lock size={14} aria-hidden="true" /> Secured by PayPal
                </div>

                {!formValid && (
                  <p className="text-sm text-muted-foreground mb-4 bg-muted/50 rounded-xl p-4">
                    Fill out all fields above to enable payment.
                  </p>
                )}

                {paymentError && (
                  <div className="text-sm text-destructive mb-4 bg-destructive/10 rounded-xl p-4" role="alert">
                    {paymentError}
                  </div>
                )}

                {processing && (
                  <div className="flex items-center justify-center gap-3 py-6">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-muted-foreground">Processing payment...</span>
                  </div>
                )}

                <div className={!formValid || processing ? 'opacity-40 pointer-events-none' : ''}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 50 }}
                    disabled={!formValid}
                    createOrder={(_data, actions) => {
                      return actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{
                          description: orderDescription.substring(0, 127),
                          amount: {
                            currency_code: 'USD',
                            value: finalTotal.toFixed(2),
                            breakdown: {
                              item_total: { currency_code: 'USD', value: total.toFixed(2) },
                              discount: promoDiscount > 0
                                ? { currency_code: 'USD', value: promoDiscount.toFixed(2) }
                                : undefined,
                            },
                          },
                          items: items.map(item => ({
                            name: item.name.substring(0, 127),
                            unit_amount: { currency_code: 'USD', value: ((item.price + (item.addOns?.reduce((a, b) => a + b.price, 0) || 0))).toFixed(2) },
                            quantity: item.quantity.toString(),
                            description: `${item.option} · ${item.size}`.substring(0, 127),
                            category: 'PHYSICAL_GOODS' as const,
                          })),
                          shipping: {
                            name: { full_name: `${customerInfo.firstName} ${customerInfo.lastName}` },
                            address: {
                              address_line_1: customerInfo.address,
                              admin_area_2: customerInfo.city,
                              admin_area_1: customerInfo.state,
                              postal_code: customerInfo.zip,
                              country_code: 'US',
                            },
                          },
                        }],
                      })
                    }}
                    onApprove={async (_data, actions) => {
                      setProcessing(true)
                      setPaymentError('')
                      try {
                        const details = await actions.order!.capture()
                        finalizePromo()
                        await saveOrder(details.id!)
                        await markConverted()

                        // CRM: create/update customer + link referral
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
                              _order_id: details.id!,
                              _total: parseFloat(finalTotal.toFixed(2)),
                            })
                          }
                        } catch { /* CRM is non-blocking */ }
                        clearCart()
                        // Send order confirmation emails
                        sendOrderEmail({
                          orderId: details.id!,
                          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                          email: customerInfo.email.trim(),
                          items: items.map(i => ({ ...i })),
                          total: finalTotal.toFixed(2),
                          address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
                        })

                        toast.success('Payment successful!')
                        navigate('/order-confirmation', {
                          state: {
                            orderId: details.id!,
                            payerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                            email: customerInfo.email,
                            total: finalTotal.toFixed(2),
                          },
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
                  <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-green-400">Free</span></div>
                  <div className="flex justify-between text-xl font-black pt-2 border-t border-border"><span>Total</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={16} className="text-green-400 shrink-0" aria-hidden="true" />
                  <span>Your payment is protected by PayPal Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PayPalScriptProvider>
  )
}
