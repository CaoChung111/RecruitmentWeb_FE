import { get, post } from './api'
import type { AuthUser, LoginPayload, LoginResponse, RegisterPayload } from '../types'

export const authService = {
  login: (payload: LoginPayload) =>
    post<LoginResponse>('/api/v1/auth/login', payload),

  register: (payload: RegisterPayload) =>
    post<AuthUser>('/api/v1/auth/register', payload),

  getAccount: () => get<LoginResponse>('/api/v1/auth/account'),

  refresh: () => get<LoginResponse>('/api/v1/auth/refresh'),

  logout: () => post<string>('/api/v1/auth/logout'),
}
