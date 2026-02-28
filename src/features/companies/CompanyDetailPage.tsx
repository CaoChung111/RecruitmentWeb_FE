import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton, Button, Tag, Divider, Empty } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, SearchOutlined } from '@ant-design/icons'
import parse from 'html-react-parser'
import { companyService } from '../../services/company.service'
import type { Company } from '../../types'
import styles from './CompanyDetailPage.module.css'

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [company, setCompany] = useState<Company | null>(null)
  const [relatedCompanies, setRelatedCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      // 1. Fetch chi tiết công ty
      companyService.getById(Number(id)).then(setCompany)
      
      // 2. Fetch danh sách công ty khác
      companyService.getAll({ size: 20 }).then(res => {
        let others = res.result.filter((c: Company) => c.id !== Number(id));
        // Shuffle để ngẫu nhiên
        for (let i = others.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [others[i], others[j]] = [others[j], others[i]];
        }
        setRelatedCompanies(others.slice(0, 3));
      })
      .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <div className={styles.root}>
      <div className={styles.container} style={{ marginTop: 40 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    </div>
  )

  if (!company) return (
    <div className={styles.root}>
      <div className={styles.container} style={{ marginTop: 40 }}>
        <Empty description="Company not found" />
      </div>
    </div>
  )

  const logoUrl = company.logo?.startsWith('http') 
    ? company.logo 
    : `${import.meta.env.VITE_API_URL}/storage/company/${company.logo}`

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <span onClick={() => navigate('/')} className={styles.crumb}>Home</span>
          <span className={styles.sep}>/</span>
          <span onClick={() => navigate('/companies')} className={styles.crumb}>Companies</span>
          <span className={styles.sep}>/</span>
          <span>{company.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            <div className={styles.card}>
              <div className={styles.jobHeader}>
                <div className={styles.logo} style={{ width: 80, height: 80, fontSize: 32 }}>
                  {company.logo ? <img src={logoUrl} alt={company.name} /> : company.name.charAt(0)}
                </div>
                <div>
                  <h1 className={styles.title}>{company.name}</h1>
                  <Tag color="blue" style={{ marginTop: 8 }}>Verified Company</Tag>
                </div>
              </div>

              <div className={styles.chips}>
                <span className={styles.chip}><EnvironmentOutlined /> {company.address}</span>
              </div>

              <Divider />

              <h2 className={styles.secTitle}>About Us</h2>
              <div className={styles.body}>
                {parse(company.description ?? '')}
              </div>
            </div>

            {/* Other Companies Grid Section */}
            {relatedCompanies.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 className={styles.secTitle}>Other Companies to Explore</h2>
                <div className={styles.grid}>
                  {relatedCompanies.map(co => (
                    <div key={co.id} className={styles.gridCard} onClick={() => navigate(`/companies/${co.id}`)}>
                      <div className={styles.gridLogoWrap}>
                        <div className={styles.gridLogo}>
                          {co.logo ? <img src={co.logo} alt={co.name} /> : co.name.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.gridName}>{co.name}</div>
                          <div className={styles.gridAddr}>{co.address}</div>
                        </div>
                      </div>
                      
                      <div className={styles.gridFooter} onClick={(e) => e.stopPropagation()}>
                        <Button size="small" onClick={() => navigate(`/companies/${co.id}`)} block>Details</Button>
                        <Button 
                          type="primary" 
                          size="small" 
                          block 
                          onClick={() => navigate(`/jobs?company=${co.id}`)}
                        >
                          View Jobs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.aside}>
            <div className={styles.stickyCard}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Actions</div>
              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<SearchOutlined />}
                onClick={() => navigate(`/jobs?company=${company.id}`)}
                style={{ height: 48, fontWeight: 600 }}
              >
                View Jobs
              </Button>
              <Divider />
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}><EnvironmentOutlined /></span>
                  <div>
                    <div className={styles.infoLabel}>Location</div>
                    <div className={styles.infoVal}>{company.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage