'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/college/login/login.module.css';

export default function CollegeAdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/college-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      // Success, redirect to dashboard
      router.push('/college/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top header row */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.signInTitle}>Administrator Sign In</h2>
          <p className={styles.signInSubtitle}>Please enter your authorized institutional credentials to continue</p>
        </div>
        <Link className={styles.backLink} href="/">
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }}></i> Back to Main Site
        </Link>
      </div>

      {/* Role Selector Pills */}
      <div className={styles.roleSelector}>
        <label className={styles.roleLabel}>Select Administrative Role</label>
        <div className={styles.roleGrid} style={{ gridTemplateColumns: '1fr' }}>
          <button type="button" className={styles.roleButtonActive}>
            <span className={styles.pulseDot} style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-container)' }}></span>
            College Admin Login
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Email Input */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Institutional Email or Staff ID</label>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <i className="fa-regular fa-envelope" style={{ fontSize: '12px' }}></i>
            </div>
            <input 
              className={styles.inputField}
              placeholder="e.g. psdgandepalli@gmail.com" 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {email && (
              <div className={styles.inputCheck}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '12px' }}></i>
              </div>
            )}
          </div>
          <p className={styles.inputHelp}>
            <i className="fa-solid fa-id-badge" style={{ fontSize: '10px' }}></i> Authorized staff ID or institutional domain email
          </p>
        </div>

        {/* Password Input */}
        <div className={styles.inputGroup}>
          <div className={styles.optionsRow} style={{ marginBottom: '0.25rem' }}>
            <label className={styles.inputLabel} style={{ marginBottom: 0 }}>Security Password</label>
            <a className={styles.forgotPassword} href="#">Forgot password?</a>
          </div>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <i className="fa-solid fa-lock" style={{ fontSize: '12px' }}></i>
            </div>
            <input 
              className={styles.inputField}
              placeholder="Enter your confidential password" 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button className={styles.togglePassword} type="button">
              <i className="fa-regular fa-eye-slash" style={{ fontSize: '12px' }}></i>
            </button>
          </div>
        </div>

        {/* Remember me & 2FA notice */}
        <div className={styles.optionsRow}>
          <label className={styles.checkboxLabel}>
            <input className={styles.checkboxInput} type="checkbox" defaultChecked />
            <span className={styles.checkboxText}>Remember device for 30 days</span>
          </label>
          <span style={{ fontSize: '11px', color: 'var(--neutral-muted)' }}>2FA verification enabled</span>
        </div>

        {/* Submit Button */}
        <div style={{ paddingTop: '0.25rem' }}>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In to College Admin Portal'}</span>
            {!loading && <i className={`fa-solid fa-arrow-right ${styles.submitIcon}`}></i>}
          </button>
        </div>
      </form>
    </div>
  );
}
