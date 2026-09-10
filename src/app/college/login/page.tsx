import { Metadata } from 'next';
import CollegeAdminLoginForm from '@/components/auth/CollegeAdminLoginForm';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: 'Apex Junior College - Admin Portal Login',
};

export default function CollegeAdminLoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.heroPattern}></div>
      <div className={styles.glowTopLeft}></div>
      <div className={styles.glowBottomRight}></div>
      <div className={styles.glowCenter}></div>

      <div className={styles.mainCard}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <div className={styles.accentTopRight}></div>
          <div className={styles.accentBottomLeft}></div>

          <div className="relative z-10">
            <div className={styles.logoContainer}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcKOQWTCu6-3BVRK4CdApYUDgbSPXNIEaCrhaxBhajVJHDVJ9pVZDU_1tssqaSyqQow2a6p9NWo6rrl_mM-mt9E95fdkX33c0D_PpHsmzReXZVe47sPwpodPL88H8gzGn_Mvr2A8N5hFlU8fnC7d-WMhXbgXQODvyRWjF1XW6WTC3CrfqudRxHeZu9jc7m9-YHDbjSLyM4CVOk58QVYGR0vjVbK2xVJHULUJ9Cn58cywTTxmPmjF-XZRtI5Pu3ZzeU-Q" 
                alt="Naaguru Logo" 
                className={styles.logoImage} 
              />
            </div>

            <div>
              <span className={styles.badge}>
                <span className={styles.pulseDot}></span>
                Academic Year 2025 – 2026 Active
              </span>
              <h1 className={styles.title}>
                Institutional Management & Admissions Portal
              </h1>
              <p className={styles.subtitle}>
                Secure administrative workstation for College Principals, Deans, Admissions Counselors, and Academic Directors.
              </p>
            </div>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <i className="fa-solid fa-school"></i>
                </div>
                <div>
                  <div className={styles.featureTitle}>Profile Studio Control</div>
                  <div className={styles.featureDesc}>Update faculty, IIT/NEET rankers, hostel mess & campus facilities live.</div>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div>
                  <div className={styles.featureTitle}>Leads & Admissions CRM</div>
                  <div className={styles.featureDesc}>Track 1,200+ MPC, BiPC, MEC inquiries, visits & fee allotments.</div>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <div className={styles.featureTitle}>Role-Based 256-Bit Security</div>
                  <div className={styles.featureDesc}>Strict access protocols for Deans, Admins & Staff.</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.helpdesk}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <i className="fa-solid fa-headset text-secondary-fixed-dim" style={{ color: 'var(--secondary-fixed-dim)' }}></i>
              <span>IT Helpdesk: <strong style={{ color: 'white' }}>+91 98480 12345</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-fixed)', fontWeight: 500 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '10px' }}></i> Server Online
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          <CollegeAdminLoginForm />
          
          <div className={styles.footerRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--primary)' }}></i> 
              ISO 27001 Certified Secure Portal
            </span>
            <span style={{ cursor: 'pointer' }}>Privacy & Compliance Policy</span>
          </div>
        </div>
      </div>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
    </div>
  );
}
