// Shared order-status display logic — the underlying OrderStatus enum and
// transition rules are identical for delivery and pickup orders (see
// backend OrderService.ALLOWED_TRANSITIONS); only the labels differ, since
// "out for delivery"/"delivered" don't make sense for something being
// collected in person.

export const STATUS_STEPS = [
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', pickupLabel: 'Ready for pickup' },
  { key: 'DELIVERED', label: 'Delivered', pickupLabel: 'Picked up' },
]

const BASE_LABELS = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const PICKUP_LABEL_OVERRIDES = {
  OUT_FOR_DELIVERY: 'Ready for pickup',
  DELIVERED: 'Picked up',
}

export function statusLabel(status, fulfillmentType) {
  if (fulfillmentType === 'PICKUP' && PICKUP_LABEL_OVERRIDES[status]) {
    return PICKUP_LABEL_OVERRIDES[status]
  }
  return BASE_LABELS[status] || status
}

export const STATUS_BADGE_CLASS = {
  PROCESSING: 'bg-amber/15 text-amber',
  SHIPPED: 'bg-leaf/15 text-leaf-dim',
  OUT_FOR_DELIVERY: 'bg-leaf/15 text-leaf-dim',
  DELIVERED: 'bg-emerald/15 text-emerald',
  CANCELLED: 'bg-coral/15 text-coral',
}
