import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Select, InputNumber, Button, App } from 'antd'
import { authService } from '../../services/auth.service'
import { LOCATIONS } from '../../constants'
import styles from './AuthPage.module.css'

const RegisterPage: React.FC = () => {
  const { notification } = App.useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await authService.register(values)
      notification.success({ message: 'Account created! Please sign in.' })
      navigate('/login')
    } catch (error: any) {
      // Bỏ notification.error vì interceptor đã lo hiển thị lỗi chi tiết từ backend
      console.log("Register failed: ", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <h2 className={styles.title}>Create account</h2>
        <p className={styles.sub}>Join 50,000+ professionals on JobHunter</p>
      </div>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input size="large" placeholder="Nguyen Van A" />
          </Form.Item>
          <Form.Item name="age" label="Age" rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}>
            <InputNumber size="large" style={{ width: '100%' }} min={16} max={70} placeholder="25" />
          </Form.Item>
        </div>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
          <Input size="large" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
          <Input.Password size="large" placeholder="Min 6 characters" />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
            <Select size="large" options={[{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'OTHER' }]} />
          </Form.Item>
          <Form.Item name="address" label="City" rules={[{ required: true, message: 'Vui lòng chọn thành phố!' }]}>
            <Select size="large" options={LOCATIONS.map((l: string) => ({ label: l, value: l }))} />
          </Form.Item>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}
            style={{ height: 48, fontSize: 15, fontWeight: 600 }}>
            Create account
          </Button>
        </Form.Item>
      </Form>

      <p className={styles.footer}>
        Already have an account? <Link to="/login" style={{ color: 'var(--p600)', fontWeight: 600 }}>Sign in →</Link>
      </p>
    </div>
  )
}

export default RegisterPage