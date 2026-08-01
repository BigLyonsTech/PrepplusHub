import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

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
  async (vendorId, { rejectWithValue }) => {
    try {
      return await api.getVendorProducts(vendorId)
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

export const fetchOrders = createAsyncThunk('catalog/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    return await api.getOrders()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const checkout = createAsyncThunk('catalog/checkout', async (body, { rejectWithValue }) => {
  try {
    return await api.checkout(body)
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
  cart: [],
  productReviews: [],
  vendorReviews: [],
  orders: [],
  status: 'idle',
  error: null,
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    // Optimistic local add when not logged in — UI can still preview
    addToCartLocal(state, action) {
      const existing = state.cart.find((c) => c.productId === action.payload)
      if (existing) existing.quantity += 1
      else state.cart.push({ productId: action.payload, quantity: 1 })
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
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
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
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload || []
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.cart = []
        if (action.payload) {
          state.orders = [action.payload, ...state.orders]
        }
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

export const { addToCartLocal } = catalogSlice.actions
export default catalogSlice.reducer
