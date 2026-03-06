import { get, post, put, del, getPaginated } from './api'
import type { Company } from '../types'

export interface CompanyRequestDTO {
  name: string; description: string; address: string; logo: string
}

export const companyService = {
  getAll: (params?: object) => getPaginated<Company>('/api/v1/companies', params),
  getById: (id: number) => get<Company>(`/api/v1/companies/${id}`),
  create: (data: CompanyRequestDTO) => post<Company>('/api/v1/companies', data),
  update: (id: number, data: CompanyRequestDTO) => put<string>(`/api/v1/companies/${id}`, data),
  softDelete: (id: number) => del(`/api/v1/companies/${id}`),
  getInactive: (params?: object) => getPaginated<Company>('/api/v1/companies/trash', params),
  restore: (id: number) => put<string>(`/api/v1/companies/${id}/restore`, {}),
}
