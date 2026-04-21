import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Button, App } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { subscriberService } from '../services/subscriber.service'
import { skillService } from '../services/skill.service'
import { useAppSelector } from '../store'
import { selectUser } from '../store/slices/authSlice'
import type { Skill } from '../types'

interface Props {
  open: boolean
  onClose: () => void
}

const JobAlertModal: React.FC<Props> = ({ open, onClose }) => {
  const { notification } = App.useApp()
  const user = useAppSelector(selectUser)
  const [form] = Form.useForm()
  
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])

  // Load skills when the modal is opened
  useEffect(() => {
    if (open && skills.length === 0) {
      skillService.getAll({ pageSize: 100 }).then(d => setSkills(d?.result ?? []))
    }
    // Auto-fill name and email if the user is logged in
    if (open && user) {
      form.setFieldsValue({ name: user.username, email: user.email })
    }
  }, [open, user, form, skills.length])

  const handleSubscribe = async (values: any) => {
    setLoading(true)
    try {
      await subscriberService.create(values)
      notification.success({ message: 'Successfully subscribed to job alerts! 🎉' })
      onClose()
      form.resetFields()
    } catch (error) {
      // The error is handled automatically by api.ts interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      title={<><BellOutlined style={{ color: 'var(--p600)', marginRight: 8 }}/>Subscribe to Job Alerts</>}
      open={open} 
      onCancel={onClose} 
      footer={null}
      destroyOnClose
    >
      <p style={{ color: 'var(--tx2)', marginBottom: 20 }}>
        Enter your email and select your skills. We'll send you an email as soon as a matching job is posted!
      </p>
      <Form form={form} layout="vertical" onFinish={handleSubscribe}>
        <Form.Item name="name" label="Your Name" rules={[{ required: true, message: 'Please enter your name!' }]}>
          <Input placeholder="e.g., John Doe" />
        </Form.Item>
        
        <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
          <Input placeholder="e.g., you@example.com" disabled={!!user} />
        </Form.Item>
        
        <Form.Item name="skills" label="Skills" rules={[{ required: true, message: 'Please select at least one skill!' }]}>
          <Select
            mode="multiple"
            allowClear
            showSearch // 🔥 Enables typing to search
            filterOption={(input, option) => 
              // 🔥 Case-insensitive search filter
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Select or search for Java, React, Node.js..."
            options={skills.map(s => ({ label: s.name, value: s.id }))}
          />
        </Form.Item>
        
        <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: 10 }}>
          Subscribe Now
        </Button>
      </Form>
    </Modal>
  )
}

export default JobAlertModal