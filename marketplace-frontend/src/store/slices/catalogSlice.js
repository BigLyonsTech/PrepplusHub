import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

const GUEST_CART_KEY = 'prepplushub_guest_cart'

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGuestCart(cart) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch {
    // best-effort only — a guest cart is a convenience, not durable state
  }
}

export const fetchProducts = createAsyncThunk('catalog/fetchProducts', async (category, { rejectWithValue }) => {
  try {
    return await api.getProducts(category || undefined)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchProduct = createAsyncThunk('catalog/fetchProduct', async (id, { rejectWithValue }) => {
  try {
    return await api.getProduct(id)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchVendorProducts = createAsyncThunk(
  'catalog/fetchVendorProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getMyProducts()
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const createProduct = createAsyncThunk('catalog/createProduct', async (body, { rejectWithValue }) => {
  try {
    return await api.createProduct(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const updateProduct = createAsyncThunk(
  'catalog/updateProduct',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      return await api.updateProduct(id, body)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const deactivateProduct = createAsyncThunk(
  'catalog/deactivateProduct',
  async (id, { rejectWithValue }) => {
    try {
      return await api.deactivateProduct(id)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const activateProduct = createAsyncThunk(
  'catalog/activateProduct',
  async (id, { rejectWithValue }) => {
    try {
      return await api.activateProduct(id)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchCart = createAsyncThunk('catalog/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await api.getCart()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const addToCart = createAsyncThunk('catalog/addToCart', async (productId, { rejectWithValue }) => {
  try {
    return await api.addToCart(productId)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const removeFromCart = createAsyncThunk(
  'catalog/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      return await api.removeFromCart(productId)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const clearCart = createAsyncThunk('catalog/clearCart', async (_, { rejectWithValue }) => {
  try {
    return await api.clearCart()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchWishlist = createAsyncThunk('catalog/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    return await api.getWishlist()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const addToWishlist = createAsyncThunk(
  'catalog/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      return await api.addToWishlist(productId)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const removeFromWishlist = createAsyncThunk(
  'catalog/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      return await api.removeFromWishlist(productId)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchOrders = createAsyncThunk('catalog/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    return await api.getOrders()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchOrder = createAsyncThunk('catalog/fetchOrder', async (id, { rejectWithValue }) => {
  try {
    return await api.getOrder(id)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchVendorOrders = createAsyncThunk(
  'catalog/fetchVendorOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getVendorOrders()
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const updateOrderStatus = createAsyncThunk(
  'catalog/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await api.updateOrderStatus(id, status)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchVendorPayouts = createAsyncThunk(
  'catalog/fetchVendorPayouts',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getVendorPayouts()
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const checkout = createAsyncThunk('catalog/checkout', async (body, { rejectWithValue }) => {
  try {
    return await api.checkout(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const guestCheckout = createAsyncThunk('catalog/guestCheckout', async (body, { rejectWithValue }) => {
  try {
    return await api.guestCheckout(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchProductReviews = createAsyncThunk(
  'catalog/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      return { productId, reviews: await api.getProductReviews(productId) }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchVendorReviews = createAsyncThunk(
  'catalog/fetchVendorReviews',
  async (vendorId, { rejectWithValue }) => {
    try {
      return { vendorId, reviews: await api.getVendorReviews(vendorId) }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const addProductReview = createAsyncThunk(
  'catalog/addProductReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      return await api.addProductReview(productId, { rating, comment })
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const addVendorReview = createAsyncThunk(
  'catalog/addVendorReview',
  async ({ vendorId, rating, comment, orderId }, { rejectWithValue }) => {
    try {
      return await api.addVendorReview(vendorId, { rating, comment, orderId })
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

const initialState = {
  products: [],
  currentProduct: null,
  vendorProducts: [],
  vendorProductsStatus: 'idle',
  // Seeded from localStorage so a guest's cart survives a page refresh —
  // overwritten by the server cart the moment fetchCart succeeds (logged in).
  cart: loadGuestCart(),
  cartStatus: 'idle',
  cartError: null,
  wishlist: [],
  wishlistStatus: 'idle',
  wishlistError: null,
  productReviews: [],
  vendorReviews: [],
  orders: [],
  ordersStatus: 'idle',
  ordersError: null,
  currentOrder: null,
  orderStatus: 'idle',
  orderError: null,
  vendorOrders: [],
  vendorOrdersStatus: 'idle',
  vendorOrdersError: null,
  vendorPayouts: { earned: 0, paidOut: 0, balance: 0, payouts: [] },
  vendorPayoutsStatus: 'idle',
  vendorPayoutsError: null,
  status: 'idle',
  error: null,
}

function replaceOrderIn(list, order) {
  const idx = list.findIndex((o) => o.id === order.id)
  if (idx >= 0) list[idx] = order
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    // Guest cart — kept client-side only (localStorage) until guest checkout
    // sends it inline, or fetchCart.fulfilled overwrites it after login.
    addToCartLocal(state, action) {
      const existing = state.cart.find((c) => c.productId === action.payload)
      if (existing) existing.quantity += 1
      else state.cart.push({ productId: action.payload, quantity: 1 })
      saveGuestCart(state.cart)
    },
    removeFromCartLocal(state, action) {
      state.cart = state.cart.filter((c) => c.productId !== action.payload)
      saveGuestCart(state.cart)
    },
    clearCartLocal(state) {
      state.cart = []
      saveGuestCart([])
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.products = action.payload || []
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load products'
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload
        const idx = state.products.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.products[idx] = action.payload
        else state.products.push(action.payload)
      })
      .addCase(fetchVendorProducts.pending, (state) => {
        state.vendorProductsStatus = 'loading'
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.vendorProductsStatus = 'succeeded'
        state.vendorProducts = action.payload || []
      })
      .addCase(fetchVendorProducts.rejected, (state) => {
        state.vendorProductsStatus = 'failed'
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.vendorProducts = [action.payload, ...state.vendorProducts]
        state.products = [action.payload, ...state.products]
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const replaceIn = (list) => {
          const idx = list.findIndex((p) => p.id === action.payload.id)
          if (idx >= 0) list[idx] = action.payload
        }
        replaceIn(state.vendorProducts)
        replaceIn(state.products)
      })
      .addCase(deactivateProduct.fulfilled, (state, action) => {
        const idx = state.vendorProducts.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.vendorProducts[idx] = action.payload
        state.products = state.products.filter((p) => p.id !== action.payload.id)
      })
      .addCase(activateProduct.fulfilled, (state, action) => {
        const idx = state.vendorProducts.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.vendorProducts[idx] = action.payload
      })
      .addCase(fetchCart.pending, (state) => {
        state.cartStatus = 'loading'
        state.cartError = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartStatus = 'succeeded'
        state.cart = action.payload || []
        saveGuestCart([]) // server cart is authoritative once logged in
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.cartStatus = 'failed'
        state.cartError = action.payload || 'Failed to load your cart'
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.wishlistStatus = 'loading'
        state.wishlistError = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlistStatus = 'succeeded'
        state.wishlist = action.payload || []
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.wishlistStatus = 'failed'
        state.wishlistError = action.payload || 'Failed to load your wishlist'
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload || []
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload || []
      })
      .addCase(fetchOrders.pending, (state) => {
        state.ordersStatus = 'loading'
        state.ordersError = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersStatus = 'succeeded'
        state.orders = action.payload || []
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersStatus = 'failed'
        state.ordersError = action.payload || 'Failed to load your orders'
      })
      .addCase(fetchOrder.pending, (state) => {
        state.orderStatus = 'loading'
        state.orderError = null
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.orderStatus = 'succeeded'
        state.currentOrder = action.payload
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.orderStatus = 'failed'
        state.orderError = action.payload || 'Failed to load this order'
      })
      .addCase(fetchVendorOrders.pending, (state) => {
        state.vendorOrdersStatus = 'loading'
        state.vendorOrdersError = null
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.vendorOrdersStatus = 'succeeded'
        state.vendorOrders = action.payload || []
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.vendorOrdersStatus = 'failed'
        state.vendorOrdersError = action.payload || 'Failed to load your orders'
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        replaceOrderIn(state.vendorOrders, action.payload)
        replaceOrderIn(state.orders, action.payload)
        if (state.currentOrder?.id === action.payload.id) state.currentOrder = action.payload
      })
      .addCase(fetchVendorPayouts.pending, (state) => {
        state.vendorPayoutsStatus = 'loading'
        state.vendorPayoutsError = null
      })
      .addCase(fetchVendorPayouts.fulfilled, (state, action) => {
        state.vendorPayoutsStatus = 'succeeded'
        state.vendorPayouts = action.payload || { earned: 0, paidOut: 0, balance: 0, payouts: [] }
      })
      .addCase(fetchVendorPayouts.rejected, (state, action) => {
        state.vendorPayoutsStatus = 'failed'
        state.vendorPayoutsError = action.payload || 'Failed to load your payouts'
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.cart = []
        if (action.payload) {
          state.orders = [action.payload, ...state.orders]
        }
      })
      .addCase(guestCheckout.fulfilled, (state) => {
        state.cart = []
        saveGuestCart([])
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        const { productId, reviews } = action.payload
        state.productReviews = [
          ...state.productReviews.filter((r) => r.productId !== productId),
          ...reviews,
        ]
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        const { vendorId, reviews } = action.payload
        state.vendorReviews = [
          ...state.vendorReviews.filter((r) => r.vendorId !== vendorId),
          ...reviews,
        ]
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.productReviews = [action.payload, ...state.productReviews]
      })
      .addCase(addVendorReview.fulfilled, (state, action) => {
        state.vendorReviews = [action.payload, ...state.vendorReviews]
      })
  },
})

export const { addToCartLocal, removeFromCartLocal, clearCartLocal } = catalogSlice.actions
export default catalogSlice.reducer
