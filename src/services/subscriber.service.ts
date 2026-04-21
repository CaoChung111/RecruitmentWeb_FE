import { get, post, put, del, getPaginated } from './api'
import type { Subscriber, SubscriberRequestDTO } from '../types'

export const subscriberService = {
  // LƯU Ý: Bạn cần bổ sung API này ở Backend Spring Boot nhé
  getAll: (params?: object) => getPaginated<Subscriber>('/api/v1/subscribers', params),
  
  getById: (id: number) => get<Subscriber>(`/api/v1/subscribers/${id}`),
  create: (data: SubscriberRequestDTO) => post<Subscriber>('/api/v1/subscribers', data),
  update: (id: number, data: SubscriberRequestDTO) => put<string>(`/api/v1/subscribers/${id}`, data),
  remove: (id: number) => del(`/api/v1/subscribers/${id}`),
}