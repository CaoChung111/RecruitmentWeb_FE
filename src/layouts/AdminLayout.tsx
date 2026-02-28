import React, { useState, useMemo } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Layout, Avatar, Dropdown, Badge, Tooltip } from 'antd'
import {
  DashboardOutlined, FileTextOutlined, BankOutlined,
  FileDoneOutlined, TeamOutlined, ToolOutlined,
  SafetyOutlined, LogoutOutlined, BellOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../store'
import { logoutThunk, selectUser } from '../store/slices/authSlice'
import { useTheme } from '../hooks/useTheme'
import { ALL_PERMISSIONS } from '../constants/permissions'
import styles from './AdminLayout.module.css'

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const user      = useAppSelector(selectUser)
  const { isDark, toggle } = useTheme()

  // 🔥 Logic lọc Menu động dựa trên mảng permissions của user
  const filteredNav = useMemo(() => {
    const permissions = user?.role?.permissions || []
    
    // Hàm kiểm tra quyền
    const hasPerm = (req: any) => 
      permissions.some((p: any) => p.apiPath === req.apiPath && p.method === req.method)
    
    // Check Super Admin hoặc ACL Enable
    const isSuper = user?.role?.name === 'SUPER_ADMIN' || import.meta.env.VITE_ACL_ENABLE === 'false'

    // Khai báo mảng Nav gốc kèm điều kiện hiển thị (show)
    return [
      { label: 'Dashboard', path: '/admin', icon: <DashboardOutlined />, show: true }, // Luôn hiện
      { label: 'Jobs', path: '/admin/jobs', icon: <FileTextOutlined />, show: isSuper || hasPerm(ALL_PERMISSIONS.JOBS.GET_PAGINATE) },
      { label: 'Companies', path: '/admin/companies', icon: <BankOutlined />, show: isSuper || hasPerm(ALL_PERMISSIONS.COMPANIES.GET_PAGINATE) },
      { label: 'Resumes', path: '/admin/resumes', icon: <FileDoneOutlined />, show: isSuper || hasPerm(ALL_PERMISSIONS.RESUMES.GET_PAGINATE) },
      { label: 'Users', path: '/admin/users', icon: <TeamOutlined />, show: isSuper || hasPerm(ALL_PERMISSIONS.USERS.GET_PAGINATE) },
      { label: 'Skills', path: '/admin/skills', icon: <ToolOutlined />, show: isSuper || hasPerm(ALL_PERMISSIONS.SKILLS.GET_PAGINATE) },
      { label: 'Roles & Perms', path: '/admin/roles', icon: <SafetyOutlined />, show: isSuper || hasPerm(ALL_PERMISSIONS.ROLES.GET_PAGINATE) },
    ].filter(item => item.show) // Chỉ giữ lại các item thỏa mãn điều kiện
  }, [user])

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/login')
  }

  const userMenu = {
    items: [
      { key: 'home',   label: 'Back to site',  onClick: () => navigate('/') },
      { type: 'divider' as const },
      { key: 'logout', label: <span style={{ color: '#ef4444' }}>Sign out</span>, icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  }

  return (
    <Layout className={styles.root}>
      {/* ── Sidebar ── */}
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        collapsedWidth={64}
        className={styles.sider}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>J</div>
          {!collapsed && <span className={styles.logoText}>JobHunter</span>}
        </div>

        {!collapsed && <div className={styles.sectionLabel}>Navigation</div>}

        {/* Nav */}
        <nav className={styles.nav}>
          {filteredNav.map(({ label, path, icon }) => (
            <Tooltip key={path} title={collapsed ? label : ''} placement="right">
              <NavLink
                to={path}
                end={path === '/admin'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{icon}</span>
                {!collapsed && <span className={styles.navLabel}>{label}</span>}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        {/* User */}
        <div className={styles.siderBottom}>
          <Dropdown menu={userMenu} placement="topLeft" trigger={['click']}>
            <div className={styles.userCard}>
              <Avatar size={32} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {user?.username?.charAt(0).toUpperCase() ?? 'A'}
              </Avatar>
              {!collapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.username}</span>
                  <span className={styles.userRole}>{user?.role?.name}</span>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </Layout.Sider>

      {/* ── Content ── */}
      <Layout className={styles.content}>
        {/* Topbar */}
        <Layout.Header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.collapseBtn} onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>
          <div className={styles.headerRight}>
            <Badge count={3} size="small">
              <button className={styles.iconBtn}><BellOutlined /></button>
            </Badge>
            <button className={styles.iconBtn} onClick={toggle}>
              <BulbOutlined style={{ color: isDark ? '#f59e0b' : undefined }} />
            </button>
          </div>
        </Layout.Header>

        {/* Page */}
        <Layout.Content className={styles.page}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout