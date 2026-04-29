import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Button, App, Upload, message } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { companyService } from '../../../services/company.service'
import type { Company } from '../../../types'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing: Company | null
}

const CompanyModal: React.FC<Props> = ({ open, onClose, onSuccess, editing }) => {
  const { notification } = App.useApp()
  const [form] = Form.useForm()
  
  // Trạng thái lưu toàn bộ form
  const [saving, setSaving] = useState(false)
  
  // Trạng thái riêng cho việc Upload ảnh
  const [imageLoading, setImageLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | undefined>()

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue(editing)
        setImageUrl(editing.logo) // Gán logo cũ để hiển thị
      } else {
        form.resetFields()
        setImageUrl(undefined)
      }
    }
  }, [open, editing, form])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      // Gắn imageUrl hiện tại vào dữ liệu gửi đi
      const payload = { ...values, logo: imageUrl }

      if (editing) { 
        await companyService.update(editing.id, payload)
        notification.success({ message: 'Company updated!' }) 
      } else { 
        await companyService.create(payload)
        notification.success({ message: 'Company created!' }) 
      }
      onSuccess()
      onClose()
    } catch { 
      // Error notification is handled globally by api.ts interceptor
    } finally { 
      setSaving(false) 
    }
  }

  // Hàm xử lý khi người dùng chọn file ảnh
  const customUpload = async ({ file, onSuccess: onUploadSuccess, onError }: any) => {
    setImageLoading(true) // Bật trạng thái đang tải ảnh (Khóa nút Submit)
    try {

      setTimeout(() => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          // Lưu link ảnh để hiển thị và gửi đi (Thực tế thì lưu finalUrl từ API)
          setImageUrl(reader.result as string) 
          setImageLoading(false) // Tắt loading (Mở khóa nút Submit)
          onUploadSuccess("ok")
        }
      }, 1500)

    } catch (error) {
      onError(error)
      setImageLoading(false)
      message.error('Upload ảnh thất bại!')
    }
  }

  // Xử lý logic hiển thị link ảnh từ server hoặc base64
  const displayUrl = imageUrl?.startsWith('http') || imageUrl?.startsWith('data:') 
    ? imageUrl 
    : imageUrl ? `${import.meta.env.VITE_API_URL}/storage/company/${imageUrl}` : undefined

  return (
    <Modal title={editing ? 'Edit Company' : 'Add Company'} open={open} onCancel={onClose} footer={null} width={500} centered>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        
        <Form.Item label="Company Logo">
          <Upload
            listType="picture-card"
            showUploadList={false}
            customRequest={customUpload}
            beforeUpload={(file) => {
              const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
              if (!isJpgOrPng) message.error('Chỉ hỗ trợ file JPG/PNG/WEBP!')
              const isLt2M = file.size / 1024 / 1024 < 2
              if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB!')
              return isJpgOrPng && isLt2M
            }}
          >
            {displayUrl ? (
              // Nếu đã có ảnh thì hiện ảnh
              <img src={displayUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
            ) : (
              // Nếu chưa có ảnh thì hiện Nút Upload (sẽ tự đổi thành Loading khi đang tải)
              <div>
                {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>{imageLoading ? 'Uploading...' : 'Upload'}</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <ReactQuill 
            theme="snow" 
            placeholder="About company..."
            style={{ 
              height: '200px', 
              marginBottom: '40px'
            }} 
          />
        </Form.Item>
        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button onClick={onClose}>Cancel</Button>
          {/* NÚT SUBMIT ĐƯỢC KHÓA LẠI (disabled) NẾU ẢNH ĐANG UPLOAD */}
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={saving} 
            disabled={imageLoading}
          >
            {editing ? 'Update' : 'Create'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default CompanyModal