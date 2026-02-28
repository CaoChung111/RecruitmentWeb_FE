import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../../services/auth.service'
import type { AuthState, LoginPayload } from '../../types'
import type { RootState } from '../index'

// Hàm helper: Lọc bỏ các quyền bị trùng lặp
const processUserInfo = (userInfo: any) => {
  if (userInfo?.role?.permissions && Array.isArray(userInfo.role.permissions)) {
    const uniqueMap = new Map();
    userInfo.role.permissions.forEach((p: any) => {
      if (p?.id) uniqueMap.set(p.id, p);
    });
    userInfo.role.permissions = Array.from(uniqueMap.values());
  }
  return userInfo;
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const data = await authService.login(payload)
      localStorage.setItem('access_token', data!.accessToken)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Login failed')
    }
  }
)

export const fetchAccountThunk = createAsyncThunk(
  'auth/fetchAccount',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getAccount()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout().catch(() => {})
  localStorage.removeItem('access_token')
})

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: false,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (s) => { s.loading = true })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading = false
        s.accessToken = a.payload!.accessToken
        s.user = processUserInfo(a.payload!.userInfo) // Đã áp dụng lọc quyền
        s.isAuthenticated = true
      })
      .addCase(loginThunk.rejected, (s) => { s.loading = false })

    builder
      .addCase(fetchAccountThunk.pending, (s) => { s.loading = true })
      .addCase(fetchAccountThunk.fulfilled, (s, a) => {
        s.loading = false
        s.user = processUserInfo(a.payload!.userInfo) // Đã áp dụng lọc quyền
        s.isAuthenticated = true
      })
      .addCase(fetchAccountThunk.rejected, (s) => { s.loading = false })

    builder.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null
      s.accessToken = null
      s.isAuthenticated = false
    })
  },
})

export const { setToken, clearAuth } = authSlice.actions
export const selectAuth = (s: RootState) => s.auth
export const selectUser = (s: RootState) => s.auth.user
export const selectIsAuth = (s: RootState) => s.auth.isAuthenticated

export default authSlice.reducer