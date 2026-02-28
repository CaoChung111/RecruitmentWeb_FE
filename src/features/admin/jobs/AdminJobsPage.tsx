import React, { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Input, Select, App, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { jobService } from '../../../services/job.service'
import { companyService } from '../../../services/company.service'
import { skillService } from '../../../services/skill.service'
import { useAppSelector } from '../../../store'
import { selectUser } from '../../../store/slices/authSlice'
import type { Job, Company, Skill } from '../../../types'
import { LEVEL_COLOR, JOB_LEVELS, JOB_STATUS_CONFIG } from '../../../constants'
import { formatSalary, formatDate } from '../../../utils/format'
import JobModal from './JobModal'
import styles from '../AdminPage.module.css'

const AdminJobsPage: React.FC = () => {
  const { notification } = App.useApp()
  const user = useAppSelector(selectUser)
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN'

  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [filter, setFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState<string | undefined>()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)

  const [companies, setCompanies] = useState<Company[]>([])
  const [skills, setSkills] = useState<Skill[]>([])


  const load = useCallback(async () => {
    setLoading(true)

    try {
      const queryParts: string[] = []

      if (filter.trim()) {
        const safeKeyword = filter.replace(/'/g, "")
        queryParts.push(`name ~ '${safeKeyword}'`)
      }

      if (levelFilter) {
        queryParts.push(`level = '${levelFilter}'`)
      }

      const finalFilter =
        queryParts.length > 0 ? queryParts.join(' and ') : undefined

      const apiCall = isSuperAdmin
        ? jobService.getAll
        : jobService.getCompanyJobs

      const d = await apiCall({
        filter: finalFilter,
        page,
        size: 10
      })

      setJobs(d?.result ?? [])
      setTotal(d?.meta.totalItems ?? 0)

    } finally {
      setLoading(false)
    }
  }, [filter, levelFilter, page, isSuperAdmin])

  useEffect(() => {
    load()
  }, [load])


  useEffect(() => {
    companyService.getAll({ size: 100 })
      .then(d => setCompanies(d?.result ?? []))

    skillService.getAll({ size: 100 })
      .then(d => setSkills(d?.result ?? []))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (job: Job) => {
    setEditing(job)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    await jobService.remove(id)
    notification.success({ message: 'Job deleted' })
    load()
  }

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r: Job) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>
            {r.location}
          </div>
        </div>
      )
    },
    {
      title: 'Company',
      key: 'company',
      render: (_: any, r: Job) => r.company?.name
    },
    {
      title: 'Skills',
      key: 'skills',
      render: (_: any, r: Job) => (
        <Space wrap size={4}>
          {r.skills?.slice(0, 2).map(s => (
            <Tag key={s.id} color="blue" style={{ fontSize: 11 }}>
              {s.name}
            </Tag>
          ))}
          {(r.skills?.length ?? 0) > 2 && (
            <Tag style={{ fontSize: 11 }}>
              +{r.skills!.length - 2}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (v: string) => (
        <Tag color={LEVEL_COLOR[v]}>
          {v}
        </Tag>
      )
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (v: number) => (
        <span style={{ fontWeight: 700, color: 'var(--p600)' }}>
          {formatSalary(v)}
        </span>
      )
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (v: string) => {
        const statusConfig = JOB_STATUS_CONFIG.find(s => s.value === v)

        return (
          <Tag
            style={{
              color: statusConfig?.color,
              background: statusConfig?.bg,
              border: 'none'
            }}
          >
            {statusConfig?.label ?? v}
          </Tag>
        )
      }
    },
    {
      title: 'Expires',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
          {formatDate(v)}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: Job) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this job?"
            onConfirm={() => handleDelete(r.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Jobs</h1>
          <p className={styles.sub}>
            {total.toLocaleString()} jobs total
          </p>
        </div>

        <Space>
          {/* 🔎 Search */}
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            value={filter}
            onChange={e => {
              setPage(1)
              setFilter(e.target.value)
            }}
            style={{ width: 220 }}
          />

          {/* 🏷 Level */}
          <Select
            placeholder="Level"
            allowClear
            style={{ width: 130 }}
            value={levelFilter}
            options={JOB_LEVELS.map(l => ({
              label: l.label,
              value: l.value
            }))}
            onChange={(value) => {
              setPage(1)
              setLevelFilter(value)
            }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            Add Job
          </Button>
        </Space>
      </div>

      <div className={styles.tableWrap}>
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: setPage,
            showTotal: t => `${t} jobs`
          }}
          scroll={{ x: 900 }}
        />
      </div>

      <JobModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={load}
        editing={editing}
        companies={companies}
        skills={skills}
      />
    </div>
  )
}

export default AdminJobsPage