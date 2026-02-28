import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Button, Dropdown, Avatar } from 'antd'
import { BulbOutlined, LogoutOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../store'
import { logoutThunk, selectUser, selectIsAuth } from '../store/slices/authSlice'
import { useTheme } from '../hooks/useTheme'
import { Footer } from './Footer'
import styles from './ClientLayout.module.css'

const ClientLayout: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth   = useAppSelector(selectIsAuth)
  const user     = useAppSelector(selectUser)
  const { isDark, toggle } = useTheme()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/login')
  }

  const userMenu = {
    items: [
      { key: 'resumes', label: 'My Applications', icon: <FileTextOutlined />, onClick: () => navigate('/resumes') },
      
      (user?.role?.name !== 'CANDIDATE') || (user?.role?.permissions?.length)
        ? { key: 'admin', label: 'Admin Panel', icon: <UserOutlined />, onClick: () => navigate('/admin') }
        : null,
        
      { type: 'divider' as const },
      { key: 'logout', label: <span style={{ color: '#ef4444' }}>Sign out</span>, icon: <LogoutOutlined />, onClick: handleLogout },
    ].filter(Boolean) as any[],
  }

  return (
    <div className={styles.root}>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <NavLink to="/" className={styles.logo}>
            <span className={styles.logoMark}>J</span>
            <span className={styles.logoText}>JobHunter</span>
          </NavLink>

          <nav className={styles.nav}>
            <NavLink to="/jobs"      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>Find Jobs</NavLink>
            <NavLink to="/companies" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>Companies</NavLink>
            {isAuth && (
              <NavLink to="/resumes" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>My Resumes</NavLink>
            )}
          </nav>

          <div className={styles.actions}>
            <button className={styles.themeBtn} onClick={toggle}>
              <BulbOutlined style={{ color: isDark ? '#f59e0b' : undefined }} />
            </button>

            {isAuth ? (
              <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                <Avatar
                  size={36}
                  style={{ cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', fontWeight: 700 }}
                >
                  {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                </Avatar>
              </Dropdown>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} className={styles.loginBtn}>Sign in</Button>
                <Button type="primary" onClick={() => navigate('/register')}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default ClientLayout
