import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag } from 'antd'
import { EnvironmentOutlined, TeamOutlined, StarFilled } from '@ant-design/icons'
import type { Job } from '../../types'
import { formatSalary, formatRelativeTime, isJobExpired, isJobFeatured, isJobNew } from '../../utils/format'
import { LEVEL_COLOR } from '../../constants'
import styles from './JobCard.module.css'
import { FireFilled } from '@ant-design/icons'

interface Props {
  job: Job
  onApply?: (job: Job) => void
}

const JobCard: React.FC<Props> = ({ job, onApply }) => {
  const navigate = useNavigate()

  const expired = isJobExpired(job.endDate, job.active)
  const featured = isJobFeatured(job)
  const newJob = isJobNew(job.startDate)

  return (
    <article
      className={`
        ${styles.card}
        ${expired ? styles.expired : ''}
        ${featured ? styles.featured : ''}
        ${!featured && newJob ? styles.new : ''}
      `}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >

      {/* FEATURED */}
      {featured && !expired && (
        <div className={styles.ribbonFeatured}>
          <StarFilled style={{ fontSize: 9 }} /> Featured
        </div>
      )}

      {/* NEW */}
      {!featured && newJob && !expired && (
        <div className={styles.ribbonNew}>
          <FireFilled style={{ fontSize: 9 }} /> New
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.logo}>
          {job.company.logo
            ? <img src={job.company.logo} alt={job.company.name} />
            : <span>{job.company.name.charAt(0)}</span>}
        </div>

        <div className={styles.meta}>
          <h3 className={styles.title}>{job.name}</h3>

          <div className={styles.company}>
            {job.company.name}
            <span className={styles.verified}>✓</span>
          </div>
        </div>

        {expired && <Tag color="default">Expired</Tag>}
      </div>

      <div className={styles.chips}>
        <span className={styles.chip}>
          <EnvironmentOutlined /> {job.location}
        </span>

        <span
          className={styles.chip}
          style={{
            color: LEVEL_COLOR[job.level] ?? '#64748b',
            fontWeight: 600
          }}
        >
          {job.level}
        </span>

        <span className={styles.chip}>
          <TeamOutlined /> {job.quantity} slots
        </span>
      </div>

      <div className={styles.skills}>
        {job.skills.slice(0, 4).map((s) => (
          <span key={s.id} className={styles.skill}>
            {s.name}
          </span>
        ))}

        {job.skills.length > 4 && (
          <span className={styles.skillMore}>
            +{job.skills.length - 4}
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.salary}>
          {formatSalary(job.salary)}
        </span>

        <div className={styles.footerRight}>
          <span className={styles.time}>
            {formatRelativeTime(job.startDate)}
          </span>

          <Button
            type={expired ? 'default' : 'primary'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onApply?.(job)
            }}
          >
            {expired ? 'View' : 'Apply'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default JobCard