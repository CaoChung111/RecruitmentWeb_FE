import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'
import { notification } from 'antd'
import type { ApiResponse, PaginatedResponse } from '../types'

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
    const errorData = err.response?.data as any
    const errorMessage = errorData?.message || err.message

    // 🔥 1. XỬ LÝ RIÊNG CHO ĐĂNG NHẬP / ĐĂNG KÝ
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify-otp')) {
      if (status === 401 || status === 400) {
        const msgLower = errorMessage.toLowerCase();
        if (msgLower.includes('vô hiệu hóa') || msgLower.includes('disabled')) {
          notification.error({ 
            message: 'Tài khoản bị khóa', 
            description: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin.',
            duration: 5
          })
        } else {
          notification.error({ 
            message: 'Đăng nhập thất bại', 
            description: errorMessage === 'Bad credentials' ? 'Email hoặc mật khẩu không chính xác' : errorMessage 
          })
        }
      } else {
        notification.error({ message: 'Lỗi hệ thống', description: errorMessage })
      }
      return Promise.reject(err)
    }

    // Nếu lỗi là do gọi refresh token thất bại thì văng ra login luôn, không lặp vô hạn
    if (url.includes('/auth/refresh')) {
      return Promise.reject(err)
    }

    // 2. Xử lý 401 (Hết hạn token): Gọi Refresh Token
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
            message: "Phiên đăng nhập hết hạn", 
            description: "Vui lòng đăng nhập lại để tiếp tục." 
        })
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // 3. Xử lý 403: Forbidden (Không có quyền)
    if (status === 403) {
      notification.error({
        message: "Truy cập bị từ chối",
        description: errorMessage || "Bạn không có quyền thực hiện thao tác này.",
      });
      return Promise.reject(err);
    }

    // 4. Các lỗi khác (500, 404, 400...)
    if (status !== 401) {
      notification.error({ message: 'Lỗi', description: errorMessage, placement: 'topRight' })
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