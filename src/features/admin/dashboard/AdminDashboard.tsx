import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Skeleton } from 'antd'
import { jobService } from '../../../services/job.service'
import { resumeService } from '../../../services/resume.service'
import { companyService } from '../../../services/company.service'
import { userService } from '../../../services/user.service'
import { useAppSelector } from '../../../store'
import { selectUser } from '../../../store/slices/authSlice'
import type { Job } from '../../../types'
import { LEVEL_COLOR } from '../../../constants'
import { formatSalary } from '../../../utils/format'
import styles from './AdminDashboard.module.css'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  
  // Lấy thông tin Role từ Redux
  const user = useAppSelector(selectUser)
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN'

  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  
  // State lưu trữ con số thống kê thực tế
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    jobs: 0,
    resumes: 0,
    companies: 0,
    users: 0
  })

  // Gọi API lấy dữ liệu thực tế
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingJobs(true)
      setStatsLoading(true)

      try {
        // 1. Lấy danh sách Job cho bảng "Recent Jobs"
        const apiJobCall = isSuperAdmin ? jobService.getAll : jobService.getCompanyJobs
        const jobsRes = await apiJobCall({ page: 0, size: 5 })
        setJobs(jobsRes?.result ?? [])

        // 2. Lấy Thống kê (Chỉ lấy size=1 để backend trả về nhanh nhất, ta chỉ cần meta.totalItems)
        // Dùng Promise.all để gọi song song, giảm thời gian chờ
        if (isSuperAdmin) {
          const [j, r, c, u] = await Promise.all([
            jobService.getAll({ page: 0, size: 1 }),
            resumeService.getAll({ page: 0, size: 1 }),
            companyService.getAll({ page: 0, size: 1 }),
            userService.getAll({ page: 0, size: 1 })
          ])
          setStats({
            jobs: j?.meta?.totalItems ?? 0,
            resumes: r?.meta?.totalItems ?? 0,
            companies: c?.meta?.totalItems ?? 0,
            users: u?.meta?.totalItems ?? 0
          })
        } else {
          // Nếu là HR: Chỉ đếm Job của công ty và Resume nộp vào công ty
          const [j, r] = await Promise.all([
            jobService.getCompanyJobs({ page: 0, size: 1 }),
            resumeService.getAll({ page: 0, size: 1 }) // Giả định backend resumeService.getAll đã tự filter theo công ty của HR
          ])
          setStats({
            ...stats,
            jobs: j?.meta?.totalItems ?? 0,
            resumes: r?.meta?.totalItems ?? 0,
          })
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error)
      } finally {
        setLoadingJobs(false)
        setStatsLoading(false)
      }
    }

    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin])

  // Lọc KPI Data: Truyền dữ liệu thật từ state `stats` vào
  const KPI_DATA = [
    { label: 'Active Jobs',   val: stats.jobs,      icon: '💼', color: '#4f46e5', bg: 'rgba(79,70,229,.1)', path: '/admin/jobs', show: true },
    { label: 'Total Resumes', val: stats.resumes,   icon: '📄', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', path: '/admin/resumes', show: true },
    { label: 'Companies',     val: stats.companies, icon: '🏢', color: '#7c3aed', bg: 'rgba(124,58,237,.1)', path: '/admin/companies', show: isSuperAdmin },
    { label: 'Total Users',   val: stats.users,     icon: '👥', color: '#10b981', bg: 'rgba(16,185,129,.1)', path: '/admin/users', show: isSuperAdmin },
  ].filter(item => item.show)

  const QUICK_ACTIONS = [
    { icon: '💼', label: 'Post a new job',      path: '/admin/jobs', show: true },
    { icon: '📄', label: 'Review applications', path: '/admin/resumes', show: true },
    { icon: '🏢', label: 'Add company',         path: '/admin/companies', show: isSuperAdmin },
    { icon: '👥', label: 'Manage users',        path: '/admin/users', show: isSuperAdmin },
    { icon: '🔧', label: 'Manage skills',       path: '/admin/skills', show: isSuperAdmin },
  ].filter(item => item.show)

  const columns = [
    { title: 'Title', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Company', key: 'company', render: (_: any, r: Job) => r.company?.name },
    { title: 'Level', dataIndex: 'level', key: 'level', render: (v: string) => <Tag color={LEVEL_COLOR[v]}>{v}</Tag> },
    { title: 'Salary', dataIndex: 'salary', key: 'salary', render: (v: number) => <span style={{ fontWeight: 700, color: 'var(--p600)' }}>{formatSalary(v)}</span> },
    { title: 'Status', dataIndex: 'active', key: 'active', render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'orange'}>{v}</Tag> },
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Welcome back, {user?.username}! Here's what's happening.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {KPI_DATA.map(({ label, val, icon, color, bg, path }) => (
          <div key={label} className={styles.kpiCard} onClick={() => navigate(path)}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIcon} style={{ background: bg, color }}>{icon}</div>
              <span style={{ fontSize: 12, color: 'var(--tx3)', fontWeight: 500 }}>Total records</span>
            </div>
            
            {/* 🔥 Hiển thị Skeleton nếu đang tải dữ liệu */}
            {statsLoading ? (
              <Skeleton.Button active size="small" style={{ width: 80, height: 32, marginTop: 8 }} />
            ) : (
              <div className={styles.kpiVal}>{val.toLocaleString()}</div>
            )}
            
            <div className={styles.kpiLbl}>{label}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Recent Jobs</span>
            <Button type="link" onClick={() => navigate('/admin/jobs')}>View all →</Button>
          </div>
          <Table dataSource={jobs} columns={columns} rowKey="id" loading={loadingJobs}
            pagination={false} size="small" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className={styles.card}>
            <div className={styles.cardTitle} style={{ marginBottom: 14 }}>Quick Actions</div>
            {QUICK_ACTIONS.map(({ icon, label, path }) => (
              <div key={label} className={styles.quickItem} onClick={() => navigate(path)}>
                <span>{icon}</span><span>{label}</span><span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: 12 }}>→</span>
              </div>
            ))}
          </div>
          <div className={styles.tipCard}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--p700)', marginBottom: 4 }}>Pro tip</div>
              <div style={{ fontSize: 12.5, color: 'var(--p600)', lineHeight: 1.6 }}>Complete company profiles get 3× more applications!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard