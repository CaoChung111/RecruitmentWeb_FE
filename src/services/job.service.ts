import { get, post, put, del, getPaginated } from './api'
import type { Job, JobFilters, JobRequestDTO } from '../types'

export const jobService = {
  getAll: (filters?: JobFilters) =>
    getPaginated<Job>('/api/v1/jobs', filters),

  getCompanyJobs: (params?: object) =>
    getPaginated<Job>('/api/v1/jobs/company', params),

  getById: (id: number) => get<Job>(`/api/v1/jobs/${id}`),

  create: (data: JobRequestDTO) => post<Job>('/api/v1/jobs', data),

  update: (id: number, data: Partial<JobRequestDTO>) =>
    put<string>(`/api/v1/jobs/${id}`, data),

  remove: (id: number) => del(`/api/v1/jobs/${id}`),
}
