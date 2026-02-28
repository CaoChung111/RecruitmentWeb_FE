import React, { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Input, App, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { userService } from '../../../services/user.service'
import { companyService } from '../../../services/company.service'
import { roleService } from '../../../services/role.service'
import type { User, Company, Role } from '../../../types'
import { formatDate } from '../../../utils/format'
import UserModal from './UserModal'
import styles from '../AdminPage.module.css'

const AdminUsersPage: React.FC = () => {
  const { notification } = App.useApp()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  const load = useCallback(() => {
    setLoading(true)
    userService.getAll({ page, size: 10, email: keyword })
      .then(d => { setUsers(d?.result ?? []); setTotal(d?.meta.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    companyService.getAll({ pageSize: 100 }).then(d => setCompanies(d?.result ?? []))
    roleService.getAll({ pageSize: 50 }).then(d => setRoles(d?.result ?? []))
  }, [])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (u: User) => { setEditing(u); setOpen(true) }

  const handleDelete = async (id: number) => {
    await userService.remove(id)
    notification.success({ message: 'Deleted' }); load()
  }

  const columns = [
    { title: 'User', key: 'user', render: (_: any, r: User) => (
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontFamily:'var(--fd)',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          {r.name?.charAt(0).toUpperCase()}
        </div>
        <div><div style={{ fontWeight:600 }}>{r.name}</div><div style={{ fontSize:12,color:'var(--tx3)' }}>{r.email}</div></div>
      </div>
    )},
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'Company', key: 'company', render: (_: any, r: User) => r.company?.name ?? '—' },
    { title: 'Role', key: 'role', render: (_: any, r: User) => {
      const colors: Record<string, string> = { SUPER_ADMIN:'red', HR_MANAGER:'blue', USER:'green' }
      return <Tag color={colors[r.role?.name ?? ''] ?? 'default'}>{r.role?.name ?? '—'}</Tag>
    }},
    { title: 'Joined', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => <span style={{ fontSize:12,color:'var(--tx3)' }}>{formatDate(v)}</span> },
    { title: 'Actions', key: 'actions', render: (_: any, r: User) => (
      <Space>
        <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
        <Popconfirm title="Delete user?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div><h1 className={styles.title}>Users</h1><p className={styles.sub}>{total.toLocaleString()} users</p></div>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search..." value={keyword}
            onChange={e => setKeyword(e.target.value)} style={{ width: 220 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add User</Button>
        </Space>
      </div>

      <div className={styles.tableWrap}>
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 10, onChange: setPage }} scroll={{ x: 800 }} />
      </div>

      <UserModal open={open} onClose={() => setOpen(false)} onSuccess={load} editing={editing} companies={companies} roles={roles} />
    </div>
  )
}

export default AdminUsersPage