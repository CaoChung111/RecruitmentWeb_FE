export const LOCATIONS = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng',
  'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Remote',
]

export const JOB_LEVELS = [
  { label: 'Intern',  value: 'INTERN'  },
  { label: 'Fresher', value: 'FRESHER' },
  { label: 'Junior',  value: 'JUNIOR'  },
  { label: 'Middle',  value: 'MIDDLE'  },
  { label: 'Senior',  value: 'SENIOR'  },
  { label: 'Lead',    value: 'LEAD'    },
]

export const LEVEL_COLOR: Record<string, string> = {
  INTERN: '#94a3b8', FRESHER: '#10b981',
  JUNIOR: '#3b82f6', MIDDLE: '#8b5cf6',
  SENIOR: '#f59e0b', LEAD: '#ef4444',
}

export const RESUME_STATUS_CONFIG = [
  { label: 'Pending',   value: 'PENDING',   color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Reviewing', value: 'REVIEWING', color: '#3b82f6', bg: '#dbeafe' },
  { label: 'Approved',  value: 'APPROVED',  color: '#10b981', bg: '#d1fae5' },
  { label: 'Rejected',  value: 'REJECTED',  color: '#ef4444', bg: '#fee2e2' },
]

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = ['10', '20', '50']

export const JOB_STATUS = [
  { label: 'Open',   value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Draft',  value: 'DRAFT' },
  { label: 'Filled', value: 'FILLED' },
]

export const JOB_STATUS_CONFIG = [
  { label: 'Open',   value: 'OPEN',   color: '#10b981', bg: '#d1fae5' },  // green
  { label: 'Closed', value: 'CLOSED', color: '#ef4444', bg: '#fee2e2' },  // red
  { label: 'Draft',  value: 'DRAFT',  color: '#94a3b8', bg: '#f1f5f9' },  // gray
  { label: 'Filled', value: 'FILLED', color: '#3b82f6', bg: '#dbeafe' },  // blue
]