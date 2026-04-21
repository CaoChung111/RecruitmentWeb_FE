import { get, post } from './api'
import type { LoginPayload, LoginResponse, RegisterPayload } from '../types'

export const authService = {
  login: (payload: LoginPayload) =>
    post<LoginResponse>('/api/v1/auth/login', payload),

  register: (payload: RegisterPayload) =>
    post<any>('/api/v1/auth/register', payload),

  verifyOtp: (email: string, otp: string) =>
    post<any>('/api/v1/auth/verify-otp', { email, otp }),

  getAccount: () => get<LoginResponse>('/api/v1/auth/account'),
  refresh: () => get<LoginResponse>('/api/v1/auth/refresh'),
  logout: () => post<string>('/api/v1/auth/logout'),
}