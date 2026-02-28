import { get, post, put, del, getPaginated } from './api'
import type { Role, Permission } from '../types'

export interface RoleRequestDTO {
  name: string; description: string; active: boolean; permissions: number[]
}

export interface PermissionRequestDTO {
  name: string; apiPath: string; method: string; module: string
}

export const roleService = {
  getAll: (params?: object) => getPaginated<Role>('/api/v1/roles', params),
  getById: (id: number) => get<Role>(`/api/v1/roles/${id}`),
  create: (data: RoleRequestDTO) => post<Role>('/api/v1/roles', data),
  update: (id: number, data: RoleRequestDTO) => put<string>(`/api/v1/roles/${id}`, data),
  remove: (id: number) => del(`/api/v1/roles/${id}`),
}

export const permissionService = {
  getAll: (params?: object) => getPaginated<Permission>('/api/v1/permissions', params),
  getById: (id: number) => get<Permission>(`/api/v1/permissions/${id}`),
  create: (data: PermissionRequestDTO) => post<Permission>('/api/v1/permissions', data),
  update: (id: number, data: PermissionRequestDTO) =>
    put<string>(`/api/v1/permissions/${id}`, data),
  remove: (id: number) => del(`/api/v1/permissions/${id}`),
}
