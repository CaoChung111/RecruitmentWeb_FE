import React, { useEffect, useState, useCallback } from 'react'
import { Button, Input, App, Popconfirm, Pagination, Skeleton, Empty, Segmented } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { companyService } from '../../../services/company.service'
import type { Company } from '../../../types'
import CompanyModal from './CompanyModal'
import styles from '../AdminPage.module.css'
import HasPermission from '../../../components/common/HasPermission' 

const AdminCompaniesPage: React.FC = () => {
  const { notification } = App.useApp()

  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  
  const [isTrashView, setIsTrashView] = useState(false) 

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Company | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    
    const params: any = { 
      page: page, 
      size: 9
    }
    if (keyword && !isTrashView) {
      params.filter = `name~'*${keyword}*'` 
    }

    const apiCall = isTrashView 
      ? companyService.getInactive(params) 
      : companyService.getAll(params)

    apiCall
      .then(d => { setCompanies(d?.result ?? []); setTotal(d?.meta?.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword, isTrashView])

  useEffect(() => { setPage(1) }, [keyword, isTrashView])
  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (co: Company) => { setEditing(co); setOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      await companyService.softDelete(id)
      notification.success({ message: 'Company moved to trash' })
      load()
    } catch {
      // Error notification is handled globally by api.ts interceptor
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await companyService.restore(id)
      notification.success({ message: 'Company restored successfully' })
      load()
    } catch {
      // Error notification is handled globally by api.ts interceptor
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>{isTrashView ? 'Company Trash' : 'Companies'}</h1>
          <p className={styles.sub}>{total} companies</p>
        </div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          
          <HasPermission requiredPermission={{ method: "GET", apiPath: "/api/v1/companies/trash", module: "COMPANIES" }}>
            <Segmented 
              options={['Active', 'Deleted']} 
              value={isTrashView ? 'Deleted' : 'Active'}
              onChange={(val) => setIsTrashView(val === 'Deleted')}
            />
          </HasPermission>

          {/* Vô hiệu hóa ô search nếu đang ở view Trash vì backend không hỗ trợ filter */}
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search by name..." 
            value={keyword}
            onChange={e => setKeyword(e.target.value)} 
            style={{ width: 220 }} 
            disabled={isTrashView} 
          />
            
          {!isTrashView && (
            <HasPermission requiredPermission={{ method: "POST", apiPath: "/api/v1/companies", module: "COMPANIES" }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Company</Button>
            </HasPermission>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.cardGrid}>{Array.from({length:6}).map((_,i) => <div key={i} className={styles.itemCard}><Skeleton active /></div>)}</div>
      ) : companies.length === 0 ? <Empty /> : (
        <div className={styles.cardGrid}>
          {companies.map(co => (
            <div key={co.id} className={styles.itemCard}>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flex: 1, alignItems: 'flex-start' }}>
                <div style={{ width:52,height:52,borderRadius:12,border:'1px solid var(--bdr)',background:'var(--surf2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--fd)',fontSize:22,fontWeight:700,color:'var(--p500)',flexShrink:0,overflow:'hidden' }}>
                  {co.logo ? <img src={co.logo} alt="" style={{ width:'100%',height:'100%',objectFit:'contain' }} /> : co.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, color: 'var(--tx1)' }}>
                    {co.name}
                    {isTrashView && <span style={{ color: 'var(--red)', fontSize: 12, marginLeft: 8 }}>(INACTIVE)</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{co.address}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'auto' }}>
                {isTrashView ? (
                  <HasPermission requiredPermission={{ method: "PUT", apiPath: "/api/v1/companies/{id}/restore", module: "COMPANIES" }}>
                    <Popconfirm title="Restore this company?" onConfirm={() => handleRestore(co.id)}>
                      <Button size="small" type="primary" ghost icon={<ReloadOutlined />}>Restore</Button>
                    </Popconfirm>
                  </HasPermission>
                ) : (
                  <>
                    <HasPermission requiredPermission={{ method: "PUT", apiPath: "/api/v1/companies", module: "COMPANIES" }}>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(co)}>Edit</Button>
                    </HasPermission>

                    <HasPermission requiredPermission={{ method: "DELETE", apiPath: "/api/v1/companies/{id}", module: "COMPANIES" }}>
                        <Popconfirm title="Delete this company?" onConfirm={() => handleDelete(co.id)} okButtonProps={{ danger: true }}>
                        <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                        </Popconfirm>
                    </HasPermission>
                  </>
                )}
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