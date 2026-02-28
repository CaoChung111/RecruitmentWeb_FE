import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button } from 'antd'
import { jobService } from '../../../services/job.service'
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
  const [loading, setLoading] = useState(true)

  // Lọc KPI Data: HR chỉ thấy Job và Resume, Super Admin thấy tất cả
  const KPI_DATA = [
    { label: 'Active Jobs',   val: '1,284',  icon: '💼', color: '#4f46e5', bg: 'rgba(79,70,229,.1)', change: '+12%', up: true,  path: '/admin/jobs', show: true },
    { label: 'Total Resumes', val: '5,871',  icon: '📄', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', change: '-3%',  up: false, path: '/admin/resumes', show: true },
    { label: 'Companies',     val: '342',    icon: '🏢', color: '#7c3aed', bg: 'rgba(124,58,237,.1)', change: '+8%',  up: true,  path: '/admin/companies', show: isSuperAdmin },
    { label: 'Total Users',   val: '50,421', icon: '👥', color: '#10b981', bg: 'rgba(16,185,129,.1)', change: '+21%', up: true,  path: '/admin/users', show: isSuperAdmin },
  ].filter(item => item.show)

  // Lọc Quick Actions tương tự
  const QUICK_ACTIONS = [
    { icon: '💼', label: 'Post a new job',      path: '/admin/jobs', show: true },
    { icon: '📄', label: 'Review applications', path: '/admin/resumes', show: true },
    { icon: '🏢', label: 'Add company',         path: '/admin/companies', show: isSuperAdmin },
    { icon: '👥', label: 'Manage users',        path: '/admin/users', show: isSuperAdmin },
    { icon: '🔧', label: 'Manage skills',       path: '/admin/skills', show: isSuperAdmin },
  ].filter(item => item.show)

  useEffect(() => {
    setLoading(true)
    
    // 🔥 CHỌN ĐÚNG API DỰA VÀO ROLE
    const apiCall = isSuperAdmin ? jobService.getAll : jobService.getCompanyJobs
    
    // Lưu ý dùng size thay vì pageSize cho Spring Boot
    apiCall({ page: 1, size: 5 })
      .then(d => setJobs(d?.result ?? []))
      .finally(() => setLoading(false))
  }, [isSuperAdmin])

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
          <p className={styles.sub}>Welcome back! Here's what's happening.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {KPI_DATA.map(({ label, val, icon, color, bg, change, up, path }) => (
          <div key={label} className={styles.kpiCard} onClick={() => navigate(path)}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIcon} style={{ background: bg, color }}>{icon}</div>
              <span className={`${styles.kpiChange} ${up ? styles.up : styles.dn}`}>{change}</span>
            </div>
            <div className={styles.kpiVal}>{val}</div>
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
          <Table dataSource={jobs} columns={columns} rowKey="id" loading={loading}
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