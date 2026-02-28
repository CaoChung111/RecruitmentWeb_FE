import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Select, Checkbox, Pagination, Skeleton, Empty, Tag } from 'antd'
import { FilterOutlined, CloseOutlined } from '@ant-design/icons'
import { jobService } from '../../services/job.service'
import { companyService } from '../../services/company.service'
import JobCard from '../../components/common/JobCard'
import type { Job, Company } from '../../types'
import { LOCATIONS, JOB_LEVELS } from '../../constants'
import styles from './JobListPage.module.css'

const JobListPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  
  // States cho Filter & Sort
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [location, setLocation] = useState(searchParams.get('location') ?? undefined)
  const [levels, setLevels] = useState<string[]>(searchParams.get('level') ? [searchParams.get('level')!] : [])
  const [companyId, setCompanyId] = useState(searchParams.get('company') ?? undefined)
  const [sort, setSort] = useState<string>('createdAt,desc')

  // Reset page về 1 khi bất kỳ filter nào thay đổi
  useEffect(() => {
    setPage(1)
  }, [keyword, location, levels, companyId, sort])

  useEffect(() => {
    companyService.getAll({ size: 100 }).then(d => setCompanies(d?.result ?? []))
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let queryParts: string[] = []

      // 1. Search keyword
      if (keyword) queryParts.push(`name ~ '${keyword}'`)
      
      // 2. Location
      if (location) queryParts.push(`location ~ '${location}'`)
      
      // 3. Company
      if (companyId) queryParts.push(`company.id = '${companyId}'`)
      
      // 4. Levels (Logic OR bạn đã xác nhận chạy đúng)
      if (levels && levels.length > 0) {
        const levelConditions = levels.map(l => `level = '${l}'`).join(' or ')
        queryParts.push(`(${levelConditions})`)
      }

      const finalFilter = queryParts.join(' and ')

      const data = await jobService.getAll({ 
        filter: finalFilter || undefined, 
        page: page, 
        size: pageSize,
        sort: sort
      })
      
      setJobs(data?.result ?? [])
      setTotal(data?.meta.totalItems ?? 0)
    } finally {
      setLoading(false)
    }
  }, [keyword, location, levels, page, pageSize, companyId, sort])

  useEffect(() => { fetch() }, [fetch])

  const clearFilters = () => {
    setKeyword(''); setLocation(undefined); setLevels([]); setCompanyId(undefined); setSort('createdAt,desc')
    navigate('/jobs')
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Find your next role</h1>
            <p className={styles.pageSub}>{loading ? 'Searching...' : `${total.toLocaleString()} positions available`}</p>
          </div>
          <Select
            value={sort}
            onChange={(value) => setSort(value)}
            options={[
              { label: 'Latest', value: 'createdAt,desc' },
              { label: 'Highest salary', value: 'salary,desc' },
              { label: 'Lowest salary', value: 'salary,asc' }
            ]}
            style={{ width: 200 }}
            size="large"
          />
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {(keyword || location || levels.length > 0 || companyId) && (
          <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {keyword && <Tag closable onClose={() => setKeyword('')}>Keyword: {keyword}</Tag>}
            {location && <Tag closable onClose={() => setLocation(undefined)}>Location: {location}</Tag>}
            {levels.map(l => <Tag key={l} closable onClose={() => setLevels(levels.filter(x => x !== l))}>Level: {l}</Tag>)}
            {companyId && (
              <Tag closable onClose={() => { setCompanyId(undefined); navigate('/jobs') }}>
                Company: {companies.find(c => c.id.toString() === companyId)?.name ?? companyId}
              </Tag>
            )}
            <Button type="link" size="small" onClick={clearFilters}>Clear All</Button>
          </div>
        )}

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.filterHdr}>
              <span style={{ fontWeight: 700 }}><FilterOutlined /> Filters</span>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Company</label>
                <Select 
                  showSearch
                  allowClear
                  placeholder="Search company..."
                  style={{ width: '100%' }}
                  optionFilterProp="label" 
                  value={companyId}
                  onChange={(value) => setCompanyId(value)}
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {companies.map(c => (
                    <Select.Option key={c.id} value={c.id.toString()} label={c.name}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Keywords</label>
              <input className={styles.filterInput} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Job title..." />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Location</label>
              <Select allowClear options={LOCATIONS.map((l) => ({ label: l, value: l }))} value={location} onChange={setLocation} style={{ width: '100%' }} />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {JOB_LEVELS.map(({ label, value }) => (
                  <Checkbox key={value} checked={levels.includes(value)}
                    onChange={(e) => setLevels(e.target.checked ? [...levels, value] : levels.filter((l) => l !== value))}>
                    {label}
                  </Checkbox>
                ))}
              </div>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className={styles.grid}> {Array.from({ length: 6 }).map((_, i) => <Skeleton active key={i} />)} </div>
            ) : jobs.length === 0 ? (
              <Empty description="No jobs found." />
            ) : (
              <>
                <div className={styles.grid}>
                  {jobs.map((job) => <JobCard key={job.id} job={job} onApply={() => navigate(`/jobs/${job.id}`)} />)}
                </div>
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                  <Pagination current={page} pageSize={pageSize} total={total} onChange={setPage} showTotal={(t) => `${t} jobs`} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobListPage