import React, { useEffect, useState, useCallback } from 'react'
import { Tabs, Table, Button, Tag, App, Popconfirm, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { roleService, permissionService } from '../../../services/role.service'
import type { Role, Permission } from '../../../types'
import RoleModal from './RoleModal'
import PermissionModal from './PermissionModal'
import styles from '../AdminPage.module.css'

const METHOD_COLOR: Record<string, string> = { GET:'blue', POST:'green', PUT:'orange', DELETE:'red', PATCH:'purple' }

const AdminRolesPage: React.FC = () => {
  const { notification } = App.useApp()

  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  const [perms, setPerms] = useState<Permission[]>([])
  const [permsTotal, setPermsTotal] = useState(0)
  const [permsLoading, setPermsLoading] = useState(true)
  const [allPerms, setAllPerms] = useState<Permission[]>([])

  const [roleOpen, setRoleOpen] = useState(false)
  const [permOpen, setPermOpen] = useState(false)
  
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)

  const loadRoles = useCallback(() => {
    setRolesLoading(true)
    roleService.getAll({ size: 50 }).then(d => setRoles(d?.result ?? [])).finally(() => setRolesLoading(false))
  }, [])

  const loadPerms = useCallback(() => {
    setPermsLoading(true)
    permissionService.getAll({ size: 1000 }).then(d => { 
      setPerms(d?.result ?? [])
      setPermsTotal(d?.meta.totalItems ?? 0)
      setAllPerms(d?.result ?? []) 
    }).finally(() => setPermsLoading(false))
  }, [])

  useEffect(() => { loadRoles(); loadPerms() }, [loadRoles, loadPerms])

  const handleDeleteRole = async (id: number) => { await roleService.remove(id); notification.success({ message: 'Deleted' }); loadRoles() }
  const handleDeletePerm = async (id: number) => { await permissionService.remove(id); notification.success({ message: 'Deleted' }); loadPerms() }

  const roleColumns = [
    { title: 'Role', dataIndex: 'name', key: 'name', render: (v: string) => <strong>{v}</strong> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Permissions', key: 'perms', render: (_: any, r: Role) => (
      <Space wrap size={4}>
        <Tag color="default">{r.permissions?.length ?? 0} perms</Tag>
        {r.permissions?.slice(0,2).map(p => <Tag key={p.id} color="blue" style={{ fontSize: 11 }}>{p.name}</Tag>)}
        {(r.permissions?.length ?? 0) > 2 && <Tag style={{ fontSize: 11 }}>+{r.permissions.length - 2}</Tag>}
      </Space>
    )},
    { title: 'Status', dataIndex: 'active', key: 'active', render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Actions', key: 'actions', render: (_: any, r: Role) => (
      <Space>
        <Button size="small" onClick={() => { setEditingRole(r); setRoleOpen(true) }}>Edit</Button>
        <Popconfirm title="Delete role?" onConfirm={() => handleDeleteRole(r.id)} okButtonProps={{ danger: true }}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  const permColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string) => <strong>{v}</strong> },
    { title: 'API Path', dataIndex: 'apiPath', key: 'apiPath',
      render: (v: string) => <code style={{ fontFamily:'var(--fm)',fontSize:12,background:'var(--surf2)',padding:'2px 8px',borderRadius:4 }}>{v}</code> },
    { title: 'Method', dataIndex: 'method', key: 'method',
      render: (v: string) => <Tag color={METHOD_COLOR[v] ?? 'default'}>{v}</Tag> },
    { title: 'Module', dataIndex: 'module', key: 'module', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Actions', key: 'actions', render: (_: any, r: Permission) => (
      <Space>
        <Button size="small" onClick={() => { setEditingPerm(r); setPermOpen(true) }}>Edit</Button>
        <Popconfirm title="Delete?" onConfirm={() => handleDeletePerm(r.id)} okButtonProps={{ danger: true }}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div><h1 className={styles.title}>Roles & Permissions</h1></div>
      </div>

      <Tabs defaultActiveKey="roles" items={[
        {
          key: 'roles', label: '🛡 Roles',
          children: (
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ display:'flex',justifyContent:'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); setRoleOpen(true) }}>Add Role</Button>
              </div>
              <div className={styles.tableWrap}>
                <Table dataSource={roles} columns={roleColumns} rowKey="id" loading={rolesLoading} pagination={false} />
              </div>
            </div>
          ),
        },
        {
          key: 'perms', label: '🔑 Permissions',
          children: (
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ display:'flex',justifyContent:'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPerm(null); setPermOpen(true) }}>Add Permission</Button>
              </div>
              <div className={styles.tableWrap}>
                <Table dataSource={perms} columns={permColumns} rowKey="id" loading={permsLoading}
                  pagination={{ total: permsTotal, pageSize: 20 }} scroll={{ x: 700 }} />
              </div>
            </div>
          ),
        },
      ]} />

      <RoleModal open={roleOpen} onClose={() => setRoleOpen(false)} onSuccess={loadRoles} editing={editingRole} allPerms={allPerms} />
      <PermissionModal open={permOpen} onClose={() => setPermOpen(false)} onSuccess={loadPerms} editing={editingPerm} />
    </div>
  )
}

export default AdminRolesPage