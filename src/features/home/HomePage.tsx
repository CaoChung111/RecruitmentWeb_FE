import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Skeleton } from 'antd'
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { jobService } from '../../services/job.service'
import JobCard from '../../components/common/JobCard'
import type { Job } from '../../types'
import { LOCATIONS } from '../../constants'
import styles from './HomePage.module.css'

const STATS = [
  { value: '10,000+', label: 'Active Jobs',  color: 'var(--p600)' },
  { value: '2,500+',  label: 'Companies',    color: '#7c3aed' },
  { value: '50,000+', label: 'Job Seekers',  color: '#2563eb' },
  { value: '98%',     label: 'Success Rate', color: '#059669' },
]

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState<string | undefined>()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // 🔥 Lấy 6 job mới nhất
  useEffect(() => {
    setLoading(true)

    jobService.getAll({
      page: 0,                      // ⚠ Spring page bắt đầu từ 0
      size: 6,
      sort: 'createdAt,desc'        // ✅ mới nhất
    })
      .then((d) => setJobs(d?.result ?? []))
      .finally(() => setLoading(false))
  }, [])

  // 🔥 Build URL search sạch
  const handleSearch = () => {
    const params = new URLSearchParams()

    if (keyword.trim()) params.append('keyword', keyword.trim())
    if (location) params.append('location', location)

    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />

        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            🚀 Vietnam's #1 Tech Job Board
          </div>

          <h1 className={styles.heroTitle}>
            Find your next <br />
            <span className={styles.grad}>dream job</span>
          </h1>

          <p className={styles.heroSub}>
            Explore thousands of opportunities. Land the role you've been working towards.
          </p>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <SearchOutlined className={styles.searchIcon} />

            <input
              className={styles.searchInput}
              placeholder="Job title, keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <div className={styles.divider} />

            <EnvironmentOutlined className={styles.searchIcon} />

            <Select
              placeholder="Location"
              value={location}
              onChange={setLocation}
              options={LOCATIONS.map((l) => ({ label: l, value: l }))}
              variant="borderless"
              style={{ width: 150, border: 'none' }}
              allowClear
            />

            <Button
              type="primary"
              size="large"
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Popular tags */}
          <div className={styles.hints}>
            <span className={styles.hintLabel}>Popular:</span>
            {['React', 'Node.js', 'Java', 'Python', 'DevOps'].map((t) => (
              <button
                key={t}
                className={styles.hintTag}
                onClick={() => navigate(`/jobs?keyword=${t}`)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statsGrid}>
          {STATS.map(({ value, label, color }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statVal} style={{ color }}>
                {value}
              </span>
              <span className={styles.statLbl}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest jobs */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.secHead}>
            <div>
              <h2 className={styles.secTitle}>Latest Opportunities</h2>
              <p className={styles.secSub}>Fresh jobs posted recently</p>
            </div>

            <Button onClick={() => navigate('/jobs')}>
              View all →
            </Button>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surf)',
                    border: '1px solid var(--bdr)',
                    borderRadius: 16,
                    padding: 20
                  }}
                >
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.grid}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={() => navigate(`/jobs/${job.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.cta}>
            <div className={styles.ctaOrb} />

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <h2 className={styles.ctaTitle}>
                Ready to take the next step?
              </h2>

              <p className={styles.ctaSub}>
                Join 50,000+ professionals who found their perfect job through JobHunter.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/register')}
                  style={{ height: 48, fontSize: 15, fontWeight: 600, padding: '0 28px' }}
                >
                  Get started — it's free
                </Button>

                <Button
                  size="large"
                  onClick={() => navigate('/jobs')}
                  style={{
                    height: 48,
                    fontSize: 15,
                    background: 'rgba(255,255,255,.1)',
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,.2)',
                    padding: '0 28px'
                  }}
                >
                  Browse jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default HomePage