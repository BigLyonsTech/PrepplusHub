import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, MapPin, Minus, Phone, Plus, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import FormError from '@/components/ui/FormError'
import ProgressBar from '@/components/ui/ProgressBar'
import {
  checkout,
  guestCheckout,
  fetchCart,
  fetchProducts,
  removeFromCart,
  removeFromCartLocal,
  setCartQuantityLocal,
  updateCartQuantity,
} from '@/store/slices/catalogSlice'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/utils'

const STORE_ADDRESS = '23 Bisiriyu Lawal St, Shasha, Lagos 100275, Lagos Nigeria'
const STORE_PHONES = ['091-355-55567', '091-373-59114']

// Mirrors the backend's OrderService pricing exactly, so this preview
// matches what checkout will actually charge. Packaging is a real per-order
// cost and is folded silently into "Shipping" rather than its own line.
const PACKAGING_FEE = 500
const DELIVERY_FEE = 2500
const FREE_DELIVERY_THRESHOLD = 50000

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js'

function loadPaystackScript() {
  if (window.PaystackPop) return Promise.resolve()
  const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`)
  if (existing) {
    return new Promise((resolve) => existing.addEventListener('load', resolve, { once: true }))
  }
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_SRC
    script.async = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

export default function CheckoutFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const products = useSelector((s) => s.catalog.products)
  const user = useSelector((s) => s.auth.user)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [placed, setPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [fulfillmentType, setFulfillmentType] = useState('DELIVERY')
  const [delivery, setDelivery] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    // Guests never had a server cart to fetch — their cart lives in Redux
    // (seeded from localStorage), so only authenticated checkout needs this.
    const tasks = [dispatch(fetchProducts())]
    if (isAuthenticated) tasks.push(dispatch(fetchCart()))
    Promise.all(tasks).finally(() => setInitialLoading(false))
  }, [dispatch, isAuthenticated])

  const subtotal = cart.reduce((sum, c) => {
    const p = products.find((p) => p.id === c.productId)
    return sum + (p ? p.price * c.quantity : 0)
  }, 0)
  const deliveryFee = fulfillmentType === 'PICKUP' || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const shippingFee = deliveryFee + PACKAGING_FEE
  const total = subtotal + shippingFee

  function handleRemove(productId) {
    if (isAuthenticated) {
      dispatch(removeFromCart(productId))
        .unwrap()
        .catch((message) => showToast(message || 'Could not remove that item', 'error'))
    } else {
      dispatch(removeFromCartLocal(productId))
    }
  }

  function handleQuantityChange(productId, quantity) {
    if (quantity <= 0) {
      handleRemove(productId)
      return
    }
    if (isAuthenticated) {
      dispatch(updateCartQuantity({ productId, quantity }))
        .unwrap()
        .catch((message) => showToast(message || 'Could not update that item', 'error'))
    } else {
      dispatch(setCartQuantityLocal({ productId, quantity }))
    }
  }

  async function placeOrder(paymentReference) {
    setLoading(true)
    setError('')
    const shared = {
      fullName: delivery.fullName,
      address: fulfillmentType === 'DELIVERY' ? delivery.address : undefined,
      phone: delivery.phone,
      fulfillmentType,
      paymentReference,
    }
    const result = isAuthenticated
      ? await dispatch(checkout(shared))
      : await dispatch(guestCheckout({ ...shared, email: delivery.email, items: cart }))
    setLoading(false)
    const succeeded = isAuthenticated ? checkout.fulfilled.match(result) : guestCheckout.fulfilled.match(result)
    if (succeeded) {
      setPlaced(true)
    } else {
      setError(result.payload || 'Checkout failed')
    }
  }

  async function payWithPaystack() {
    setError('')
    if (!PAYSTACK_PUBLIC_KEY) {
      setError('Payments are not configured yet — please contact us to complete this order.')
      return
    }
    setLoading(true)
    await loadPaystackScript()
    if (!window.PaystackPop) {
      setLoading(false)
      setError('Could not load the payment popup. Please try again.')
      return
    }
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: isAuthenticated ? user?.email : delivery.email,
      amount: Math.round(total * 100),
      currency: 'NGN',
      callback: (response) => {
        placeOrder(response.reference)
      },
      onClose: () => {
        setLoading(false)
      },
    })
    handler.openIframe()
  }

  if (placed) {
    return (
      <PageBackdrop>
        <Navbar />
        <div className="container-page py-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6"
          >
            <Check size={28} className="text-emerald" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Order placed</h1>
          <p className="text-onLight/50 mb-8">We&apos;ll email you a confirmation shortly.</p>
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? '/customer/dashboard' : '/products')}
          >
            {isAuthenticated ? 'Back to dashboard' : 'Continue shopping'}
          </Button>
        </div>
      </PageBackdrop>
    )
  }

  if (!initialLoading && cart.length === 0) {
    return (
      <PageBackdrop>
        <Navbar />
        <div className="container-page py-24 text-center">
          <p className="text-onLight/50 mb-6">Your cart is empty.</p>
          <Button size="lg" onClick={() => navigate('/products')}>
            Browse products
          </Button>
        </div>
      </PageBackdrop>
    )
  }

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-14 grid md:grid-cols-[1fr_320px] gap-12">
        <div className="max-w-lg">
          <ProgressBar step={step} total={3} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">How should we get this to you?</h2>

                <div className="flex gap-2 mb-2">
                  {[
                    { key: 'DELIVERY', label: 'Deliver to me' },
                    { key: 'PICKUP', label: 'Pick up in store' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFulfillmentType(opt.key)}
                      className={cn(
                        'flex-1 text-sm font-medium rounded-xl border py-3 transition-colors',
                        fulfillmentType === opt.key
                          ? 'border-leaf bg-leaf/8 text-leaf-dim'
                          : 'border-onLight/15 text-onLight/60 hover:border-onLight/25',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <Field label="Full name">
                  <Input
                    placeholder="Ada Obi"
                    value={delivery.fullName}
                    onChange={(e) => setDelivery((d) => ({ ...d, fullName: e.target.value }))}
                    required
                  />
                </Field>

                {!isAuthenticated && (
                  <Field label="Email" hint="So we can send your order confirmation — no account needed">
                    <Input
                      type="email"
                      placeholder="ada@example.com"
                      value={delivery.email}
                      onChange={(e) => setDelivery((d) => ({ ...d, email: e.target.value }))}
                      required
                    />
                  </Field>
                )}

                {fulfillmentType === 'DELIVERY' ? (
                  <Field label="Address">
                    <Input
                      placeholder="Street, city, state"
                      value={delivery.address}
                      onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                      required
                    />
                  </Field>
                ) : (
                  <div className="rounded-xl border border-onLight/10 bg-paper p-4 space-y-2">
                    <div className="flex gap-2 text-sm">
                      <MapPin size={16} className="text-leaf shrink-0 mt-0.5" />
                      <span className="text-onLight/70">{STORE_ADDRESS}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Phone size={16} className="text-leaf shrink-0 mt-0.5" />
                      <span className="text-onLight/70">{STORE_PHONES.join(' · ')}</span>
                    </div>
                  </div>
                )}

                <Field label="Phone">
                  <Input
                    placeholder="+234 800 000 0000"
                    value={delivery.phone}
                    onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                    required
                  />
                </Field>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-4">Review your order</h2>
                <div className="flex flex-col gap-2">
                  {cart.map((c) => {
                    const p = products.find((p) => p.id === c.productId)
                    if (!p) return null
                    return (
                      <div key={c.productId} className="flex justify-between items-center text-sm bg-surface border border-onLight/10 rounded-lg p-3">
                        <span>{p.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-onLight/15 rounded-full">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(c.productId, c.quantity - 1)}
                              aria-label={`Decrease quantity of ${p.name}`}
                              className="p-1.5 rounded-full hover:bg-onLight/5"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{c.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(c.productId, c.quantity + 1)}
                              aria-label={`Increase quantity of ${p.name}`}
                              className="p-1.5 rounded-full hover:bg-onLight/5"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span>₦{(p.price * c.quantity).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemove(c.productId)}
                            aria-label={`Remove ${p.name} from cart`}
                            className="shrink-0 p-1 rounded-full hover:bg-onLight/5"
                          >
                            <X size={14} className="text-onLight/40" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex justify-between text-sm text-onLight/60 px-3 pt-2">
                    <span>Shipping</span><span>₦{shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold px-3 pt-1 border-t border-onLight/10 mt-1">
                    <span>Total</span><span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">Payment</h2>
                <p className="text-sm text-onLight/50 mb-2">
                  You&apos;ll be asked to pay ₦{total.toLocaleString()} securely via Paystack.
                </p>
                <Button size="lg" className="w-full" disabled={loading} onClick={payWithPaystack}>
                  {loading ? 'Waiting for payment…' : `Pay ₦${total.toLocaleString()} with Paystack`}
                </Button>
                <FormError className="mt-4">{error}</FormError>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <Button variant="outline" disabled={loading} onClick={() => setStep(step - 1)}>Back</Button>
            ) : <span />}
            {step < 3 && (
              <Button
                disabled={
                  step === 1 &&
                  (!delivery.fullName ||
                    !delivery.phone ||
                    (!isAuthenticated && !delivery.email) ||
                    (fulfillmentType === 'DELIVERY' && !delivery.address))
                }
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            )}
          </div>
        </div>

        <aside className="bg-surface border border-onLight/10 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          {initialLoading ? (
            <p className="text-sm text-onLight/45">Loading order summary…</p>
          ) : (
            <>
              <div className="flex justify-between text-sm text-onLight/60 mb-2">
                <span>Items</span><span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-onLight/60 mb-2">
                <span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-onLight/60 mb-2">
                <span>Shipping</span><span>₦{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10">
                <span>Total</span><span>₦{total.toLocaleString()}</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </PageBackdrop>
  )
}
