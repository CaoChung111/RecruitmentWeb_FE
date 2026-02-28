import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.brand}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>J</span>
          <span className={styles.logoText}>JobHunter</span>
        </Link>
        <p className={styles.tagline}>Connecting talented professionals with exceptional companies across Vietnam.</p>
      </div>
      <div className={styles.group}>
        <h4 className={styles.groupTitle}>Product</h4>
        <ul className={styles.links}><li><Link to="/jobs">Find Jobs</Link></li><li><Link to="/companies">Companies</Link></li></ul>
      </div>
      <div className={styles.group}>
        <h4 className={styles.groupTitle}>Company</h4>
        <ul className={styles.links}><li><a href="#">About</a></li><li><a href="#">Blog</a></li></ul>
      </div>
      <div className={styles.group}>
        <h4 className={styles.groupTitle}>Legal</h4>
        <ul className={styles.links}><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul>
      </div>
    </div>
    <div className={styles.bottom}>
      <p>© 2026 JobHunter. All rights reserved.</p>
      <p>Developed with ♥ by <span className={styles.author}>Cao Chung</span></p>
    </div>
  </footer>
)
