import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackdrop from '@/components/PageBackdrop'
import { addToCart, fetchProducts } from '@/store/slices/catalogSlice'
import { useToast } from '@/components/ToastProvider'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'

export default function ProductsBrowse() {
  const products = useSelector((s) => s.catalog.products)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const catalogStatus = useSelector((s) => s.catalog.status)
  const catalogError = useSelector((s) => s.catalog.error)
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const filtered = category ? products.filter((p) => p.category === category) : products

  useEffect(() => {
    dispatch(fetchProducts(category || undefined))
  }, [dispatch, category])

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-12">
        <h1 className="font-display text-3xl font-semibold mb-1">Browse products</h1>
        <p className="text-onLight/50 text-sm mb-6">No account needed — sign up when you're ready to buy.</p>
        {category && (
          <button
            onClick={() => setParams({})}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-leaf/10 text-leaf-dim rounded-full px-3 py-1.5 mb-6 hover:bg-leaf/15"
          >
            {category} <X size={12} />
          </button>
        )}
        {catalogStatus === 'loading' && products.length === 0 && (
          <p className="text-sm text-onLight/45 mb-6">Loading products…</p>
        )}
        {catalogStatus === 'failed' && products.length === 0 && (
          <div className="mb-6">
            <p className="text-sm text-coral mb-2">{catalogError || "Couldn't load products."}</p>
            <button
              onClick={() => dispatch(fetchProducts(category || undefined))}
              className="text-xs font-medium bg-onLight/5 hover:bg-onLight/10 text-onLight/70 rounded-full px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
          return (
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
            </motion.div>
          )})}
        </div>
      </div>
      <Footer />
    </PageBackdrop>
  )
}
