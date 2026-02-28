import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import styles from './AuthLayout.module.css'

const AuthLayout: React.FC = () => (
  <div className={styles.root}>
    <div className={styles.panel}>
      <div className={styles.panelContent}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>J</span>
          <span className={styles.logoText}>JobHunter</span>
        </Link>
        <blockquote className={styles.quote}>
          "The best way to predict the future is to create it."
        </blockquote>
        <cite className={styles.author}>— Peter Drucker</cite>
        <div className={styles.stats}>
          {[['10K+','Active Jobs'],['2K+','Companies'],['50K+','Candidates']].map(([v,l]) => (
            <div key={l} className={styles.stat}>
              <span className={styles.statVal}>{v}</span>
              <span className={styles.statLbl}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.orb1} /><div className={styles.orb2} /><div className={styles.orb3} />
    </div>
    <div className={styles.form}><Outlet /></div>
  </div>
)

export default AuthLayout
