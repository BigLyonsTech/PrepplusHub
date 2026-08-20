import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { UploadCloud, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import Button from '@/components/ui/Button'
import BackButton from '@/components/ui/BackButton'
import { Field, Input, Select } from '@/components/ui/Input'
import FormError from '@/components/ui/FormError'
import { submitVendorEligibility } from '@/store/slices/authSlice'

const categories = ['Fashion & Accessories', 'Electronics', 'Home & Living', 'Beauty', 'Food & Groceries']
const ranges = ['1–10 SKUs', '10–50 SKUs', '50–100 SKUs', '100+ SKUs']

export default function VendorEligibilityFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const existing = user?.vendorEligibility
  const [form, setForm] = useState({
    businessName: existing?.businessName || '',
    businessCategory: existing?.businessCategory || categories[0],
    expectedProductRange: existing?.expectedProductRange || ranges[0],
    idDoc: null,
    businessDoc: null,
  })

  const alreadyPending = user?.vendorVerificationStatus === 'pending' || user?.vendorVerificationStatus === 'verified'
  const rejected = user?.vendorVerificationStatus === 'rejected'

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await dispatch(
      submitVendorEligibility({
        businessName: form.businessName,
        businessCategory: form.businessCategory,
        expectedProductRange: form.expectedProductRange,
        documentUrls: [form.idDoc?.name, form.businessDoc?.name].filter(Boolean),
      }),
    )
    setLoading(false)
    if (!submitVendorEligibility.fulfilled.match(result)) {
      setError(result.payload || 'Submission failed')
    }
  }

  if (alreadyPending) {
    return (
      <PageBackdrop>
        <Navbar />
        <div className="container-page py-24 flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-amber/15 flex items-center justify-center mb-8"
          >
            <Clock size={30} className="text-amber" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-3">
            {user?.vendorVerificationStatus === 'verified'
              ? "You're verified"
              : 'Your application is under review'}
          </h1>
          <p className="text-onLight/55 max-w-md mb-10">
            {user?.vendorVerificationStatus === 'verified'
              ? 'You can list products and manage payouts from your dashboard.'
              : 'Typically within a few hours. You can log in and look around your dashboard while you wait — listing products and payouts unlock once you\'re verified.'}
          </p>
          <Button size="lg" onClick={() => navigate('/vendor/dashboard')}>
            Go to my dashboard
          </Button>
        </div>
      </PageBackdrop>
    )
  }

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page pt-6">
        <BackButton to="/role-confirmation" />
      </div>
      <div className="container-page py-16 flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-surface border border-onLight/10 rounded-3xl p-8 md:p-10"
        >
          <h1 className="font-display text-3xl font-semibold mb-1">
            {rejected ? 'Update your application' : 'Vendor eligibility'}
          </h1>
          {rejected && (
            <div className="bg-coral/10 border border-coral/25 rounded-xl p-4 mb-6 text-sm text-onLight/70">
              <p className="mb-1">Your previous application wasn't approved{existing?.rejectionReason ? ':' : '.'}</p>
              {existing?.rejectionReason && (
                <p className="text-onLight/85 font-medium">"{existing.rejectionReason}"</p>
              )}
            </div>
          )}
          <p className="text-onLight/50 mb-8 text-sm">
            A few details about your business, plus identity documents for verification.
          </p>

          <div className="space-y-5">
            <Field label="Business name">
              <Input
                required
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Business category">
                <Select value={form.businessCategory} onChange={(e) => update('businessCategory', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Expected product range">
                <Select
                  value={form.expectedProductRange}
                  onChange={(e) => update('expectedProductRange', e.target.value)}
                >
                  {ranges.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Government ID">
              <label className="flex items-center gap-3 p-4 border border-dashed border-onLight/20 rounded-xl cursor-pointer hover:border-leaf/40">
                <UploadCloud size={18} className="text-onLight/40" />
                <span className="text-sm text-onLight/60">
                  {form.idDoc?.name || 'Upload ID document (filename only for now)'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => update('idDoc', e.target.files?.[0] || null)}
                />
              </label>
            </Field>
            <Field label="Business registration (optional)">
              <label className="flex items-center gap-3 p-4 border border-dashed border-onLight/20 rounded-xl cursor-pointer hover:border-leaf/40">
                <UploadCloud size={18} className="text-onLight/40" />
                <span className="text-sm text-onLight/60">
                  {form.businessDoc?.name || 'Upload CAC / registration doc'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => update('businessDoc', e.target.files?.[0] || null)}
                />
              </label>
            </Field>
          </div>

          <FormError className="mt-4">{error}</FormError>

          <Button type="submit" size="lg" className="w-full mt-8" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit for review'}
          </Button>
        </motion.form>
      </div>
    </PageBackdrop>
  )
}
