import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export const fetchAdminDashboard = createAsyncThunk(
  'admin/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await api.adminDashboard()
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const approveVendor = createAsyncThunk(
  'admin/approveVendor',
  async (vendorId, { rejectWithValue }) => {
    try {
      await api.approveVendor(vendorId)
      return vendorId
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const rejectVendor = createAsyncThunk(
  'admin/rejectVendor',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await api.rejectVendor(id, reason)
      return { id, reason }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const toggleFeaturedCategory = createAsyncThunk(
  'admin/toggleFeatured',
  async (category, { rejectWithValue }) => {
    try {
      return await api.toggleFeaturedCategory(category)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

const initialState = {
  vendorQueue: [],
  customerQueue: [],
  activityLog: [],
  dashboardCuration: {
    featuredCategories: [],
    banners: [],
  },
  status: 'idle',
  error: null,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.vendorQueue = action.payload.vendorQueue || []
        state.customerQueue = action.payload.customerQueue || []
        state.activityLog = action.payload.activityLog || []
        state.dashboardCuration = action.payload.dashboardCuration || {
          featuredCategories: [],
          banners: [],
        }
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load admin dashboard'
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        const v = state.vendorQueue.find((x) => x.id === action.payload)
        if (v) v.status = 'verified'
        state.vendorQueue = state.vendorQueue.filter((x) => x.status === 'pending')
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        const v = state.vendorQueue.find((x) => x.id === action.payload.id)
        if (v) {
          v.status = 'rejected'
          v.rejectionReason = action.payload.reason
        }
        state.vendorQueue = state.vendorQueue.filter((x) => x.status === 'pending')
      })
      .addCase(toggleFeaturedCategory.fulfilled, (state, action) => {
        state.dashboardCuration.featuredCategories = action.payload.featuredCategories || []
        state.dashboardCuration.banners = action.payload.banners || state.dashboardCuration.banners
      })
  },
})

export default adminSlice.reducer
