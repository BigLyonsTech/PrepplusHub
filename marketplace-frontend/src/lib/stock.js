// Mirrors InventoryService on the backend: a null/undefined stock means the
// listing isn't stock-tracked and can be bought in any quantity.
export const LOW_STOCK_THRESHOLD = 5

export const isStockTracked = (product) => product?.stock != null

export const isOutOfStock = (product) => isStockTracked(product) && product.stock <= 0

export const maxPurchasable = (product) => (isStockTracked(product) ? Math.max(0, product.stock) : Infinity)

/** Short customer-facing label, or null when stock isn't worth mentioning. */
export function stockLabel(product) {
  if (!isStockTracked(product)) return null
  if (product.stock <= 0) return 'Out of stock'
  if (product.stock <= LOW_STOCK_THRESHOLD) return `Only ${product.stock} left`
  return null
}
