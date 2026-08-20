import { useState, useMemo, memo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import { addToCart, fetchProducts, fetchCart, fetchOrders } from '@/store/slices/catalogSlice'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ToastProvider'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import { statusLabel, STATUS_BADGE_CLASS } from '@/lib/orderStatus'

const tabs = ['For You', 'Cart', 'Orders']

export default function CustomerDashboard() {
  const user = useSelector((s) => s.auth.user)
  const products = useSelector((s) => s.catalog.products)
  const catalogStatus = useSelector((s) => s.catalog.status)
  const catalogError = useSelector((s) => s.catalog.error)
  const cart = useSelector((s) => s.catalog.cart)
  const cartStatus = useSelector((s) => s.catalog.cartStatus)
  const cartError = useSelector((s) => s.catalog.cartError)
  const orders = useSelector((s) => s.catalog.orders)
  const ordersStatus = useSelector((s) => s.catalog.ordersStatus)
  const ordersError = useSelector((s) => s.catalog.ordersError)
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const [tab, setTab] = useState('For You')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tasks = [dispatch(fetchCart()), dispatch(fetchOrders())]
    if (catalogStatus !== 'succeeded') tasks.push(dispatch(fetchProducts()))
    Promise.all(tasks).finally(() => setLoading(false))
    // Intentionally mount-only — including catalogStatus here would refetch every time it changes.
  }, [dispatch])

  function handleAdd(productId) {
    dispatch(addToCart(productId))
      .unwrap()
      .catch((message) => showToast(message || 'Could not add that to your cart', 'error'))
  }

  const interests = user?.personalizationProfile?.interests || []

  const feed = useMemo(() => {
    if (!interests.length) return products
    return [...products].sort(
      (a, b) => Number(interests.includes(b.category)) - Number(interests.includes(a.category)),
    )
  }, [products, interests])

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Hey{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-onLight/50 text-sm mt-1">
              {interests.length ? `Curated around ${interests.join(', ')}` : 'Your personalized feed'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-onLight/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t ? 'border-leaf text-leaf' : 'border-transparent text-onLight/45 hover:text-onLight/70',
              )}
            >
              {t} {t === 'Cart' && cart.length > 0 && `(${cart.length})`}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'For You' && (
            loading ? (
              <EmptyState text="Loading your feed…" />
            ) : catalogStatus === 'failed' ? (
              <FailedState
                text={catalogError || "Couldn't load products."}
                onRetry={() => dispatch(fetchProducts())}
              />
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {feed.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p.id)} />
                ))}
              </motion.div>
            )
          )}

          {tab === 'Cart' && (
            <motion.div key="cart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading ? (
                <EmptyState text="Loading your cart…" />
              ) : cartStatus === 'failed' ? (
                <FailedState
                  text={cartError || "Couldn't load your cart."}
                  onRetry={() => dispatch(fetchCart())}
                />
              ) : cart.length === 0 ? (
                <EmptyState text="Your cart is empty. Add something you actually want." />
              ) : (
                <div className="flex flex-col gap-3 max-w-xl">
                  {cart.map((c) => {
                    const p = products.find((p) => p.id === c.productId)
                    if (!p) return null
                    return (
                      <div key={c.productId} className="flex justify-between items-center bg-surface border border-onLight/10 rounded-xl p-4">
                        <div>
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-onLight/45">Qty {c.quantity}</div>
                        </div>
                        <div className="text-sm font-medium">₦{(p.price * c.quantity).toLocaleString()}</div>
                      </div>
                    )
                  })}
                  <Link to="/checkout" className="text-center bg-leaf text-white rounded-full py-3 mt-3 text-sm font-medium">
                    Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'Orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading ? (
                <EmptyState text="Loading your orders…" />
              ) : ordersStatus === 'failed' ? (
                <FailedState
                  text={ordersError || "Couldn't load your orders."}
                  onRetry={() => dispatch(fetchOrders())}
                />
              ) : orders.length === 0 ? (
                <EmptyState text="No orders yet. Once you check out, they'll show up here." />
              ) : (
                <div className="flex flex-col gap-3 max-w-xl">
                  {orders.map((o) => {
                    const first = o.items?.[0]
                    const title = first?.productName || products.find((p) => p.id === first?.productId)?.name || `Order ${o.id}`
                    const qty = o.items?.reduce((s, i) => s + i.quantity, 0) || 0
                    return (
                      <Link
                        key={o.id}
                        to={`/orders/${o.id}`}
                        className="flex justify-between items-center bg-surface border border-onLight/10 rounded-xl p-4 hover:border-leaf/30 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">{title}{o.items?.length > 1 ? ` +${o.items.length - 1}` : ''}</div>
                          <div className="text-xs text-onLight/45">
                            Qty {qty} · ₦{(o.total || 0).toLocaleString()} · {new Date(o.placedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={cn('text-xs font-medium rounded-full px-3 py-1.5', STATUS_BADGE_CLASS[o.status])}>
                          {statusLabel(o.status, o.fulfillmentType)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageBackdrop>
  )
}

const ProductCard = memo(function ProductCard({ product, onAdd }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-surface border border-onLight/10 rounded-2xl overflow-hidden group"
    >
      <Link to={`/products/${product.id}`} className="block aspect-[4/3]">
        <ProductThumb product={product} />
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="font-medium text-sm hover:text-leaf">
          {product.name}
        </Link>
        <div className="text-xs text-onLight/45 mt-0.5">{product.vendor}</div>
        <div className="flex items-center justify-between mt-3 gap-2">
          <PriceTag product={product} />
          <button
            onClick={onAdd}
            className="shrink-0 text-xs font-medium bg-ink text-white rounded-full px-3 py-1.5 hover:bg-black"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  )
})

function EmptyState({ text }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-onLight/45 text-sm">
      {text}
    </motion.div>
  )
}

function FailedState({ text, onRetry }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
      <p className="text-sm text-coral mb-3">{text}</p>
      <button
        onClick={onRetry}
        className="text-xs font-medium bg-onLight/5 hover:bg-onLight/10 text-onLight/70 rounded-full px-4 py-2 transition-colors"
      >
        Try again
      </button>
    </motion.div>
  )
}
