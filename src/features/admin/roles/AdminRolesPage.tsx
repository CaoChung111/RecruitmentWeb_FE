import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Tabs, Table, Button, Tag, App, Popconfirm, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { roleService, permissionService } from '../../../services/role.service'
import type { Role, Permission } from '../../../types'
import RoleModal from './RoleModal'
import PermissionModal from './PermissionModal'
import styles from '../AdminPage.module.css'
import { Collapse } from 'antd'
const { Panel } = Collapse

const METHOD_COLOR: Record<string, string> = { GET: 'blue', POST: 'green', PUT: 'orange', DELETE: 'red', PATCH: 'purple' }

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

  const handleDeleteRole = async (id: number) => {
    try {
      await roleService.remove(id)
      notification.success({ message: 'Deleted' })
      loadRoles()
    } catch (e: any) {

    }
  }

  const handleDeletePerm = async (id: number) => {
    try {
      await permissionService.remove(id)
      notification.success({ message: 'Deleted' })
      loadPerms()
    } catch (e: any) {

    }
  }

  // 🔥 NHÓM PERMISSIONS THEO MODULE ĐỂ HIỂN THỊ DẠNG CÂY (TREE DATA)
  const groupedPerms = useMemo(() => {
    // 1. Nhóm dữ liệu theo module
    const groups: Record<string, Permission[]> = {}
    perms.forEach(p => {
      const mod = p.module || 'OTHERS'
      if (!groups[mod]) groups[mod] = []
      groups[mod].push(p)
    })

    // 2. Chuyển đổi thành mảng chứa node cha (module) và node con (permissions)
    return Object.entries(groups).map(([moduleName, modulePerms]) => ({
      id: `module-${moduleName}`, // ID ảo cho dòng cha (dòng chứa tên module)
      name: moduleName,
      isModuleRow: true, // Cờ nhận diện dòng cha
      count: modulePerms.length,
      children: modulePerms.map(p => ({
        ...p,
        isModuleRow: false // Cờ nhận diện dòng con (dữ liệu thật)
      }))
    }))
  }, [perms])

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
    { 
      title: 'Name / Module', 
      dataIndex: 'name', 
      key: 'name', 
      render: (v: string, r: any) => {
        // Render dòng Group Module (Dòng cha)
        if (r.isModuleRow) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--p600)' }}>
                📁 MODULE: {v.toUpperCase()}
              </span>
              <Tag color="default" style={{ borderRadius: 10 }}>{r.count} items</Tag>
            </div>
          )
        }
        // Render dòng Permission bình thường (Dòng con)
        return <strong style={{ marginLeft: 8 }}>{v}</strong>
      }
    },
    { 
      title: 'API Path', 
      dataIndex: 'apiPath', 
      key: 'apiPath',
      render: (v: string, r: any) => {
        if (r.isModuleRow) return null; // Ẩn ở dòng cha
        return <code style={{ fontFamily:'var(--fm)',fontSize:12,background:'var(--surf2)',padding:'2px 8px',borderRadius:4 }}>{v}</code>
      }
    },
    { 
      title: 'Method', 
      dataIndex: 'method', 
      key: 'method',
      render: (v: string, r: any) => {
        if (r.isModuleRow) return null;
        return <Tag color={METHOD_COLOR[v] ?? 'default'} style={{ minWidth: 60, textAlign: 'center' }}>{v}</Tag>
      }
    },
    { 
      title: 'Module', 
      dataIndex: 'module', 
      key: 'module', 
      render: (v: string, r: any) => {
        if (r.isModuleRow) return null;
        return <Tag>{v}</Tag>
      }
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      width: 150,
      render: (_: any, r: any) => {
        if (r.isModuleRow) return null; // Dòng cha không có action sửa xóa
        return (
          <Space>
            <Button size="small" onClick={() => { setEditingPerm(r); setPermOpen(true) }}>Edit</Button>
            <Popconfirm title="Delete?" onConfirm={() => handleDeletePerm(r.id)} okButtonProps={{ danger: true }}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          </Space>
        )
      }
    },
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
          key: 'perms',
          label: '🔑 Permissions',
          children: (
            <div style={{ display:'flex',flexDirection:'column',gap:20 }}>

              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <h2 style={{ margin:0 }}>Permission Management</h2>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => { setEditingPerm(null); setPermOpen(true) }}
                >
                  Add Permission
                </Button>
              </div>

              <Collapse
                accordion
                bordered={false}
                expandIconPosition="end"
                style={{ background:'transparent' }}
              >
                {Object.entries(
                  perms.reduce((acc: Record<string, Permission[]>, p) => {
                    const mod = p.module || 'OTHERS'
                    if (!acc[mod]) acc[mod] = []
                    acc[mod].push(p)
                    return acc
                  }, {})
                ).map(([moduleName, modulePerms]) => (

                  <Panel
                    key={moduleName}
                    header={
                      <div style={{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        width:'100%'
                      }}>
                        <span style={{ fontWeight:700,fontSize:15 }}>
                          📦 {moduleName}
                        </span>
                        <Tag>{modulePerms.length} permissions</Tag>
                      </div>
                    }
                    style={{
                      background:'#fff',
                      borderRadius:14,
                      marginBottom:12,
                      boxShadow:'0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >

                    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>

                      {modulePerms.map(p => (
                        <div
                          key={p.id}
                          style={{
                            display:'flex',
                            justifyContent:'space-between',
                            alignItems:'center',
                            padding:'10px 14px',
                            borderRadius:10,
                            background:'#fafafa'
                          }}
                        >
                          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                            <Tag 
                              color={METHOD_COLOR[p.method] ?? 'default'}
                              style={{ minWidth:60,textAlign:'center',fontWeight:600 }}
                            >
                              {p.method}
                            </Tag>

                            <div style={{ display:'flex',flexDirection:'column' }}>
                              <span style={{ fontWeight:600 }}>{p.name}</span>
                              <code style={{
                                fontSize:12,
                                background:'#f0f2f5',
                                padding:'2px 8px',
                                borderRadius:6
                              }}>
                                {p.apiPath}
                              </code>
                            </div>
                          </div>

                          <Space>
                            <Button 
                              size="small" 
                              type="text"
                              onClick={() => { setEditingPerm(p); setPermOpen(true) }}
                            >
                              Edit
                            </Button>
                            <Popconfirm 
                              title="Delete permission?" 
                              onConfirm={() => handleDeletePerm(p.id)} 
                              okButtonProps={{ danger: true }}
                            >
                              <Button size="small" danger type="text">
                                Delete
                              </Button>
                            </Popconfirm>
                          </Space>
                        </div>
                      ))}

                    </div>

                  </Panel>
                ))}
              </Collapse>
            </div>
          )
        }
      ]} />

      <RoleModal open={roleOpen} onClose={() => setRoleOpen(false)} onSuccess={loadRoles} editing={editingRole} allPerms={allPerms} />
      <PermissionModal open={permOpen} onClose={() => setPermOpen(false)} onSuccess={loadPerms} editing={editingPerm} />
    </div>
  )
}

export default AdminRolesPage