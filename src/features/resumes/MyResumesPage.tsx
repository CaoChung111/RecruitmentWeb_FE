import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Empty, Skeleton, Popconfirm, App } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { resumeService } from '../../services/resume.service'
import type { Resume, ResumeStatus } from '../../types'
import { formatDate, formatRelativeTime } from '../../utils/format'
import styles from './MyResumesPage.module.css'

const STATUS_CFG: Record<ResumeStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Pending',   color: '#f59e0b', icon: <ClockCircleOutlined /> },
  REVIEWING: { label: 'Reviewing', color: '#3b82f6', icon: <EyeOutlined /> },
  APPROVED:  { label: 'Approved',  color: '#10b981', icon: <CheckCircleOutlined /> },
  REJECTED:  { label: 'Rejected',  color: '#ef4444', icon: <CloseCircleOutlined /> },
}

const MyResumesPage: React.FC = () => {
  const navigate = useNavigate()
  const { notification } = App.useApp()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    resumeService.getByUser().then(d => setResumes(d?.result ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    await resumeService.remove(id)
    notification.success({ message: 'Application withdrawn' })
    load()
  }

  const stats = {
    PENDING:   resumes.filter(r => r.status === 'PENDING').length,
    REVIEWING: resumes.filter(r => r.status === 'REVIEWING').length,
    APPROVED:  resumes.filter(r => r.status === 'APPROVED').length,
    REJECTED:  resumes.filter(r => r.status === 'REJECTED').length,
  }

  const BORDER_COLOR: Record<ResumeStatus, string> = {
    PENDING: '#f59e0b', REVIEWING: '#3b82f6', APPROVED: '#10b981', REJECTED: '#ef4444',
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.title}>My Applications</h1>
            <p className={styles.sub}>{resumes.length} application{resumes.length !== 1 ? 's' : ''} submitted</p>
          </div>
          <Button type="primary" size="large" onClick={() => navigate('/jobs')}>+ Find More Jobs</Button>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {(Object.entries(stats) as [ResumeStatus, number][]).map(([status, count]) => {
            const cfg = STATUS_CFG[status]
            return (
              <div key={status} className={styles.statCard}>
                <span className={styles.statIcon} style={{ color: cfg.color }}>{cfg.icon}</span>
                <div className={styles.statVal}>{count}</div>
                <div className={styles.statLbl}>{cfg.label}</div>
              </div>
            )
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className={styles.list}>
            {[1,2,3].map(i => <div key={i} className={styles.card}><Skeleton active paragraph={{ rows: 3 }} /></div>)}
          </div>
        ) : resumes.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Empty description={<>No applications yet.<br />Start applying to jobs you love!</>} />
            <Button type="primary" size="large" onClick={() => navigate('/jobs')} style={{ marginTop: 20 }}>
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className={styles.list}>
            {resumes.map(r => {
              const cfg = STATUS_CFG[r.status]
              return (
                <div key={r.id} className={styles.card} style={{ borderLeft: `4px solid ${BORDER_COLOR[r.status]}` }}>
                  <div className={styles.cardBody}>
                    <div className={styles.cardLeft}>
                      <div className={styles.jobInfo}>
                        <div className={styles.logo}>{r.companyName?.charAt(0) ?? '?'}</div>
                        <div>
                          <div className={styles.jobName}>{r.job?.name}</div>
                          <div className={styles.coName}>{r.companyName}</div>
                        </div>
                        <Tag color={cfg.color} icon={cfg.icon} style={{ marginLeft: 'auto' }}>{cfg.label}</Tag>
                      </div>

                      <div className={styles.meta}>
                        <a href={r.url} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--p600)', fontWeight: 600, fontSize: 13 }}>
                          📎 View Resume
                        </a>
                        <span style={{ color: 'var(--tx3)', fontSize: 12 }}>
                          Submitted {formatRelativeTime(r.createdAt)} · {formatDate(r.createdAt)}
                        </span>
                      </div>

                      {r.status === 'APPROVED' && (
                        <div className={styles.approvedBanner}>
                          🎉 Congratulations! Your application was approved. HR will contact you soon.
                        </div>
                      )}
                      {r.status === 'REJECTED' && (
                        <div className={styles.rejectedBanner}>
                          Thank you for applying. Unfortunately we've moved forward with another candidate.
                        </div>
                      )}
                      {r.status === 'REVIEWING' && (
                        <div className={styles.timeline}>
                          {['Submitted', 'Under Review', 'Interview', 'Decision'].map((step, i) => (
                            <div key={step} className={styles.step}>
                              <div className={`${styles.dot} ${i <= 1 ? styles.dotActive : ''}`} />
                              <span style={{ fontSize: 12, color: i <= 1 ? 'var(--p600)' : 'var(--tx3)', fontWeight: i <= 1 ? 600 : 400 }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      {(r.status === 'PENDING' || r.status === 'REVIEWING') && (
                        <Popconfirm title="Withdraw this application?" onConfirm={() => handleDelete(r.id)} okText="Yes" cancelText="No">
                          <Button danger size="small" icon={<DeleteOutlined />}>Withdraw</Button>
                        </Popconfirm>
                      )}
                      {r.status === 'REJECTED' && (
                        <Button size="small" danger onClick={() => handleDelete(r.id)}>Delete</Button>
                      )}
                      <Button size="small" onClick={() => navigate(`/jobs/${r.job?.id}`)}>View Job</Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyResumesPage
