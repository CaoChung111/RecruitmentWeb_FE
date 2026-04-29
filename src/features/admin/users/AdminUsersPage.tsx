import React, { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tag, Space, Input, App, Popconfirm, Segmented } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { userService } from '../../../services/user.service'
import { companyService } from '../../../services/company.service'
import { roleService } from '../../../services/role.service'
import type { User, Company, Role } from '../../../types'
import { formatDate } from '../../../utils/format'
import UserModal from './UserModal'
import HasPermission from '../../../components/common/HasPermission'

// 🔥 Import file cấu hình quyền của bạn vào đây
import { ALL_PERMISSIONS } from '../../../constants/permissions' 
import styles from '../AdminPage.module.css'

const AdminUsersPage: React.FC = () => {
  const { notification } = App.useApp()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  
  // State để lật Tab (Hoạt động / Bị khóa)
  const [isTrashView, setIsTrashView] = useState(false)
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  const load = useCallback(() => {
    setLoading(true)
    
    const params: any = { 
      page: page, 
      size: 10 
    }
    if (keyword) {
      params.filter = `email~'*${keyword}*'` 
    }

    // Gọi API theo Tab hiện tại (getInactive map với /trash)
    const apiCall = isTrashView ? userService.getInactive(params) : userService.getAll(params)

    apiCall
      .then(d => { setUsers(d?.result ?? []); setTotal(d?.meta?.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword, isTrashView])

  // Reset trang về 1 khi đổi tìm kiếm hoặc đổi Tab
  useEffect(() => { setPage(1) }, [keyword, isTrashView])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    companyService.getAll({ pageSize: 100 }).then(d => setCompanies(d?.result ?? []))
    roleService.getAll({ pageSize: 50 }).then(d => setRoles(d?.result ?? []))
  }, [])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (u: User) => { setEditing(u); setOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      await userService.softDelete(id)
      notification.success({ message: 'Account locked successfully' })
      load()
    } catch {
      // Error notification is handled globally by api.ts interceptor
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await userService.restore(id)
      notification.success({ message: 'Account restored successfully' })
      load()
    } catch {
      // Error notification is handled globally by api.ts interceptor
    }
  }

  const columns = [
    { title: 'User', key: 'user', render: (_: any, r: User) => (
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontFamily:'var(--fd)',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          {r.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:600 }}>
            {r.name}
            {isTrashView && <span style={{ color: 'red', fontSize: 12, marginLeft: 8 }}>(DISABLED)</span>}
          </div>
          <div style={{ fontSize:12,color:'var(--tx3)' }}>{r.email}</div>
        </div>
      </div>
    )},
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'Company', key: 'company', render: (_: any, r: User) => r.company?.name ?? '—' },
    { title: 'Role', key: 'role', render: (_: any, r: User) => {
      const colors: Record<string, string> = { SUPER_ADMIN:'red', HR_MANAGER:'blue', USER:'green', CANDIDATE:'orange' }
      return <Tag color={colors[r.role?.name ?? ''] ?? 'default'}>{r.role?.name ?? '—'}</Tag>
    }},
    { title: 'Joined', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => <span style={{ fontSize:12,color:'var(--tx3)' }}>{formatDate(v)}</span> },
    { title: 'Actions', key: 'actions', render: (_: any, r: User) => (
      <Space>
        {isTrashView ? (
          // NẾU Ở TAB KHÓA: Chỉ hiện nút Restore
          <HasPermission requiredPermission={ALL_PERMISSIONS.USERS.RESTORE}>
            <Popconfirm title="Restore this account?" onConfirm={() => handleRestore(r.id)}>
              <Button size="small" type="primary" ghost icon={<ReloadOutlined />}>Restore</Button>
            </Popconfirm>
          </HasPermission>
        ) : (
          // NẾU Ở TAB BÌNH THƯỜNG: Hiện Sửa và Khóa
          <>
            <HasPermission requiredPermission={ALL_PERMISSIONS.USERS.UPDATE}>
              <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
            </HasPermission>
            
            <HasPermission requiredPermission={ALL_PERMISSIONS.USERS.DELETE}>
              <Popconfirm title="Lock this account?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
                <Button size="small" danger>Lock</Button>
              </Popconfirm>
            </HasPermission>
          </>
        )}
      </Space>
    )},
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div><h1 className={styles.title}>{isTrashView ? 'Locked Users' : 'Users'}</h1><p className={styles.sub}>{total.toLocaleString()} users</p></div>
        <Space>
          
          {/* 🔥 Dùng ALL_PERMISSIONS.USERS.VIEW_DISABLE cho nút chuyển tab */}
          <HasPermission requiredPermission={ALL_PERMISSIONS.USERS.VIEW_DISABLE}>
            <Segmented 
              options={['Active', 'Locked']} 
              value={isTrashView ? 'Locked' : 'Active'}
              onChange={(val) => setIsTrashView(val === 'Locked')}
            />
          </HasPermission>

          <Input prefix={<SearchOutlined />} placeholder="Search by email..." value={keyword}
            onChange={e => setKeyword(e.target.value)} style={{ width: 220 }} />
          
          {/* Ẩn nút tạo User nếu đang ở Tab Bị Khóa */}
          {!isTrashView && (
            <HasPermission requiredPermission={ALL_PERMISSIONS.USERS.CREATE}>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add User</Button>
            </HasPermission>
          )}
          
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