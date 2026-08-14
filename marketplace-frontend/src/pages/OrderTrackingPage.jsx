import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackdrop from '@/components/PageBackdrop'
import Reveal from '@/components/Reveal'
import OrderStatusStepper from '@/components/OrderStatusStepper'
import { fetchOrder } from '@/store/slices/catalogSlice'

export default function OrderTrackingPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const order = useSelector((s) => s.catalog.currentOrder?.id === id ? s.catalog.currentOrder : null)
  const orderStatus = useSelector((s) => s.catalog.orderStatus)
  const orderError = useSelector((s) => s.catalog.orderError)

  useEffect(() => {
    dispatch(fetchOrder(id))
  }, [dispatch, id])

  if (orderStatus === 'loading' && !order) {
    return (
      <PageBackdrop>
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Loading…</div>
      </PageBackdrop>
    )
  }

  if (orderStatus === 'failed' && !order) {
    return (
      <PageBackdrop>
        <Navbar />
        <div className="container-page py-24 text-center text-coral text-sm">
          {orderError || "Couldn't load this order."}
        </div>
      </PageBackdrop>
    )
  }

  if (!order) return null

  const addr = order.deliveryAddress

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-12">
        <Reveal>
          <span className="text-xs font-medium text-onLight/40">Order #{order.id.slice(-8)}</span>
          <h1 className="font-display text-3xl font-semibold mt-1 mb-1">Track your order</h1>
          <p className="text-onLight/50 text-sm mb-10">
            Placed {new Date(order.placedAt).toLocaleDateString()} · ₦{order.total.toLocaleString()}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10">
          <Reveal className="bg-surface border border-onLight/10 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold mb-5">Status</h2>
            <OrderStatusStepper status={order.status} statusHistory={order.statusHistory} />
          </Reveal>

          <Reveal delay={0.06} className="flex flex-col gap-6">
            <div className="bg-surface border border-onLight/10 rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Delivery address</h2>
              <div className="flex gap-3">
                <MapPin size={18} className="text-leaf shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">{addr?.fullName}</div>
                  <div className="text-onLight/65 mt-0.5">{addr?.address}</div>
                  <div className="text-onLight/45 mt-0.5">{addr?.phone}</div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-onLight/10 rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Items</h2>
              <div className="flex flex-col gap-3">
                {order.items.map((line) => (
                  <div key={line.productId} className="flex justify-between text-sm">
                    <span>{line.productName} × {line.quantity}</span>
                    <span className="text-onLight/60">₦{(line.unitPrice * line.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <Footer />
    </PageBackdrop>
  )
}
