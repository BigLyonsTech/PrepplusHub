import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackdrop from '@/components/PageBackdrop'
import Reveal from '@/components/Reveal'
import { Select } from '@/components/ui/Input'
import { fetchVendorOrders, updateOrderStatus } from '@/store/slices/catalogSlice'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/utils'

const NEXT_STATUSES = {
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const STATUS_LABELS = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const STATUS_BADGE = {
  PROCESSING: 'bg-amber/15 text-amber',
  SHIPPED: 'bg-leaf/15 text-leaf-dim',
  OUT_FOR_DELIVERY: 'bg-leaf/15 text-leaf-dim',
  DELIVERED: 'bg-emerald/15 text-emerald',
  CANCELLED: 'bg-coral/15 text-coral',
}

export default function VendorOrdersPage() {
  const dispatch = useDispatch()
  const orders = useSelector((s) => s.catalog.vendorOrders)
  const status = useSelector((s) => s.catalog.vendorOrdersStatus)
  const error = useSelector((s) => s.catalog.vendorOrdersError)

  useEffect(() => {
    dispatch(fetchVendorOrders())
  }, [dispatch])

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-10">
        <Reveal>
          <h1 className="font-display text-3xl font-semibold mb-1">Manage orders</h1>
          <p className="text-onLight/50 text-sm mb-8">
            Orders containing at least one of your products.
          </p>
        </Reveal>

        {status === 'loading' ? (
          <p className="text-sm text-onLight/45">Loading your orders…</p>
        ) : status === 'failed' ? (
          <div>
            <p className="text-sm text-coral mb-2">{error || "Couldn't load your orders."}</p>
            <button
              onClick={() => dispatch(fetchVendorOrders())}
              className="text-xs font-medium bg-onLight/5 hover:bg-onLight/10 text-onLight/70 rounded-full px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-onLight/45">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </PageBackdrop>
  )
}

function OrderRow({ order }) {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const nextOptions = NEXT_STATUSES[order.status] || []
  const [next, setNext] = useState(nextOptions[0] || '')
  const [saving, setSaving] = useState(false)

  async function handleUpdate() {
    if (!next) return
    setSaving(true)
    const result = await dispatch(updateOrderStatus({ id: order.id, status: next }))
    setSaving(false)
    if (!updateOrderStatus.fulfilled.match(result)) {
      showToast(result.payload || 'Could not update order status', 'error')
    }
  }

  return (
    <div className="bg-surface border border-onLight/10 rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to={`/orders/${order.id}`} className="font-medium text-sm hover:text-leaf">
            {order.deliveryAddress?.fullName || 'Order'} · #{order.id.slice(-8)}
          </Link>
          <div className="text-xs text-onLight/45 mt-0.5">
            {order.items?.length} item{order.items?.length === 1 ? '' : 's'} · ₦{order.total.toLocaleString()} ·{' '}
            {new Date(order.placedAt).toLocaleDateString()}
          </div>
        </div>
        <span className={cn('text-xs font-medium rounded-full px-3 py-1.5 shrink-0', STATUS_BADGE[order.status])}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {nextOptions.length > 0 && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-onLight/10">
          <Select value={next} onChange={(e) => setNext(e.target.value)} className="w-auto h-9 text-xs">
            {nextOptions.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="text-xs font-medium bg-ink text-white rounded-full px-4 py-2 hover:bg-black disabled:opacity-50"
          >
            {saving ? 'Updating…' : 'Update status'}
          </button>
        </div>
      )}
    </div>
  )
}
