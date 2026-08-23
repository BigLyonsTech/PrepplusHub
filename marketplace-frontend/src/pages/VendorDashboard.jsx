import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Lock, PlusCircle, Wallet, Package, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import Reveal from '@/components/Reveal'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import FormError from '@/components/ui/FormError'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import { fetchVendorProducts, createProduct } from '@/store/slices/catalogSlice'
import { CATEGORY_TINTS } from '@/lib/categoryTints'
import { cn } from '@/lib/utils'

const categories = Object.keys(CATEGORY_TINTS).filter((c) => c !== 'default')

export default function VendorDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const vendorProducts = useSelector((s) => s.catalog.vendorProducts)
  const vendorProductsStatus = useSelector((s) => s.catalog.vendorProductsStatus)
  const status = user?.vendorVerificationStatus || 'unsubmitted'
  const verified = status === 'verified'

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: categories[0],
    description: '',
    image: '',
  })

  useEffect(() => {
    if (verified && user?.id) dispatch(fetchVendorProducts(user.id))
  }, [dispatch, verified, user?.id])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const result = await dispatch(
      createProduct({
        name: form.name,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        description: form.description || undefined,
        image: form.image || undefined,
      }),
    )
    setSaving(false)
    if (createProduct.fulfilled.match(result)) {
      setForm({ name: '', price: '', originalPrice: '', category: categories[0], description: '', image: '' })
      setShowForm(false)
    } else {
      setError(result.payload || 'Could not create product')
    }
  }

  const actions = [
    { icon: PlusCircle, label: 'Add a product', locked: !verified, onClick: () => setShowForm(true) },
    { icon: Wallet, label: 'View payouts', locked: !verified, onClick: () => navigate('/vendor/payouts') },
    { icon: Package, label: 'Manage orders', locked: !verified, onClick: () => navigate('/vendor/orders') },
  ]

  const statusBadge = {
    verified: { label: 'Verified vendor', className: 'bg-emerald/15 text-emerald' },
    pending: { label: 'Verification pending', className: 'bg-amber/15 text-amber' },
    rejected: { label: 'Application rejected', className: 'bg-coral/15 text-coral' },
    unsubmitted: { label: 'Application incomplete', className: 'bg-coral/15 text-coral' },
  }[status]

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-semibold mb-1">
          {user?.vendorEligibility?.businessName || 'Your shop'}
        </h1>
        <div className="flex items-center gap-2 mb-8">
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', statusBadge.className)}>
            {statusBadge.label}
          </span>
        </div>

        {status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber/10 border border-amber/25 text-onLight/70 text-sm rounded-2xl p-5 mb-8 max-w-xl"
          >
            Your application is still under review. You can explore the dashboard shell below, but
            listing products and accessing payouts stay locked until you're verified.
          </motion.div>
        )}

        {status === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coral/10 border border-coral/25 text-onLight/70 text-sm rounded-2xl p-5 mb-8 max-w-xl"
          >
            <p className="mb-2">
              Your vendor application wasn't approved
              {user?.vendorEligibility?.rejectionReason ? ':' : '.'}
            </p>
            {user?.vendorEligibility?.rejectionReason && (
              <p className="text-onLight/85 font-medium mb-3">
                "{user.vendorEligibility.rejectionReason}"
              </p>
            )}
            <Link to="/onboarding/vendor" className="text-coral font-medium underline">
              Update and resubmit your application
            </Link>
          </motion.div>
        )}

        {status === 'unsubmitted' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coral/10 border border-coral/25 text-onLight/70 text-sm rounded-2xl p-5 mb-8 max-w-xl"
          >
            <p className="mb-3">You haven't submitted your vendor eligibility form yet.</p>
            <Link to="/onboarding/vendor" className="text-coral font-medium underline">
              Complete your application
            </Link>
          </motion.div>
        )}

        <Reveal className="grid sm:grid-cols-3 gap-5">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={a.locked}
              onClick={a.onClick}
              title={a.locked ? "Unlocks once you're verified" : undefined}
              className={cn(
                'text-left p-6 rounded-2xl border bg-surface flex flex-col items-start gap-4',
                a.locked
                  ? 'opacity-50 border-onLight/10 cursor-not-allowed'
                  : 'border-onLight/10 hover:border-leaf/40 cursor-pointer',
              )}
            >
              <div className="flex items-center justify-between w-full">
                <a.icon size={22} className="text-leaf" />
                {a.locked && <Lock size={14} className="text-onLight/35" />}
              </div>
              <span className="text-sm font-medium">{a.label}</span>
            </button>
          ))}
        </Reveal>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreate}
            className="mt-6 bg-surface border border-onLight/10 rounded-2xl p-6 max-w-xl relative"
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-onLight/5"
              aria-label="Close"
            >
              <X size={16} className="text-onLight/40" />
            </button>
            <h3 className="font-display text-lg font-semibold mb-5">Add a product</h3>
            <div className="space-y-4">
              <Field label="Product name">
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (NGN)">
                  <Input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Original price (optional)" hint="Shows as a discount">
                  <Input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => update('originalPrice', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Category">
                <Select value={form.category} onChange={(e) => update('category', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Description (optional)">
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-surface text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf"
                />
              </Field>
              <Field label="Image URL (optional)" hint="Leave blank to use a category icon for now">
                <Input value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://…" />
              </Field>
            </div>
            <FormError className="mt-4">{error}</FormError>
            <Button type="submit" size="lg" className="w-full mt-6" disabled={saving}>
              {saving ? 'Adding…' : 'Add product'}
            </Button>
          </motion.form>
        )}

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold mb-4">Your products</h2>
          {!verified ? (
            <p className="text-sm text-onLight/45">Your products will show up here once you're verified.</p>
          ) : vendorProductsStatus === 'loading' ? (
            <p className="text-sm text-onLight/45">Loading your products…</p>
          ) : vendorProductsStatus === 'failed' ? (
            <div>
              <p className="text-sm text-coral mb-2">Couldn't load your products.</p>
              <button
                onClick={() => dispatch(fetchVendorProducts(user.id))}
                className="text-xs font-medium bg-onLight/5 hover:bg-onLight/10 text-onLight/70 rounded-full px-4 py-2 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : vendorProducts.length === 0 ? (
            <p className="text-sm text-onLight/45">You haven't listed any products yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {vendorProducts.map((p) => (
                <div key={p.id} className="bg-surface border border-onLight/10 rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3]">
                    <ProductThumb product={p} />
                  </div>
                  <div className="p-4">
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-onLight/45 mt-0.5">{p.category}</div>
                    <div className="mt-2">
                      <PriceTag product={p} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageBackdrop>
  )
}
