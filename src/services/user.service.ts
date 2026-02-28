import { get, post, put, del, getPaginated } from './api'
import type { User } from '../types'

export interface UserRequestDTO {
  name: string; email: string; password: string; age: number
  gender: string; address: string; companyId?: number; role?: number
}

export interface UserUpdateDTO {
  name: string; age: number; gender: string
  address: string; companyId?: number; role?: number
}

export const userService = {
  getAll: (params?: object) => getPaginated<User>('/api/v1/users', params),
  getById: (id: number) => get<User>(`/api/v1/users/${id}`),
  create: (data: UserRequestDTO) => post<User>('/api/v1/users', data),
  update: (id: number, data: UserUpdateDTO) => put<string>(`/api/v1/users/${id}`, data),
  remove: (id: number) => del(`/api/v1/users/${id}`),
}
