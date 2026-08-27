import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api, setToken, clearToken, getToken } from '@/lib/api'

function applyAuth(state, payload) {
  if (payload?.token) {
    setToken(payload.token)
    state.token = payload.token
  }
  if (payload?.user) {
    state.user = payload.user
    state.isAuthenticated = true
    state.pendingEmail = null
  }
}

export const registerUser = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    return await api.register(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const loginUser = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    return await api.login(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (body, { rejectWithValue }) => {
  try {
    return await api.verifyOtp(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (credential, { rejectWithValue }) => {
    try {
      return await api.googleAuth(credential)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    if (!getToken()) throw new Error('No session')
    return await api.me()
  } catch (e) {
    // Only treat this as "logged out" when the server actually rejected the
    // token (401/403). A network blip or a cold-starting backend shouldn't
    // silently sign the user out from under them.
    if (e.status === 401 || e.status === 403) clearToken()
    return rejectWithValue({ message: e.message, status: e.status })
  }
})

export const confirmRole = createAsyncThunk('auth/confirmRole', async (role, { rejectWithValue }) => {
  try {
    return await api.confirmRole(role)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const completePersonalization = createAsyncThunk(
  'auth/personalization',
  async (body, { rejectWithValue }) => {
    try {
      return await api.personalization(body)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const submitVendorEligibility = createAsyncThunk(
  'auth/vendorEligibility',
  async (body, { rejectWithValue }) => {
    try {
      return await api.vendorEligibility(body)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const updateProfile = createAsyncThunk('auth/updateProfile', async (body, { rejectWithValue }) => {
  try {
    return await api.updateProfile(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

const initialState = {
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken(),
  pendingEmail: null,
  registrationIntent: null,
  devOtp: null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRegistrationIntent(state, action) {
      state.registrationIntent = action.payload
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.pendingEmail = null
      state.devOtp = null
      state.error = null
      clearToken()
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.pendingEmail = action.payload.pendingEmail
        state.devOtp = action.payload.devOtp || null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed'
      })

      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload.pendingEmail && !action.payload.token) {
          state.pendingEmail = action.payload.pendingEmail
          state.devOtp = action.payload.devOtp || null
        } else {
          applyAuth(state, action.payload)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })

      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyAuth(state, action.payload)
        state.devOtp = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'OTP verification failed'
      })

      .addCase(loginWithGoogle.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyAuth(state, action.payload)
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Google sign-in failed'
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchMe.rejected, (state, action) => {
        const status = action.payload?.status
        if (status === 401 || status === 403) {
          state.user = null
          state.isAuthenticated = false
          state.token = null
        }
      })

      .addCase(confirmRole.fulfilled, (state, action) => {
        applyAuth(state, action.payload)
      })
      .addCase(completePersonalization.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(submitVendorEligibility.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { setRegistrationIntent, logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
