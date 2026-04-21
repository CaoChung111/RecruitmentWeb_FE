import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { App as AntApp, ConfigProvider } from 'antd'
import { store, useAppDispatch, useAppSelector } from '../store'
import { fetchAccountThunk, selectIsAuth } from '../store/slices/authSlice'
import { useTheme } from '../hooks/useTheme'
import { lightTheme, darkTheme } from './theme'
import ClientLayout from '../layouts/ClientLayout'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import HomePage from '../features/home/HomePage'
import JobListPage from '../features/jobs/JobListPage'
import JobDetailPage from '../features/jobs/JobDetailPage'
import CompanyListPage from '../features/companies/CompanyListPage'
import CompanyDetailPage from '../features/companies/CompanyDetailPage'
import MyResumesPage from '../features/resumes/MyResumesPage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import AdminDashboard from '../features/admin/dashboard/AdminDashboard'
import AdminJobsPage from '../features/admin/jobs/AdminJobsPage'
import AdminCompaniesPage from '../features/admin/companies/AdminCompaniesPage'
import AdminResumesPage from '../features/admin/resumes/AdminResumesPage'
import AdminUsersPage from '../features/admin/users/AdminUsersPage'
import AdminSkillsPage from '../features/admin/skills/AdminSkillsPage'
import AdminRolesPage from '../features/admin/roles/AdminRolesPage'
import NotPermittedPage from '../features/auth/NotPermittedPage';
import '../styles/global.css'
import AdminSubscribersPage from '@/features/admin/subscribers/AdminSubscriberPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = useAppSelector(selectIsAuth)
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppSelector(s => s.auth.user)
  const isAuth = useAppSelector(selectIsAuth)
  
  if (!isAuth) return <Navigate to="/login" replace />
  
  if (user?.role?.name === "CANDIDATE" || user?.role?.name === "USER") {
    return <Navigate to="/not-permitted" replace /> 
  }
  
  return <>{children}</>
}

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isDark } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) dispatch(fetchAccountThunk())
  }, [dispatch])

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <AntApp>
        <Routes>
          {/* Client */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/companies" element={<CompanyListPage />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            <Route path="/resumes" element={<ProtectedRoute><MyResumesPage /></ProtectedRoute>} />
          </Route>
          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="resumes" element={<AdminResumesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="subscribers" element={<AdminSubscribersPage />} />
          </Route>
          <Route path="/not-permitted" element={<NotPermittedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AntApp>
    </ConfigProvider>
  )
}

const App: React.FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </Provider>
)

export default App
