import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Button, App } from 'antd'
import { permissionService } from '../../../services/role.service'
import type { Permission } from '../../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: Permission | null
}

const PermissionModal: React.FC<Props> = ({ open, onClose, onSuccess, editing }) => {
  const { notification } = App.useApp()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editing) form.setFieldsValue(editing)
      else form.resetFields()
    }
  }, [open, editing, form])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      if (editing) { 
        await permissionService.update(editing.id, values)
        notification.success({ message: 'Permission updated!' }) 
      } else { 
        await permissionService.create(values)
        notification.success({ message: 'Permission created!' }) 
      }
      onSuccess()
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <Modal title={editing ? 'Edit Permission' : 'Add Permission'} open={open} onCancel={onClose} footer={null} width={480} centered>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Permission Name" rules={[{ required: true }]}><Input /></Form.Item>
        <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:12 }}>
          <Form.Item name="apiPath" label="API Path" rules={[{ required: true }]}><Input placeholder="/api/v1/jobs" /></Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true }]}><Input placeholder="GET" style={{ textTransform:'uppercase' }} /></Form.Item>
        </div>
        <Form.Item name="module" label="Module" rules={[{ required: true }]}><Input placeholder="JOB / USER / RESUME ..." /></Form.Item>
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default PermissionModal