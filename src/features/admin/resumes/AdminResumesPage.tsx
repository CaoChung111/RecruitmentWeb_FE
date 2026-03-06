import React, { useEffect, useState, useCallback } from 'react'
import { Table, Select, Input, Tag, Button, Space, App, Popconfirm } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { resumeService } from '../../../services/resume.service'
import type { Resume, ResumeStatus } from '../../../types'
import { formatRelativeTime } from '../../../utils/format'
import styles from '../AdminPage.module.css'

// 1. Mảng Options dùng cho thao tác Đổi trạng thái trong Bảng
const UPDATE_STATUS_OPTIONS: { label: string; value: ResumeStatus }[] = [
  { label: 'Pending',   value: 'PENDING' },
  { label: 'Reviewing', value: 'REVIEWING' },
  { label: 'Approved',  value: 'APPROVED' },
  { label: 'Rejected',  value: 'REJECTED' },
]

// 2. Mảng Options dùng cho Thanh Tìm Kiếm
const FILTER_STATUS_OPTIONS: { label: string; value: ResumeStatus }[] = [
  ...UPDATE_STATUS_OPTIONS,
  { label: 'Withdrawn', value: 'WITHDRAWN' as ResumeStatus },
  { label: 'System Cancel', value: 'SYSTEM_CANCEL' as ResumeStatus },
]

// 3. KPI Cards
const KPI = [
  { label: 'Pending',   status: 'PENDING',   color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
  { label: 'Reviewing', status: 'REVIEWING', color: '#3b82f6', bg: 'rgba(59,130,246,.1)'  },
  { label: 'Approved',  status: 'APPROVED',  color: '#10b981', bg: 'rgba(16,185,129,.1)'  },
  { label: 'Rejected',  status: 'REJECTED',  color: '#ef4444', bg: 'rgba(239,68,68,.1)'   },
]

const AdminResumesPage: React.FC = () => {
  const { notification } = App.useApp()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResumeStatus>()

  const load = useCallback(() => {
    setLoading(true)
    
    const params: any = { 
      page: page , 
      size: 10 
    }

    const filters = []
    if (keyword) {
      filters.push(`email~'*${keyword}*'`) 
    }
    if (statusFilter) {
      filters.push(`status:'${statusFilter}'`) 
    }
    if (filters.length > 0) {
      params.filter = filters.join(' and ')
    }

    resumeService.getAll(params)
      .then(d => { setResumes(d?.result ?? []); setTotal(d?.meta?.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword, statusFilter])

  useEffect(() => { setPage(1) }, [keyword, statusFilter])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: number, status: ResumeStatus) => {
    try {
      await resumeService.updateStatus(id, status)
      notification.success({ message: `Status updated to ${status}` })
      load()
    } catch (e) {
      notification.error({ message: 'Lỗi khi cập nhật trạng thái' })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await resumeService.remove(id)
      notification.success({ message: 'Deleted' })
      load()
    } catch (e) {
      notification.error({ message: 'Lỗi khi xóa' })
    }
  }

  const counts = KPI.reduce((acc, k) => ({
    ...acc, [k.status]: resumes.filter(r => r.status === k.status).length
  }), {} as Record<string, number>)

  const columns = [
    { title: 'Candidate', key: 'user', render: (_: any, r: Resume) => (
      <div>
        <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{r.email}</div>
      </div>
    )},
    { title: 'Job Applied', key: 'job', render: (_: any, r: Resume) => r.job?.name },
    { title: 'Company', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Resume', key: 'url', render: (_: any, r: Resume) => (
      <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--p600)', fontWeight: 600, fontSize: 13 }}>📎 View PDF</a>
    )},
    { 
      title: 'Status', 
      key: 'status', 
      render: (_: any, r: Resume) => {
        if (r.status === 'WITHDRAWN') {
          return <Tag color="default" style={{ margin: 0, width: 130, textAlign: 'center' }}>Withdrawn</Tag>;
        }
        if (r.status === 'SYSTEM_CANCEL') {
          return <Tag color="error" style={{ margin: 0, width: 130, textAlign: 'center' }}>System Cancel</Tag>;
        }

        return (
          <Select 
            value={r.status} 
            size="small" 
            style={{ width: 130 }}
            options={UPDATE_STATUS_OPTIONS}
            onChange={(v: ResumeStatus) => handleStatusChange(r.id, v)} 
          />
        );
      }
    },
    { title: 'Applied', dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{formatRelativeTime(v)}</span> },
    { 
      title: '', 
      key: 'actions', 
      render: (_: any, r: Resume) => {
        // 🔥 ẨN NÚT DELETE khi status là WITHDRAWN hoặc SYSTEM_CANCEL
        if (r.status === 'WITHDRAWN' || r.status === 'SYSTEM_CANCEL') {
          return null; 
        }

        return (
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        );
      }
    },
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Resumes</h1>
          <p className={styles.sub}>{total.toLocaleString()} total applications</p>
        </div>
        <Space>
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search email..." 
            value={keyword}
            onChange={e => setKeyword(e.target.value)} 
            style={{ width: 220 }} 
          />
          
          <Select 
            placeholder="All Status" 
            allowClear 
            style={{ width: 140 }}
            options={FILTER_STATUS_OPTIONS}
            value={statusFilter} 
            onChange={v => setStatusFilter(v as ResumeStatus)} 
          />
        </Space>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {KPI.map(({ label, status, color, bg }) => (
          <div key={status} style={{ background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:18,cursor:'pointer' }}
            onClick={() => setStatusFilter(status as ResumeStatus)}>
            <div style={{ width:40,height:40,borderRadius:10,background:bg,color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10 }}>
              {status === 'PENDING' ? '⏳' : status === 'REVIEWING' ? '🔍' : status === 'APPROVED' ? '✅' : '❌'}
            </div>
            <div style={{ fontFamily:'var(--fd)',fontSize:26,fontWeight:800,letterSpacing:'-.04em',marginBottom:2 }}>{counts[status] ?? '—'}</div>
            <div style={{ fontSize:13,color:'var(--tx2)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <Table dataSource={resumes} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 10, onChange: setPage }} scroll={{ x: 800 }} />
      </div>
    </div>
  )
}

export default AdminResumesPage