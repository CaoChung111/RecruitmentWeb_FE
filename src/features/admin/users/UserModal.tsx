import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Select, Button, App } from 'antd'
import { userService } from '../../../services/user.service'
import type { User, Company, Role } from '../../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: User | null
  companies: Company[]
  roles: Role[]
}

const UserModal: React.FC<Props> = ({ open, onClose, onSuccess, editing, companies, roles }) => {
  const { notification } = App.useApp()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({ ...editing, companyId: editing.company?.id, role: editing.role?.id })
      } else {
        form.resetFields()
      }
    }
  }, [open, editing, form])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      if (editing) { 
        await userService.update(editing.id, values)
        notification.success({ message: 'User updated!' }) 
      } else { 
        await userService.create(values)
        notification.success({ message: 'User created!' }) 
      }
      onSuccess()
      onClose()
    } catch { 
      notification.error({ message: 'Failed' }) 
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <Modal title={editing ? 'Edit User' : 'Add User'} open={open} onCancel={onClose} footer={null} width={560} centered>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          {!editing && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>
          )}
          <Form.Item name="age" label="Age"><InputNumber style={{ width:'100%' }} min={16} /></Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select options={[{label:'Male',value:'MALE'},{label:'Female',value:'FEMALE'},{label:'Other',value:'OTHER'}]} />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select options={roles.map(r => ({ label: r.name, value: r.id }))} />
          </Form.Item>
        </div>
        <Form.Item name="address" label="Address"><Input /></Form.Item>
        <Form.Item name="companyId" label="Company">
          <Select allowClear placeholder="— None —" options={companies.map(c => ({ label: c.name, value: c.id }))} showSearch optionFilterProp="label" />
        </Form.Item>
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default UserModal