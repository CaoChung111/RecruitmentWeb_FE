export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  meta: Pagination
  result: T[]
}

export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data: T
}

// ==========================================
// RBAC: PERMISSION & ROLE (Đưa lên trên để tái sử dụng)
// ==========================================
export interface Permission {
  id: number
  name: string
  apiPath: string
  method: string
  module: string
  createdAt?: string
}

export interface Role {
  id: number
  name: string
  description: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  permissions: Permission[] // 🔥 Cốt lõi của phân quyền nằm ở đây
}

// ==========================================
// AUTH & USER
// ==========================================
export interface AuthUser {
  id: number
  username: string
  email: string
  role?: Role // 🔥 Đã cập nhật: Sử dụng full interface Role thay vì object lửng lơ
}

export interface LoginPayload { 
  username: string
  password: string 
}

export interface RegisterPayload {
  name: string; email: string; password: string
  age: number; gender: string; address: string
}

export interface LoginResponse { 
  accessToken: string
  userInfo: AuthUser 
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
}

// ==========================================
// DOMAIN ENTITIES
// ==========================================

// COMPANY
export interface Company {
  id: number; name: string; description: string
  address: string; logo: string; createdAt: string; updatedAt: string
}

// SKILL
export interface Skill { id: number; name: string }

// JOB
export type JobLevel = 'INTERN' | 'FRESHER' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD'
export type JobActive = 'OPEN' | 'CLOSED' | 'DRAFT' | 'FILLED'

export interface Job {
  id: number; name: string; location: string; salary: number
  quantity: number; level: JobLevel; description: string
  startDate: string; endDate: string; active: JobActive
  createdAt: string; updatedAt: string
  company: { id: number; name: string; logo: string }
  skills: Skill[]
}

export interface JobRequestDTO {
  name: string; location: string; salary: number; quantity: number
  level: string; description: string; startDate: string; endDate: string
  active: string; companyId: number; skills: number[]
}

// RESUME
export type ResumeStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'SYSTEM_CANCEL'
export interface Resume {
  id: number; email: string; url: string; status: ResumeStatus
  companyName: string
  user: { id: number; name: string }
  job: { id: number; name: string }
  createdAt: string; updatedAt: string
}

// USER (Dành cho màn quản lý User)
export interface User {
  id: number; name: string; email: string; age: number
  gender: string; address: string; createdAt: string; updatedAt: string
  company?: { id: number; name: string }
  role?: Role // 🔥 Cập nhật đồng bộ
}

// SUBSCRIBER
export interface Subscriber {
  id: number; name: string; email: string; skills: Skill[]
}

// ==========================================
// UTILS
// ==========================================
export interface TableParams {
  page: number; pageSize: number
  sortField?: string; sortOrder?: 'ascend' | 'descend'
}

export interface JobFilters {
  filter?: string; location?: string; level?: string
  page?: number; size?: number; sort?: string;
}