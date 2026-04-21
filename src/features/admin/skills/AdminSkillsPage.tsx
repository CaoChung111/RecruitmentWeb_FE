import React, { useEffect, useState, useCallback } from 'react'
import { Table, Button, Input, Tag, App, Popconfirm, Space } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { skillService } from '../../../services/skill.service'
import type { Skill } from '../../../types'
import SkillModal from './SkillModal'
import styles from '../AdminPage.module.css'

const AdminSkillsPage: React.FC = () => {
  const { notification } = App.useApp()
  const [skills, setSkills] = useState<Skill[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    
    // 🔥 SỬA LẠI PARAMS: 0-based pagination và Spring Filter
    const params: any = { 
      page: page - 1, 
      size: 20 
    }
    if (keyword) {
      // Tìm theo name cho skill
      params.filter = `name~'*${keyword}*'` 
    }

    skillService.getAll(params)
      .then(d => { setSkills(d?.result ?? []); setTotal(d?.meta?.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword])

  // 🔥 THÊM LOGIC RESET TRANG
  useEffect(() => { setPage(1) }, [keyword])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (s: Skill) => { setEditing(s); setOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      await skillService.remove(id)
      notification.success({ message: 'Deleted' })
      load()
    } catch (e) {
    }
  }

  const columns = [
    // Index vẫn tính theo state 'page' (1-based) nên không thay đổi gì cả
    { title: '#', key: 'idx', render: (_: any, __: any, i: number) => (page - 1) * 20 + i + 1, width: 60 },
    { title: 'Skill', dataIndex: 'name', key: 'name',
      render: (v: string) => <Tag color="blue" style={{ fontSize: 13, padding: '3px 10px' }}>{v}</Tag> },
    { title: 'Actions', key: 'actions', width: 140, render: (_: any, r: Skill) => (
      <Space>
        <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
        <Popconfirm title="Delete skill?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div><h1 className={styles.title}>Skills</h1><p className={styles.sub}>{total} skills</p></div>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search skill..." value={keyword}
            onChange={e => setKeyword(e.target.value)} style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Skill</Button>
        </Space>
      </div>

      <div style={{ background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:20 }}>
        <div style={{color:'var(--tx1)', fontFamily:'var(--fd)',fontWeight:700,fontSize:14,marginBottom:14 }}>All Skills</div>
        <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
          {skills.map(s => (
            <Tag key={s.id} color="blue" style={{ fontSize:13,padding:'4px 14px',cursor:'pointer' }}
              onClick={() => openEdit(s)}>{s.name}</Tag>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <Table dataSource={skills} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }} />
      </div>

      <SkillModal open={open} onClose={() => setOpen(false)} onSuccess={load} editing={editing} />
    </div>
  )
}

export default AdminSkillsPage