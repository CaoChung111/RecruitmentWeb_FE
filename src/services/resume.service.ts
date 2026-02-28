import { get, post, patch, del, getPaginated } from './api'
import type { Resume, ResumeStatus } from '../types'

export interface ResumeRequestDTO {
  email: string; url: string; status: string
  userId: number; jobId: number
}

export const resumeService = {
  getAll: (params?: object) => getPaginated<Resume>('/api/v1/resumes', params),
  getById: (id: number) => get<Resume>(`/api/v1/resumes/${id}`),
  getByUser: (params?: object) => getPaginated<Resume>('/api/v1/resumes/by-user', params),
  create: (data: ResumeRequestDTO) => post<Resume>('/api/v1/resumes', data),
  updateStatus: (id: number, status: ResumeStatus) =>
    patch<string>(`/api/v1/resumes/${id}`, { status }),
  remove: (id: number) => del(`/api/v1/resumes/${id}`),
}
