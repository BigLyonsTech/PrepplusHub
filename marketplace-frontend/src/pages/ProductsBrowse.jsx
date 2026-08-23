import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackdrop from '@/components/PageBackdrop'
import { addToCart, fetchProducts, fetchWishlist } from '@/store/slices/catalogSlice'
import { useToast } from '@/components/ToastProvider'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import WishlistButton from '@/components/WishlistButton'
import { CATEGORY_TINTS } from '@/lib/categoryTints'

const SWIPE_OFFSET_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 500

export default function ProductsBrowse() {
  const products = useSelector((s) => s.catalog.products)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const catalogStatus = useSelector((s) => s.catalog.status)
  const catalogError = useSelector((s) => s.catalog.error)
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const [params, setParams] = useSearchParams()
  const [direction, setDirection] = useState(1)
  const category = params.get('category')
  const filtered = category ? products.filter((p) => p.category === category) : products

  // Fetch the full catalog once (not re-scoped per category) so swiping
  // between categories is instant client-side filtering, not a round-trip.
  useEffect(() => {
    dispatch(fetchProducts())
    if (isAuthenticated) dispatch(fetchWishlist())
  }, [dispatch, isAuthenticated])

  const activeCategories = useMemo(() => {
    const present = new Set(products.map((p) => p.category))
    return Object.keys(CATEGORY_TINTS).filter((c) => c !== 'default' && present.has(c))
  }, [products])

  const currentIndex = category ? activeCategories.indexOf(category) : -1
  const canSwipe = category && activeCategories.length > 1

  function goToCategory(index) {
    const wrapped = (index + activeCategories.length) % activeCategories.length
    setDirection(index > currentIndex ? 1 : -1)
    setParams({ category: activeCategories[wrapped] })
  }

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-12">
        <h1 className="font-display text-3xl font-semibold mb-1">Browse products</h1>
        <p className="text-onLight/50 text-sm mb-6">No account needed — sign up when you're ready to buy.</p>

        {category && (
          <div className="flex items-center gap-2 mb-2">
            {canSwipe && (
              <button
                onClick={() => goToCategory(currentIndex - 1)}
                aria-label="Previous category"
                className="p-1.5 rounded-full bg-onLight/5 hover:bg-onLight/10 text-onLight/50"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            <button
              onClick={() => setParams({})}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-leaf/10 text-leaf-dim rounded-full px-3 py-1.5 hover:bg-leaf/15"
            >
              {category} <X size={12} />
            </button>
            {canSwipe && (
              <button
                onClick={() => goToCategory(currentIndex + 1)}
                aria-label="Next category"
                className="p-1.5 rounded-full bg-onLight/5 hover:bg-onLight/10 text-onLight/50"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
        {canSwipe && (
          <p className="text-xs text-onLight/35 mb-6">Swipe or use the arrows to browse the next category</p>
        )}
        {!category && <div className="mb-6" />}

        {catalogStatus === 'loading' && products.length === 0 && (
          <p className="text-sm text-onLight/45 mb-6">Loading products…</p>
        )}
        {catalogStatus === 'failed' && products.length === 0 && (
          <div className="mb-6">
            <p className="text-sm text-coral mb-2">{catalogError || "Couldn't load products."}</p>
            <button
              onClick={() => dispatch(fetchProducts())}
              className="text-xs font-medium bg-onLight/5 hover:bg-onLight/10 text-onLight/70 rounded-full px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={category || 'all'}
            custom={direction}
            initial={{ opacity: 0, x: 40 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * direction }}
            transition={{ duration: 0.25 }}
            drag={canSwipe ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
                goToCategory(currentIndex + 1)
              } else if (info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
                goToCategory(currentIndex - 1)
              }
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="bg-surface border border-onLight/10 rounded-2xl overflow-hidden"
              >
                <Link to={`/products/${p.id}`} className="block aspect-[4/3]">
                  <ProductThumb product={p} />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${p.id}`} className="font-medium text-sm hover:text-leaf">
                    {p.name}
                  </Link>
                  <div className="text-xs text-onLight/45 mt-0.5">{p.vendor}</div>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <PriceTag product={p} />
                    <div className="flex items-center gap-1">
                      <WishlistButton productId={p.id} />
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            window.location.href = '/auth?intent=customer'
                            return
                          }
                          dispatch(addToCart(p.id))
                            .unwrap()
                            .catch((message) => showToast(message || 'Could not add that to your cart', 'error'))
                        }}
                        className="shrink-0 text-xs font-medium bg-ink text-white rounded-full px-3 py-1.5 hover:bg-black"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
    </PageBackdrop>
  )
}
