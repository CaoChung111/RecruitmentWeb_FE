import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Pagination, Skeleton, Empty, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { companyService } from '../../services/company.service'
import type { Company } from '../../types'
import styles from './CompanyListPage.module.css'

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    setLoading(true)
    companyService.getAll({ page, size: 12, filter: keyword })
      .then(d => { setCompanies(d?.result ?? []); setTotal(d?.meta.totalItems ?? 0) })
      .finally(() => setLoading(false))
  }, [page, keyword])

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.title}>Top Companies</h1>
            <p className={styles.sub}>{total.toLocaleString()} companies hiring</p>
          </div>
          <Input.Search placeholder="Search companies..." value={keyword}
            onChange={e => setKeyword(e.target.value)} style={{ width: 260 }}
            prefix={<SearchOutlined />} size="large" allowClear />
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles.card}><Skeleton active paragraph={{ rows: 2 }} /></div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <Empty description="No companies found" style={{ padding: '60px 0' }} />
        ) : (
          <div className={styles.grid}>
            {companies.map(co => (
              // Click vào thẻ -> chuyển đến trang chi tiết
              <div key={co.id} className={styles.card} onClick={() => navigate(`/companies/${co.id}`)} style={{ cursor: 'pointer' }}>
                <div className={styles.logoWrap}>
                  <div className={styles.logo}>
                    {co.logo ? <img src={co.logo} alt={co.name} /> : co.name.charAt(0)}
                  </div>
                  <div>
                    <div className={styles.name}>{co.name}</div>
                    <div className={styles.addr}>{co.address}</div>
                  </div>
                </div>
                
                {/* Footer với 2 nút hành động */}
                <div className={styles.footer} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <Button size="small" block>Details</Button>
                  <Button 
                    type="primary" 
                    size="small" 
                    block 
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn không cho sự kiện click lan ra thẻ cha
                      navigate(`/jobs?company=${co.id}`);
                    }}
                  >
                    View Jobs
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <Pagination current={page} total={total} pageSize={12}
            onChange={setPage} showTotal={t => `${t} companies`} />
        </div>
      </div>
    </div>
  )
}

export default CompanyListPage