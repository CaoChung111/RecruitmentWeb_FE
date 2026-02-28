import { get, post, put, del, getPaginated } from './api'
import type { Skill } from '../types'

export const skillService = {
  getAll: (params?: object) => getPaginated<Skill>('/api/v1/skills', params),
  getById: (id: number) => get<Skill>(`/api/v1/skills/${id}`),
  create: (name: string) => post<Skill>('/api/v1/skills', { name }),
  update: (id: number, name: string) => put<string>(`/api/v1/skills/${id}`, { name }),
  remove: (id: number) => del(`/api/v1/skills/${id}`),
}
