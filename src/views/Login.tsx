import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReferral } from '../context/ReferralContext';
import { Activity, ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';
export const Login: React.FC = () => {
  const { login, users } = useAuth();
  const { logActivity } = useReferral();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const loggedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (loggedUser) {
        logActivity('USER_LOGIN', `Authenticated successfully via portal login.`, loggedUser);
      }
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="login-page">
      <div className="login-card-wrapper glass-panel fade-in">
        <div className="login-header">
          <div className="logo-badge">
            <Activity className="pulse-logo" size={32} />
          </div>
          <h2>CareLink Portal</h2>
          <p className="login-subtitle">
            Retiree Healthcare Referral Authorization System
          </p>
          <div className="portal-explanatory-box">
            <p>
              CareLink digitizes the medical referral process. Retired staff can request treatment authorizations, admins review and route requests, and network hospitals log treatment report discharge files.
            </p>
          </div>
        </div>

        {error && (
          <div className="login-error-alert">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Organization Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email-input"
                type="email"
                className="form-control"
                placeholder="name@healthcare.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <span className="form-help-text">Enter your registered organizational credentials to sign in.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="input-with-icon">
              <KeyRound className="input-icon" size={18} />
              <input
                id="password-input"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner">Authenticating Secure Session...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="quick-access-section">
          <p className="quick-access-title">Simulation Personas (Select to Pre-fill)</p>
          <div className="quick-access-grid">
            <button
              onClick={() => handleQuickLogin('admin@healthcare.org', 'admin123')}
              className="quick-access-btn admin"
              type="button"
            >
              <div className="flex justify-between w-full align-center">
                <span className="persona-role">Super Admin</span>
                <span className="persona-badge admin">Management</span>
              </div>
              <span className="quick-credential">admin@healthcare.org</span>
              <p className="persona-desc">Register users, review incoming requests, and route approved authorizations.</p>
            </button>

            <button
              onClick={() => handleQuickLogin('john@staff.org', 'staff123')}
              className="quick-access-btn staff"
              type="button"
            >
              <div className="flex justify-between w-full align-center">
                <span className="persona-role">Retired Staff</span>
                <span className="persona-badge staff">Beneficiary</span>
              </div>
              <span className="quick-credential">john@staff.org</span>
              <p className="persona-desc">Submit new treatment requests, choose clinics, and track approval status.</p>
            </button>

            <button
              onClick={() => handleQuickLogin('city@hospital.org', 'hospital123')}
              className="quick-access-btn hospital"
              type="button"
            >
              <div className="flex justify-between w-full align-center">
                <span className="persona-role">City Hospital Partner</span>
                <span className="persona-badge hospital">Provider</span>
              </div>
              <span className="quick-credential">city@hospital.org</span>
              <p className="persona-desc">View received patient files, accept referrals, and upload medical reports.</p>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%);
          padding: 1.5rem;
        }

        .login-card-wrapper {
          width: 100%;
          max-width: 460px;
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          background-color: var(--primary-lightest);
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .pulse-logo {
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }

        .login-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.25rem;
        }

        .login-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--danger-bg);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-left: 2.5rem;
        }

        .submit-btn {
          height: 46px;
          margin-top: 0.5rem;
        }

        .spinner {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .portal-explanatory-box {
          background-color: var(--primary-lightest);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          margin-top: 1rem;
          text-align: left;
        }

        .portal-explanatory-box p {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-left: 2.5rem;
        }

        .submit-btn {
          height: 44px;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .spinner {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-access-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .quick-access-title {
          font-size: 0.725rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          text-align: center;
        }

        .quick-access-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quick-access-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 1rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          width: 100%;
          gap: 0.25rem;
        }

        .persona-role {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .persona-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .persona-badge.admin {
          background-color: var(--primary-lightest);
          color: var(--primary);
        }

        .persona-badge.staff {
          background-color: var(--success-bg);
          color: var(--success);
        }

        .persona-badge.hospital {
          background-color: var(--info-bg);
          color: var(--info);
        }

        .quick-access-btn .quick-credential {
          font-size: 0.75rem;
          font-family: var(--mono);
          color: var(--text-muted);
        }

        .persona-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.35;
          margin: 0;
          margin-top: 0.15rem;
        }

        .quick-access-btn:hover {
          background-color: var(--bg-secondary);
          border-color: var(--border-focus);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
