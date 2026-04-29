import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Button, App } from 'antd'
import { skillService } from '../../../services/skill.service'
import type { Skill } from '../../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: Skill | null
}

const SkillModal: React.FC<Props> = ({ open, onClose, onSuccess, editing }) => {
  const { notification } = App.useApp()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editing) form.setFieldsValue(editing)
      else form.resetFields()
    }
  }, [open, editing, form])

  const handleSave = async (values: { name: string }) => {
    setSaving(true)
    try {
      if (editing) { 
        await skillService.update(editing.id, values.name)
        notification.success({ message: 'Updated!' }) 
      } else { 
        await skillService.create(values.name)
        notification.success({ message: 'Skill created!' }) 
      }
      onSuccess()
      onClose()
    } catch { 
      // Error notification is handled globally by api.ts interceptor
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <Modal title={editing ? 'Edit Skill' : 'Add Skill'} open={open} onCancel={onClose} footer={null} width={360} centered>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Skill Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. React, Python, Docker..." size="large" />
        </Form.Item>
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editing ? 'Update' : 'Add'}</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default SkillModal