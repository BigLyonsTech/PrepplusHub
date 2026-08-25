const API_BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'prepplushub_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const REQUEST_TIMEOUT_MS = 15000

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (e) {
    const err = new Error(
      e.name === 'AbortError'
        ? 'The request timed out. Please check your connection and try again.'
        : 'Unable to reach the server. Please check your connection and try again.',
    )
    err.status = 0
    err.network = true
    throw err
  } finally {
    clearTimeout(timeout)
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    const message = data?.message || res.statusText || 'Request failed'
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (email) => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => request('/auth/me'),

  // User onboarding / profile
  confirmRole: (role) => request('/users/role', { method: 'POST', body: JSON.stringify({ role }) }),
  personalization: (body) =>
    request('/users/personalization', { method: 'POST', body: JSON.stringify(body) }),
  vendorEligibility: (body) =>
    request('/users/vendor-eligibility', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Catalog
  getProducts: (category) =>
    request(category ? `/products?category=${encodeURIComponent(category)}` : '/products'),
  getProduct: (id) => request(`/products/${id}`),
  getVendorProducts: (vendorId) => request(`/products/vendor/${vendorId}`),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (productId) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromCart: (productId) => request(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  getVendorOrders: () => request('/orders/vendor/mine'),
  checkout: (body) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
  guestCheckout: (body) => request('/orders/guest-checkout', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Payouts
  getVendorPayouts: () => request('/vendor/payouts'),
  getAdminPayouts: () => request('/admin/payouts'),
  recordPayout: (vendorId, body) =>
    request(`/admin/payouts/${vendorId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  addToWishlist: (productId) =>
    request('/wishlist/items', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId) => request(`/wishlist/items/${productId}`, { method: 'DELETE' }),

  // Reviews
  getProductReviews: (productId) => request(`/reviews/products/${productId}`),
  getVendorReviews: (vendorId) => request(`/reviews/vendors/${vendorId}`),
  addProductReview: (productId, body) =>
    request(`/reviews/products/${productId}`, { method: 'POST', body: JSON.stringify(body) }),
  addVendorReview: (vendorId, body) =>
    request(`/reviews/vendors/${vendorId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  adminDashboard: () => request('/admin/dashboard'),
  approveVendor: (vendorId) => request(`/admin/vendors/${vendorId}/approve`, { method: 'POST' }),
  rejectVendor: (vendorId, reason) =>
    request(`/admin/vendors/${vendorId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  toggleFeaturedCategory: (category) =>
    request(`/admin/featured-categories/${encodeURIComponent(category)}/toggle`, {
      method: 'POST',
    }),

  health: () => request('/health'),

  // Chat support
  chat: (body) => request('/chat', { method: 'POST', body: JSON.stringify(body) }),
}
