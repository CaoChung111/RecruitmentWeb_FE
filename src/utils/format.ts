import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatSalary = (salary: number | string | undefined | null): string => {
  if (!salary) return 'Thỏa thuận'

  const num = typeof salary === 'string' ? parseFloat(salary) : salary
  if (isNaN(num)) return 'Thỏa thuận'

  return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ'
}

export const formatDate = (iso?: string): string =>
  iso ? dayjs(iso).format('DD/MM/YYYY') : '—'

export const formatRelativeTime = (iso?: string): string =>
  iso ? dayjs(iso).fromNow() : ''

export const isJobExpired = (endDate?: string, status?: string): boolean => {
  const isManuallyClosed = status === 'CLOSED' || status === 'FILLED'
  const isDatePassed = endDate ? dayjs(endDate).endOf('day').isBefore(dayjs()) : false

  return isManuallyClosed || isDatePassed
}

export const isJobFeatured = (job: { salary?: number; quantity?: number }): boolean =>
  (job.salary ?? 0) >= 30_000_000 || (job.quantity ?? 0) >= 5

// ⭐ NEW JOB trong 7 ngày
export const isJobNew = (startDate?: string): boolean => {
  if (!startDate) return false
  return dayjs(startDate).isAfter(dayjs().subtract(10, 'day'))
}