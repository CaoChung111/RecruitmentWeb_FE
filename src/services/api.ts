import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'
import { notification } from 'antd'
import type { ApiResponse, ApiError, PaginatedResponse } from '../types'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  const url = config.url || ''
  
  const isAuthEndpoint = url.includes('/auth/login') || 
                         url.includes('/auth/register') || 
                         url.includes('/auth/refresh') ||
                         url.includes('/auth/verify-otp');

  if (token && !isAuthEndpoint) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean }
    const url = original?.url || ''
    const status = err.response?.status
    const errorData = err.response?.data as ApiError | undefined

    // Backend ResponseError format: { status, error, message, path, timestamp }
    // Backend ResponseData format (success): { status, message, data }
    const errorTitle = errorData?.error || 'Error'
    const errorMessage = errorData?.message || err.message

    // 1. Handle /auth/login — interceptor shows notification
    if (url.includes('/auth/login')) {
      if (status === 401 || status === 400) {
        const msgLower = errorMessage.toLowerCase()
        if (msgLower.includes('disabled') || msgLower.includes('v\u00f4 hi\u1ec7u h\u00f3a')) {
          notification.error({
            message: 'Account Disabled',
            description: 'Your account has been disabled. Please contact the administrator.',
            duration: 5,
          })
        } else {
          notification.error({
            message: 'Login Failed',
            description: errorMessage === 'Bad credentials' ? 'Incorrect email or password.' : errorMessage,
          })
        }
      } else {
        notification.error({ message: 'System Error', description: errorMessage })
      }
      return Promise.reject(err)
    }

    // 2. Handle /auth/register and /auth/verify-otp — let the component handle error display
    if (url.includes('/auth/register') || url.includes('/auth/verify-otp')) {
      return Promise.reject(err)
    }

    // If refresh token call itself fails, redirect to login immediately
    if (url.includes('/auth/refresh')) {
      return Promise.reject(err)
    }

    // 2. Handle 401 (Token expired): Attempt token refresh
    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers!['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      
      try {
        const { data } = await api.get('/api/v1/auth/refresh')
        const newToken = data.data?.access_token || data.data?.accessToken 
        
        localStorage.setItem('access_token', newToken)
        processQueue(null, newToken)
        original.headers!['Authorization'] = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr)
        localStorage.removeItem('access_token')
        
        notification.error({ 
          message: 'Session Expired', 
          description: 'Please log in again to continue.' 
        })
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // 3. Handle 403: Forbidden
    if (status === 403) {
      notification.error({
        message: 'Access Denied',
        description: errorMessage || 'You do not have permission to perform this action.',
      })
      return Promise.reject(err)
    }

    // 4. Handle 400: Validation / Bad Request — show detailed message from backend
    if (status === 400) {
      notification.error({
        message: errorTitle || 'Validation Error',
        description: errorMessage,
        duration: 6,
        placement: 'topRight',
      })
      return Promise.reject(err)
    }

    // 5. Handle other errors (500, 404, etc.)
    if (status !== 401) {
      notification.error({
        message: errorTitle || 'Error',
        description: errorMessage,
        placement: 'topRight',
      })
    }

    return Promise.reject(err)
  }
)

export const get = <T>(url: string, params?: object) =>
  api.get<ApiResponse<T>>(url, { params }).then((r) => r.data.data)

export const post = <T>(url: string, body?: unknown) =>
  api.post<ApiResponse<T>>(url, body).then((r) => r.data.data)

export const put = <T>(url: string, body?: unknown) =>
  api.put<ApiResponse<T>>(url, body).then((r) => r.data.data)

export const patch = <T>(url: string, body?: unknown) =>
  api.patch<ApiResponse<T>>(url, body).then((r) => r.data.data)

export const del = (url: string) =>
  api.delete<ApiResponse<string>>(url).then((r) => r.data.message)

export const getPaginated = <T>(url: string, params?: object) =>
  api.get<ApiResponse<PaginatedResponse<T>>>(url, { params }).then((r) => r.data.data)

export const uploadFile = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<ApiResponse<string>>('/api/v1/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

export default api