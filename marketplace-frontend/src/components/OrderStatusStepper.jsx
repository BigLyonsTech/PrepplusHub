import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
]

export default function OrderStatusStepper({ status, statusHistory = [] }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 bg-coral/10 border border-coral/25 rounded-2xl p-5">
        <XCircle size={22} className="text-coral shrink-0" />
        <div>
          <div className="font-medium text-sm text-coral">Order cancelled</div>
          {historyAt(statusHistory, 'CANCELLED') && (
            <div className="text-xs text-onLight/45 mt-0.5">
              {formatDate(historyAt(statusHistory, 'CANCELLED'))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const at = historyAt(statusHistory, step.key)
        const done = i <= currentIdx
        const isLast = i === STEPS.length - 1
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 size={20} className="text-leaf shrink-0" />
              ) : (
                <Circle size={20} className="text-onLight/20 shrink-0" />
              )}
              {!isLast && <div className={cn('w-px flex-1 my-1', done ? 'bg-leaf' : 'bg-onLight/15')} />}
            </div>
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <div className={cn('text-sm font-medium', done ? 'text-onLight' : 'text-onLight/40')}>
                {step.label}
              </div>
              {at && <div className="text-xs text-onLight/45 mt-0.5">{formatDate(at)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function historyAt(statusHistory, key) {
  return statusHistory.find((e) => e.status === key)?.at
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
