import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Upload, Form, Input, Modal, App, Skeleton } from 'antd'
import { EnvironmentOutlined, TeamOutlined, CalendarOutlined, DollarOutlined, ClockCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { jobService } from '../../services/job.service'
import { resumeService } from '../../services/resume.service'
import { uploadFile } from '../../services/api'
import { useAppSelector } from '../../store'
import { selectIsAuth, selectUser } from '../../store/slices/authSlice'
import type { Job } from '../../types'
import { formatSalary, formatDate, formatRelativeTime, isJobExpired } from '../../utils/format'
import { LEVEL_COLOR } from '../../constants'
import styles from './JobDetailPage.module.css'

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notification } = App.useApp()
  const isAuth = useAppSelector(selectIsAuth)
  const user = useAppSelector(selectUser)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applyOpen, setApplyOpen] = useState(false)
  const [applying, setApplying] = useState(false)
  const [fileUrl, setFileUrl] = useState<string>()
  const [form] = Form.useForm()

  useEffect(() => {
    if (!id) return
    jobService.getById(Number(id)).then(setJob).finally(() => setLoading(false))
  }, [id])

  const handleUpload = async (file: File) => {
    const url = await uploadFile(file)
    setFileUrl(url)
    return false
  }

  const handleApply = async (values: { email: string }) => {
    if (!fileUrl) { notification.error({ message: 'Please upload your resume PDF' }); return }
    if (!user) { navigate('/login'); return }
    setApplying(true)
    try {
      await resumeService.create({ email: values.email, url: fileUrl, status: 'PENDING', userId: user.id, jobId: Number(id) })
      notification.success({ message: '🎉 Application submitted!' })
      setApplyOpen(false)
    } catch {
      notification.error({ message: 'Failed to submit application' })
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div className={styles.root}><div className={styles.container}><Skeleton active paragraph={{ rows: 10 }} /></div></div>
  if (!job) return <div className={styles.root}><div className={styles.container}><p>Job not found.</p></div></div>

  const expired = isJobExpired(job.endDate)

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <span onClick={() => navigate('/')} className={styles.crumb}>Home</span>
          <span className={styles.sep}>/</span>
          <span onClick={() => navigate('/jobs')} className={styles.crumb}>Jobs</span>
          <span className={styles.sep}>/</span>
          <span>{job.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Left */}
          <div className={styles.main}>
            <div className={styles.card}>
              <div className={styles.jobHeader}>
                <div className={styles.logo}>
                  {job.company.logo ? <img src={job.company.logo} alt="" /> : job.company.name.charAt(0)}
                </div>
                <div>
                  <h1 className={styles.title}>{job.name}</h1>
                  <div className={styles.companyName}>{job.company.name} <span className={styles.verified}>✓</span></div>
                </div>
              </div>

              <div className={styles.chips}>
                <span className={styles.chip}><EnvironmentOutlined /> {job.location}</span>
                <span className={styles.chip} style={{ color: LEVEL_COLOR[job.level], fontWeight: 700 }}>{job.level}</span>
                <span className={styles.chip}><TeamOutlined /> {job.quantity} openings</span>
                <span className={styles.chip}><CalendarOutlined /> Deadline: {formatDate(job.endDate)}</span>
                {expired && <Tag color="default">Expired</Tag>}
              </div>

              <div className={styles.skills}>
                {job.skills.map(s => <span key={s.id} className={styles.skill}>{s.name}</span>)}
              </div>

              <hr className={styles.divider} />

              <h2 className={styles.secTitle}>Job Description</h2>
              <div className={styles.body} dangerouslySetInnerHTML={{ __html: job.description }} />

              <hr className={styles.divider} />

              <h2 className={styles.secTitle}>About {job.company.name}</h2>
              <div className={styles.companyCard}>
                <div className={styles.logo} style={{ width: 52, height: 52, fontSize: 22 }}>
                  {job.company.logo ? <img src={job.company.logo} alt="" /> : job.company.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{job.company.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--tx3)' }}>{job.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sticky */}
          <div className={styles.aside}>
            <div className={styles.stickyCard}>
              <div className={styles.salary}><DollarOutlined /> {formatSalary(job.salary)}</div>
              <div className={styles.salaryNote}>per month · Negotiable</div>
              <Button type="primary" size="large" block disabled={expired}
                onClick={() => { if (!isAuth) { navigate('/login'); return }; setApplyOpen(true) }}
                style={{ height: 48, fontWeight: 600, marginBottom: 10 }}>
                {expired ? 'Expired' : '🚀 Apply Now'}
              </Button>
              <Button size="large" block style={{ height: 48, fontWeight: 600 }}>💾 Save Job</Button>

              <hr className={styles.divider} />

              <div className={styles.infoList}>
                {[
                  [<ClockCircleOutlined />, 'Posted', formatRelativeTime(job.createdAt)],
                  [<CalendarOutlined />, 'Deadline', formatDate(job.endDate)],
                  [<TeamOutlined />, 'Openings', `${job.quantity} positions`],
                ].map(([icon, label, val], i) => (
                  <div key={i} className={styles.infoItem}>
                    <span className={styles.infoIcon}>{icon}</span>
                    <div>
                      <div className={styles.infoLabel}>{label as string}</div>
                      <div className={styles.infoVal}>{val as string}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal title="Apply for this job" open={applyOpen} onCancel={() => setApplyOpen(false)}
        footer={null} centered width={480}>
        <Form form={form} layout="vertical" onFinish={handleApply} style={{ marginTop: 16 }}>
          <Form.Item name="email" label="Your Email" rules={[{ required: true, type: 'email' }]}
            initialValue={user?.email}>
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Resume (PDF)" required>
            <Upload accept=".pdf,.doc,.docx" beforeUpload={handleUpload} maxCount={1} showUploadList>
              <Button icon={<UploadOutlined />} size="large" style={{ width: '100%' }}>
                {fileUrl ? '✅ Resume uploaded' : 'Click to upload resume'}
              </Button>
            </Upload>
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={applying} size="large">Submit Application</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default JobDetailPage
