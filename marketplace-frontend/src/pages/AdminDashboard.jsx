import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, X, Activity, LayoutGrid } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import {
  approveVendor,
  rejectVendor,
  toggleFeaturedCategory,
  fetchAdminDashboard,
} from '@/store/slices/adminSlice'
import { useToast } from '@/components/ToastProvider'
import FormError from '@/components/ui/FormError'
import { cn } from '@/lib/utils'

const sections = ['Vendor Queue', 'Approved Vendors', 'Customer Queue', 'Activity Log', 'Dashboard Curation']

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const { vendorQueue, approvedVendors, customerQueue, activityLog, dashboardCuration, status, error } = useSelector(
    (s) => s.admin,
  )
  const [section, setSection] = useState(sections[0])
  const [rejectingId, setRejectingId] = useState(null)
  const [reason, setReason] = useState('')
  const { showToast } = useToast()

  const allCategories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports']

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (user?.role === 'admin') dispatch(fetchAdminDashboard())
  }, [dispatch, user])

  if (user && user.role !== 'admin') return null

  function submitReject(id) {
    dispatch(rejectVendor({ id, reason: reason || 'Did not meet eligibility criteria.' }))
      .unwrap()
      .catch((message) => showToast(message || 'Could not reject that vendor', 'error'))
    setRejectingId(null)
    setReason('')
  }

  function submitApprove(id) {
    dispatch(approveVendor(id))
      .unwrap()
      .then(() => showToast('Vendor approved', 'success'))
      .catch((message) => showToast(message || 'Could not approve that vendor', 'error'))
  }

  function handleToggleFeatured(category) {
    dispatch(toggleFeaturedCategory(category))
      .unwrap()
      .catch((message) => showToast(message || 'Could not update featured categories', 'error'))
  }

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-10 grid md:grid-cols-[220px_1fr] gap-10">
        <aside className="flex md:flex-col gap-1 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={cn(
                'text-left px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                section === s ? 'bg-ink text-white' : 'text-onLight/60 hover:bg-onLight/5',
              )}
            >
              {s}
            </button>
          ))}
        </aside>

        <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'loading' && (
            <p className="text-sm text-onLight/45 mb-4">Loading admin data…</p>
          )}
          <FormError className="mb-4">{error}</FormError>

          {section === 'Vendor Queue' && (
            <div className="flex flex-col gap-4">
              {vendorQueue.filter((v) => v.status === 'pending').length === 0 && (
                <p className="text-sm text-onLight/45">No pending vendor applications.</p>
              )}
              {vendorQueue
                .filter((v) => v.status === 'pending')
                .map((v) => (
                  <div key={v.id} className="bg-surface border border-onLight/10 rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <h3 className="font-medium">{v.businessName || v.name}</h3>
                        <p className="text-xs text-onLight/45 mt-1">
                          {v.businessCategory} · {v.expectedProductRange}
                        </p>
                        <p className="text-xs text-onLight/35 mt-1">
                          Documents: {(v.documentUrls || []).join(', ') || 'none'}
                        </p>
                        <p className="text-xs text-onLight/35 mt-1">{v.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitApprove(v.id)}
                          className="flex items-center gap-1.5 text-xs font-medium bg-emerald/15 text-emerald rounded-full px-3 py-2"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(v.id)}
                          className="flex items-center gap-1.5 text-xs font-medium bg-coral/15 text-coral rounded-full px-3 py-2"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                    {rejectingId === v.id && (
                      <div className="mt-4 flex gap-2">
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Reason (shown to the vendor)"
                          className="flex-1 h-10 px-3 rounded-lg border border-onLight/15 text-sm outline-none focus:border-coral"
                        />
                        <button
                          onClick={() => submitReject(v.id)}
                          className="text-xs font-medium bg-coral text-white rounded-lg px-4"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {section === 'Approved Vendors' && (
            <div className="flex flex-col gap-4">
              {approvedVendors.length === 0 && (
                <p className="text-sm text-onLight/45">No approved vendors yet.</p>
              )}
              {approvedVendors.map((v) => (
                <div key={v.id} className="bg-surface border border-onLight/10 rounded-2xl p-5">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <h3 className="font-medium">{v.businessName || v.name}</h3>
                      <p className="text-xs text-onLight/45 mt-1">
                        {v.businessCategory} · {v.expectedProductRange}
                      </p>
                      <p className="text-xs text-onLight/35 mt-1">{v.email}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-medium bg-emerald/15 text-emerald rounded-full px-3 py-1.5">
                      <Check size={14} /> Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === 'Customer Queue' && (
            <div className="flex flex-col gap-3">
              {customerQueue.length === 0 && (
                <p className="text-sm text-onLight/45">No customer-side KYC reviews pending right now.</p>
              )}
              {customerQueue.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface border border-onLight/10 rounded-2xl p-5 flex justify-between items-center flex-wrap gap-3"
                >
                  <div>
                    <h3 className="font-medium">{c.name}</h3>
                    <p className="text-xs text-onLight/45 mt-1">{c.reason}</p>
                  </div>
                  <span className="text-xs font-medium bg-amber/15 text-amber rounded-full px-3 py-1.5">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}

          {section === 'Activity Log' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-onLight/40 mb-2 flex items-center gap-1.5">
                <Activity size={14} /> Audit trail — logins, orders, and listings only.
              </p>
              {activityLog.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between text-sm bg-surface border border-onLight/10 rounded-xl px-4 py-3"
                >
                  <span className="text-onLight/70">
                    User {a.userId} — {String(a.action).replace('_', ' ')}
                  </span>
                  <span className="text-onLight/35 text-xs">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {section === 'Dashboard Curation' && (
            <div>
              <p className="text-xs text-onLight/40 mb-4 flex items-center gap-1.5">
                <LayoutGrid size={14} /> Platform-level curation for the customer feed.
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleToggleFeatured(c)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm border transition-colors',
                      (dashboardCuration.featuredCategories || []).includes(c)
                        ? 'bg-leaf text-white border-leaf'
                        : 'border-onLight/15 text-onLight/60',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PageBackdrop>
  )
}
