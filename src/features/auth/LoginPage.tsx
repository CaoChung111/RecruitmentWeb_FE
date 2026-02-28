import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, App } from 'antd'
import { useAppDispatch, useAppSelector } from '../../store'
import { loginThunk, selectAuth, selectIsAuth } from '../../store/slices/authSlice'
import styles from './AuthPage.module.css'

const LoginPage: React.FC = () => {
  const { notification } = App.useApp()
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  
  const { loading } = useAppSelector(selectAuth)
  const isAuthenticated = useAppSelector(selectIsAuth)

  // Lấy callback url từ query params (nếu có)
  const params = new URLSearchParams(location.search)
  const callback = params?.get("callback")

  // Nếu đã đăng nhập thì tự động chuyển hướng, không cho ở lại trang Login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const onFinish = async (values: { username: string; password: string }) => {
    const res = await dispatch(loginThunk(values))
    if (loginThunk.fulfilled.match(res)) {
      notification.success({ message: 'Welcome back!' })
      // Ưu tiên navigate về trang callback, nếu không có thì về trang chủ
      navigate(callback ? callback : '/') 
    } else {
      // Đã comment thông báo lỗi ở đây vì file api.ts interceptor đã tự động báo lỗi rồi
      // notification.error({ message: 'Sign in failed', description: res.payload as string })
    }
  }

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.sub}>Sign in to your JobHunter account</p>
      </div>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="username" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
          <Input size="large" type="email" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item
          name="password"
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Password</span>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--p600)' }}>Forgot?</Link>
            </div>
          }
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password size="large" placeholder="••••••••" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}
            style={{ height: 48, fontSize: 15, fontWeight: 600 }}>
            Sign in
          </Button>
        </Form.Item>
      </Form>

      <p className={styles.footer}>
        No account? <Link to="/register" style={{ color: 'var(--p600)', fontWeight: 600 }}>Create one free →</Link>
      </p>
    </div>
  )
}

export default LoginPage