import React, { useEffect, useState, useCallback } from 'react'
import { Table, Button, Space, Input, App, Popconfirm, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { subscriberService } from '../../../services/subscriber.service'
import { skillService } from '../../../services/skill.service'
import type { Subscriber, Skill } from '../../../types'
import { formatDate } from '../../../utils/format'
import SubscriberModal from './SubscriberModal'
import HasPermission from '../../../components/common/HasPermission'
import { ALL_PERMISSIONS } from '../../../constants/permissions'
import styles from '../AdminPage.module.css'

const AdminSubscribersPage: React.FC = () => {
  const { notification } = App.useApp()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  
  const [filter, setFilter] = useState('')
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Subscriber | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const queryParts: string[] = []

      if (filter.trim()) {
        const safeKeyword = filter.replace(/'/g, "")
        // Search by both email and name
        queryParts.push(`(email ~ '*${safeKeyword}*' or name ~ '*${safeKeyword}*')`) 
      }

      const finalFilter = queryParts.length > 0 ? queryParts.join(' and ') : undefined

      const d = await subscriberService.getAll({
        filter: finalFilter,
        page: page - 1, // Spring Boot pagination is 0-based
        size: 10
      })

      setSubscribers(d?.result ?? [])
      setTotal(d?.meta?.totalItems ?? 0)

    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { load() }, [load])
  
  useEffect(() => {
    skillService.getAll({ size: 100 }).then(d => setSkills(d?.result ?? []))
  }, [])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (s: Subscriber) => { setEditing(s); setOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      await subscriberService.remove(id)
      notification.success({ message: 'Deleted successfully' })
      load()
    } catch (e) {
      // Handled by api.ts interceptor
    }
  }

  const columns = [
    { 
      title: 'Subscriber Info', 
      key: 'info', 
      render: (_: any, r: Subscriber) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{r.email}</div>
        </div>
      )
    },
    { 
      title: 'Skills', 
      key: 'skills', 
      render: (_: any, r: Subscriber) => (
        <Space wrap size={4}>
          {r.skills?.map(s => <Tag color="blue" key={s.id}>{s.name}</Tag>)}
          {(!r.skills || r.skills.length === 0) && <span style={{ color: 'var(--tx3)' }}>—</span>}
        </Space>
      )
    },
    { 
      title: 'Created At', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (v: string) => <span style={{ fontSize:12, color:'var(--tx3)' }}>{formatDate(v)}</span> 
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_: any, r: Subscriber) => (
        <Space>
          <HasPermission requiredPermission={ALL_PERMISSIONS.SUBSCRIBERS.UPDATE}>
            <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
          </HasPermission>
          <HasPermission requiredPermission={ALL_PERMISSIONS.SUBSCRIBERS.DELETE}>
            <Popconfirm title="Delete this subscriber?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          </HasPermission>
        </Space>
    )},
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Subscribers</h1>
          <p className={styles.sub}>{total.toLocaleString()} subscribers total</p>
        </div>
        
        <Space>
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search by name or email..." 
            value={filter}
            onChange={e => {
              setPage(1)
              setFilter(e.target.value)
            }} 
            style={{ width: 240 }} 
          />
          
          <HasPermission requiredPermission={ALL_PERMISSIONS.SUBSCRIBERS.CREATE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Subscriber</Button>
          </HasPermission>
        </Space>
      </div>

      <div className={styles.tableWrap}>
        <Table dataSource={subscribers} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 10, onChange: setPage }} scroll={{ x: 800 }} />
      </div>

      <SubscriberModal open={open} onClose={() => setOpen(false)} onSuccess={load} editing={editing} skills={skills} />
    </div>
  )
}

export default AdminSubscribersPage