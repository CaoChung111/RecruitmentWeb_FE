import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Select, InputNumber, Button, notification } from 'antd'
import { authService } from '../../services/auth.service'
import { LOCATIONS } from '../../constants'
import styles from './AuthPage.module.css'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER')
  
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registerPayload, setRegisterPayload] = useState<any>(null)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    let timer: any
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  const onRegisterSubmit = async (values: any) => {
    setLoading(true);
    setRegisteredEmail(values.email);
    setRegisterPayload(values);

    try {
      // Axios tự động coi các mã 2xx (như 201) là thành công và chạy vào đây
      await authService.register(values);

      notification.success({ 
        message: 'Register successfully!', 
        description: 'Please check the OTP code in your email.' 
      });
      setStep('OTP');
      setCountdown(60);

    } catch (error: any) {
      console.error("Registration failed:", error);
      
      // Xử lý riêng trường hợp bị Timeout do backend phản hồi quá chậm
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        notification.warning({
          message: 'Server is slow',
          description: 'The system is processing your email request. Please check your inbox in a few minutes.',
          duration: 6
        });
      } else {
        const errorMessage = error?.response?.data?.message || 'An error occurred, please try again.';
        notification.error({
          message: 'Registration failed',
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtpSubmit = async (values: { otp: string }) => {
    setLoading(true)
    try {
      await authService.verifyOtp(registeredEmail, values.otp)
      
      notification.success({ 
        message: 'Verification successful!', 
        description: 'Your account has been activated. Please login now.' 
      })
      navigate('/login')
    } catch (error: any) {
      console.error("Verification failed: ", error)
      notification.error({
        message: 'Verification failed',
        description: error?.response?.data?.message || 'The OTP is invalid or has expired.'
      });
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!registerPayload) return
    setLoading(true)
    try {
      await authService.register(registerPayload) 
      notification.success({ message: 'OTP resent successfully!', description: 'Please check your email.' })
      setCountdown(60)
    } catch (error: any) {
      console.error("Failed to resend OTP: ", error)
      notification.error({ 
        message: 'Error', 
        description: error?.response?.data?.message || 'Cannot resend OTP at this time.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          {step === 'REGISTER' ? 'Create account' : 'Verify Email'}
        </h2>
        <p className={styles.sub}>
          {step === 'REGISTER' 
            ? 'Join 50,000+ professionals on JobHunter' 
            : `OTP has been sent to your email: ${registeredEmail}`}
        </p>
      </div>

      {step === 'REGISTER' && (
        <Form layout="vertical" onFinish={onRegisterSubmit} requiredMark={false}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Please enter your full name!' }]}>
              <Input size="large" placeholder="John Doe" />
            </Form.Item>
            <Form.Item name="age" label="Age" rules={[{ required: true, message: 'Please enter your age!' }]}>
              <InputNumber size="large" style={{ width: '100%' }} min={16} max={70} placeholder="22" />
            </Form.Item>
          </div>
          
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>
          
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}>
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select your gender!' }]}>
              <Select size="large" options={[{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'OTHER' }]} />
            </Form.Item>
            <Form.Item name="address" label="City" rules={[{ required: true, message: 'Please select your city!' }]}>
              <Select size="large" options={LOCATIONS.map((l: string) => ({ label: l, value: l }))} placeholder="Select city" />
            </Form.Item>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}
              style={{ height: 48, fontSize: 15, fontWeight: 600 }}>
              Create account
            </Button>
          </Form.Item>
        </Form>
      )}

      {step === 'OTP' && (
        <Form layout="vertical" onFinish={onVerifyOtpSubmit} requiredMark={false}>
          <Form.Item 
            name="otp" 
            rules={[
              { required: true, message: 'Please enter the OTP!' },
              { len: 6, message: 'OTP must be 6 characters long!' }
            ]}
          >
            <Input 
              size="large" 
              placeholder="000000" 
              maxLength={6} 
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', height: 48 }} 
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}
              style={{ height: 48, fontSize: 15, fontWeight: 600 }}>
              Verify & Sign in
            </Button>
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <Button type="link" onClick={() => setStep('REGISTER')} disabled={loading} style={{ padding: 0 }}>
              ← Đổi email
            </Button>

            {countdown > 0 ? (
              <span style={{ color: 'gray' }}>
                Gửi lại mã sau <b>{countdown}s</b>
              </span>
            ) : (
              <Button type="link" onClick={handleResendOtp} disabled={loading} style={{ padding: 0 }}>
                Gửi lại mã OTP
              </Button>
            )}
          </div>
        </Form>
      )}

      {step === 'REGISTER' && (
        <p className={styles.footer}>
          Already have an account? <Link to="/login" style={{ color: 'var(--p600)', fontWeight: 600 }}>Sign in →</Link>
        </p>
      )}
    </div>
  )
}

export default RegisterPage