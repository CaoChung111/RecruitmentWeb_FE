import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, App } from 'antd'
import { MailOutlined, LockOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { authService } from '../../services/auth.service'
import styles from './AuthPage.module.css'

type Step = 'EMAIL' | 'OTP' | 'RESET' | 'SUCCESS'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { notification } = App.useApp()

  const [step, setStep] = useState<Step>('EMAIL')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown timer cho nút gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // ── BƯỚC 1: Gửi OTP về email ──────────────────────────────────
  const handleEmailSubmit = async (values: { email: string }) => {
    setLoading(true)
    try {
      await authService.forgotPassword(values.email)
      setEmail(values.email)
      setStep('OTP')
      setCountdown(60)
      notification.success({
        message: 'OTP sent!',
        description: `We've sent a 6-digit code to ${values.email}`,
      })
    } catch (error: any) {
      notification.error({
        message: 'Failed to send OTP',
        description: error?.response?.data?.message || 'Email not found or an error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ── BƯỚC 2: Xác nhận OTP ──────────────────────────────────────
  const handleOtpSubmit = (values: { otp: string }) => {
    setOtp(values.otp)
    setStep('RESET')
  }

  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setCountdown(60)
      notification.success({ message: 'OTP resent!', description: 'Please check your inbox.' })
    } catch (error: any) {
      notification.error({
        message: 'Failed to resend',
        description: error?.response?.data?.message || 'Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ── BƯỚC 3: Đặt lại mật khẩu ─────────────────────────────────
  const handleResetSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({ message: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(email, otp, values.newPassword)
      setStep('SUCCESS')
    } catch (error: any) {
      notification.error({
        message: 'Reset failed',
        description: error?.response?.data?.message || 'OTP may be invalid or expired.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Step indicators ───────────────────────────────────────────
  const stepIndex = { EMAIL: 0, OTP: 1, RESET: 2, SUCCESS: 3 }[step]
  const STEPS = ['Email', 'Verify OTP', 'New Password']

  return (
    <div className={styles.box}>
      {/* Header */}
      <div className={styles.head}>
        <h2 className={styles.title}>
          {step === 'SUCCESS' ? '✅ All done!' : 'Forgot password?'}
        </h2>
        <p className={styles.sub}>
          {step === 'EMAIL' && 'Enter your email and we\'ll send a reset code.'}
          {step === 'OTP' && `Enter the 6-digit code sent to ${email}`}
          {step === 'RESET' && 'Choose a strong new password.'}
          {step === 'SUCCESS' && 'Your password has been reset successfully.'}
        </p>
      </div>

      {/* Step progress dots (only show for 3 active steps) */}
      {step !== 'SUCCESS' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
          {STEPS.map((label, i) => (
            <div
              key={label}
              title={label}
              style={{
                width: i === stepIndex ? 28 : 8,
                height: 8,
                borderRadius: 999,
                background: i <= stepIndex ? 'var(--p600)' : 'var(--bdr)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── STEP 1: Email ── */}
      {step === 'EMAIL' && (
        <Form layout="vertical" onFinish={handleEmailSubmit} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email address"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              id="forgot-email"
              size="large"
              prefix={<MailOutlined style={{ color: 'var(--tx3)' }} />}
              placeholder="you@example.com"
            />
          </Form.Item>

          <Form.Item>
            <Button
              id="forgot-send-otp-btn"
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ height: 48, fontSize: 15, fontWeight: 600 }}
            >
              Send reset code
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === 'OTP' && (
        <Form layout="vertical" onFinish={handleOtpSubmit} requiredMark={false}>
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: 'Please enter the OTP!' },
              { len: 6, message: 'OTP must be exactly 6 digits!' },
            ]}
          >
            <Input
              id="forgot-otp-input"
              size="large"
              placeholder="000000"
              maxLength={6}
              style={{
                textAlign: 'center',
                letterSpacing: '10px',
                fontSize: '22px',
                height: 52,
                fontWeight: 700,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              id="forgot-verify-otp-btn"
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ height: 48, fontSize: 15, fontWeight: 600 }}
            >
              Verify Code
            </Button>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => setStep('EMAIL')}
              style={{ padding: 0 }}
            >
              Change email
            </Button>

            {countdown > 0 ? (
              <span style={{ color: 'var(--tx3)', fontSize: 13 }}>
                Resend in <b style={{ color: 'var(--tx2)' }}>{countdown}s</b>
              </span>
            ) : (
              <Button
                id="forgot-resend-btn"
                type="link"
                onClick={handleResendOtp}
                loading={loading}
                style={{ padding: 0 }}
              >
                Resend code
              </Button>
            )}
          </div>
        </Form>
      )}

      {/* ── STEP 3: New Password ── */}
      {step === 'RESET' && (
        <Form layout="vertical" onFinish={handleResetSubmit} requiredMark={false}>
          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: 'Please enter a new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              id="forgot-new-password"
              size="large"
              prefix={<LockOutlined style={{ color: 'var(--tx3)' }} />}
              placeholder="Min 6 characters"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match!'))
                },
              }),
            ]}
          >
            <Input.Password
              id="forgot-confirm-password"
              size="large"
              prefix={<LockOutlined style={{ color: 'var(--tx3)' }} />}
              placeholder="Re-enter password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              id="forgot-reset-btn"
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ height: 48, fontSize: 15, fontWeight: 600 }}
            >
              Reset password
            </Button>
          </Form.Item>

          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => setStep('OTP')}
            style={{ padding: 0, display: 'block' }}
          >
            Back to OTP
          </Button>
        </Form>
      )}

      {/* ── STEP 4: Success ── */}
      {step === 'SUCCESS' && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(5,150,105,.3)',
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>

          <p style={{ color: 'var(--tx2)', marginBottom: 24, lineHeight: 1.7 }}>
            You can now sign in with your new password.
          </p>

          <Button
            id="forgot-goto-login-btn"
            type="primary"
            size="large"
            block
            onClick={() => navigate('/login')}
            style={{ height: 48, fontSize: 15, fontWeight: 600 }}
          >
            Sign in now
          </Button>
        </div>
      )}

      {/* Footer link */}
      {step !== 'SUCCESS' && (
        <p className={styles.footer}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--p600)', fontWeight: 600 }}>
            Sign in →
          </Link>
        </p>
      )}
    </div>
  )
}

export default ForgotPasswordPage
