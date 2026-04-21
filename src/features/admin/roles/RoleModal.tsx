import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Form, Input, Button, App, Checkbox, Tag, Collapse, Row, Col } from 'antd'
import { roleService } from '../../../services/role.service'
import type { Role, Permission } from '../../../types'

const METHOD_COLOR: Record<string, string> = { GET: 'blue', POST: 'green', PUT: 'orange', DELETE: 'red', PATCH: 'purple' }

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: Role | null
  allPerms: Permission[]
}

const RoleModal: React.FC<Props> = ({ open, onClose, onSuccess, editing, allPerms }) => {
  const { notification } = App.useApp()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  // Gộp nhóm các quyền theo Module
  const groupedPerms = useMemo(() => {
    const map: Record<string, Permission[]> = {}
    allPerms.forEach(p => {
      if (!map[p.module]) map[p.module] = []
      map[p.module].push(p)
    })
    return map
  }, [allPerms])

  useEffect(() => {
    if (open) {
      if (editing) {
        // Lấy đúng mảng ID của các quyền đã có để fill vào Checkbox
        const permIds = editing.permissions?.map(p => typeof p === 'object' ? p.id : p) || []
        form.setFieldsValue({ ...editing, permissions: permIds })
      } else {
        form.resetFields()
      }
    }
  }, [open, editing, form])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      if (editing) { 
        await roleService.update(editing.id, values)
        notification.success({ message: 'Cập nhật Role thành công!' }) 
      } else { 
        await roleService.create(values)
        notification.success({ message: 'Tạo mới Role thành công!' }) 
      }
      onSuccess()
      onClose()
    } finally { 
      setSaving(false) 
    }
  }

  // Khởi tạo giao diện gập mở (Collapse) cho từng Module
  const collapseItems = Object.entries(groupedPerms).map(([moduleName, perms]) => ({
    key: moduleName,
    forceRender: true,
    label: <span style={{ fontWeight: 600, color: 'var(--p600)' }}>Module: {moduleName}</span>,
    children: (
      <Row gutter={[16, 16]}>
        {perms.map(p => (
          <Col span={12} key={p.id}>
            <Checkbox value={p.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <Tag color={METHOD_COLOR[p.method] ?? 'default'} style={{ marginLeft: 8, fontSize: 10, padding: '0 4px' }}>
                    {p.method}
                  </Tag>
                </div>
                <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{p.apiPath}</span>
              </div>
            </Checkbox>
          </Col>
        ))}
      </Row>
    )
  }))

  return (
    <Modal 
      title={editing ? 'Edit Role' : 'Add Role'} 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      width={700}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Role Name" rules={[{ required: true, message: 'Please enter the Role name' }]}>
          <Input placeholder="e.g., RECRUITER, HR_MANAGER..." />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Describe the permissions for this role" />
        </Form.Item>
        <Form.Item name="active" valuePropName="checked" initialValue={true}>
          <Checkbox>Status (Active)</Checkbox>
        </Form.Item>
        
        {/* 🔥 ĐÃ FIX LỖI: Dùng Form.Item bọc ngoài (chỉ để lấy Label), và Form.Item noStyle bọc sát Checkbox.Group */}
        <Form.Item label="Permissions">
          <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid var(--bdr)', borderRadius: 8, padding: 8 }}>
            <Form.Item name="permissions" noStyle>
              <Checkbox.Group style={{ width: '100%' }}>
                <Collapse items={collapseItems} ghost defaultActiveKey={[]} />
              </Checkbox.Group>
            </Form.Item>
          </div>
        </Form.Item>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop: 24 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default RoleModal