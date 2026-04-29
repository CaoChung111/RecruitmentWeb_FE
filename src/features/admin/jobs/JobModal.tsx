import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, App } from 'antd'
import dayjs from 'dayjs'
import { jobService } from '../../../services/job.service'
import type { Job, Company, Skill } from '../../../types'
import { JOB_LEVELS, JOB_STATUS } from '../../../constants'

// 🔥 Import ReactQuill
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: Job | null
  companies: Company[]
  skills: Skill[]
}

const JobModal: React.FC<Props> = ({ open, onClose, onSuccess, editing, companies, skills }) => {
  const { notification } = App.useApp()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          ...editing,
          companyId: editing.company?.id,
          skills: editing.skills?.map(s => Number(s.id)),
          startDate: dayjs(editing.startDate),
          endDate: dayjs(editing.endDate),
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, editing, form])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        startDate: values.startDate.startOf('day').toISOString(),
        endDate: values.endDate.endOf('day').toISOString(),
      }
      if (editing) {
        await jobService.update(editing.id, payload)
        notification.success({ message: 'Job updated!' })
      } else {
        await jobService.create(payload)
        notification.success({ message: 'Job created!' })
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
    <Modal title={editing ? 'Edit Job' : 'Add New Job'} open={open} onCancel={onClose} footer={null} width={700} centered>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="name" label="Job Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Senior React Developer" />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input placeholder="Hà Nội / Remote" />
          </Form.Item>
          <Form.Item name="salary" label="Salary (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="quantity" label="Openings" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="level" label="Level" rules={[{ required: true }]}>
            <Select options={JOB_LEVELS.map(l => ({ label: l.label, value: l.value }))} />
          </Form.Item>
          <Form.Item name="active" label="Status" rules={[{ required: true }]} initialValue="OPEN">
            <Select options={JOB_STATUS} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>
        
        <Form.Item name="companyId" label="Company" rules={[{ required: true }]} >
          <Select placeholder="Select company" options={companies.map(c => ({ label: c.name, value: c.id }))} showSearch optionFilterProp="label" />
        </Form.Item>

        <Form.Item name="skills" label="Skills">
          <Select 
            key={skills.length} 
            mode="multiple" 
            placeholder="Select skills" 
            showSearch 
            optionFilterProp="label"
            options={skills.map(s => ({ label: s.name, value: Number(s.id) }))} 
          />
        </Form.Item>

        {/* 🔥 Đã đổi sang ReactQuill */}
        <Form.Item name="description" label="Description">
          <ReactQuill 
            theme="snow" 
            placeholder="About the job, responsibilities, requirements..."
            style={{ height: '220px', marginBottom: '50px' }} 
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default JobModal