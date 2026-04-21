import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Button, Select, App } from 'antd'
import { subscriberService } from '../../../services/subscriber.service'
import type { Subscriber, Skill } from '../../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: Subscriber | null
  skills: Skill[]
}

const SubscriberModal: React.FC<Props> = ({ open, onClose, onSuccess, editing, skills }) => {
  const { notification } = App.useApp()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editing) {
        // Map skills array to an array of IDs for the Select component
        const skillIds = editing.skills?.map(s => s.id) || []
        form.setFieldsValue({ ...editing, skills: skillIds })
      } else {
        form.resetFields()
      }
    }
  }, [open, editing, form])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      if (editing) {
        await subscriberService.update(editing.id, values)
        notification.success({ message: 'Updated successfully!' })
      } else {
        await subscriberService.create(values)
        notification.success({ message: 'Created successfully!' })
      }
      onSuccess()
      onClose()
    } catch (error) {
      // Handled by api.ts interceptor
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={editing ? "Edit Subscriber" : "Add Subscriber"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name!' }]}>
          <Input placeholder="Enter name..." />
        </Form.Item>

        <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
          <Input placeholder="Enter email..." disabled={!!editing} /> 
        </Form.Item>

        <Form.Item name="skills" label="Skills">
          <Select
            mode="multiple"
            allowClear
            showSearch
            filterOption={(input, option) => 
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Search or select skills..."
            options={skills.map(s => ({ label: s.name, value: s.id }))}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default SubscriberModal