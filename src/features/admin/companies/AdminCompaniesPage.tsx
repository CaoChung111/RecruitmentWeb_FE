import React, { useEffect, useState, useCallback } from 'react'
import { Button, Input, App, Popconfirm, Pagination, Skeleton, Empty } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { companyService } from '../../../services/company.service'
import type { Company } from '../../../types'
import CompanyModal from './CompanyModal'
import styles from '../AdminPage.module.css'

const AdminCompaniesPage: React.FC = () => {
  const { notification } = App.useApp()
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Company | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    companyService.getAll({ page, size: 9, filter: keyword })
      .then(d => { setCompanies(d?.result ?? []); setTotal(d?.meta.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (co: Company) => { setEditing(co); setOpen(true) }

  const handleDelete = async (id: number) => {
    await companyService.remove(id)
    notification.success({ message: 'Deleted' }); load()
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div><h1 className={styles.title}>Companies</h1><p className={styles.sub}>{total} companies</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input prefix={<SearchOutlined />} placeholder="Search..." value={keyword}
            onChange={e => setKeyword(e.target.value)} style={{ width: 220 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Company</Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.cardGrid}>{Array.from({length:6}).map((_,i) => <div key={i} className={styles.itemCard}><Skeleton active /></div>)}</div>
      ) : companies.length === 0 ? <Empty /> : (
        <div className={styles.cardGrid}>
          {companies.map(co => (
            <div key={co.id} className={styles.itemCard}>
              
              {/* 🔥 BƯỚC 1: Thêm flex: 1 và alignItems: 'flex-start' vào đây */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flex: 1, alignItems: 'flex-start' }}>
                <div style={{ width:52,height:52,borderRadius:12,border:'1px solid var(--bdr)',background:'var(--surf2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--fd)',fontSize:22,fontWeight:700,color:'var(--p500)',flexShrink:0,overflow:'hidden' }}>
                  {co.logo ? <img src={co.logo} alt="" style={{ width:'100%',height:'100%',objectFit:'contain' }} /> : co.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{co.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{co.address}</div>
                </div>
              </div>
              
              {/* 🔥 BƯỚC 2: Thêm marginTop: 'auto' vào div chứa Nút */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'auto' }}>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(co)}>Edit</Button>
                <Popconfirm title="Delete company?" onConfirm={() => handleDelete(co.id)} okButtonProps={{ danger: true }}>
                  <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
              </div>

            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination current={page} total={total} pageSize={9} onChange={setPage} />
      </div>

      <CompanyModal open={open} onClose={() => setOpen(false)} onSuccess={load} editing={editing} />
    </div>
  )
}

export default AdminCompaniesPage