import React, { useState } from 'react';
import { UserProfile } from '../types/logistics';
import { apiClient } from '../services/apiClient';
import { DEMO_USERS } from '../data/mockLogisticsData';

export interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToHome: () => void;
}

export function LoginPage({ onLoginSuccess, onNavigateToHome }: LoginPageProps) {
  const [email, setEmail] = useState('dispatcher@logipulse.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await apiClient.login(email, password);
      onLoginSuccess(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failure.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
      data-testid="login-page-root"
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-logo-icon"
            style={{ width: '48px', height: '48px', margin: '0 auto 1rem', fontSize: '1.4rem' }}
          >
            LP
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Operations Terminal Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Enter your credentials to access dispatch telemetry and fleet controls.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
            data-testid="login-error-alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email-input">
              Work Email Address
            </label>
            <input
              id="login-email-input"
              type="email"
              className="form-input"
              placeholder="e.g. dispatcher@logipulse.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="login-password-input">
              Password
            </label>
            <input
              id="login-password-input"
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="login-password"
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            disabled={isLoading}
            data-testid="login-submit"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Terminal'}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Presets */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              1-Click Demo Profiles
            </span>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Password: password123</span>
          </div>

          <div className="demo-credentials-grid">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                className="demo-account-btn"
                onClick={() => handleSelectDemo(user.email)}
                data-testid={`demo-${user.role.toLowerCase()}`}
              >
                <span className="demo-role">{user.role}</span>
                <span className="demo-email">{user.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <button
            type="button"
            className="action-btn-sm"
            onClick={onNavigateToHome}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
            data-testid="back-to-home"
          >
            &larr; Return to Public Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
