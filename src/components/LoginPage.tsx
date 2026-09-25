import React, { useState } from 'react';
import { UserProfile } from '../types/logistics';
import { apiClient } from '../services/apiClient';
import { DEMO_USERS } from '../data/mockLogisticsData';

export interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToHome: () => void;
  initialEmail?: string;
  initialPassword?: string;
  initialError?: string | null;
}

export const LoginPageActions = {
  performLogin: async (
    email: string,
    pass: string,
    setLoading: (l: boolean) => void,
    setError: (err: string | null) => void,
    onSuccess: (user: UserProfile) => void,
  ) => {
    setError(null);
    setLoading(true);
    try {
      const user = await apiClient.login(email, pass);
      onSuccess(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failure.');
      }
    } finally {
      setLoading(false);
    }
  },

  selectDemoProfile: (
    demoEmail: string,
    setEmail: (e: string) => void,
    setPassword: (p: string) => void,
    setError: (err: string | null) => void,
  ) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  },
};

export const createLoginHandlers = (
  email: string,
  pass: string,
  setIsLoading: (l: boolean) => void,
  setError: (e: string | null) => void,
  onLoginSuccess: (u: UserProfile) => void,
  setEmail: (e: string) => void,
  setPassword: (p: string) => void,
) => ({
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
  handleSubmit: async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await LoginPageActions.performLogin(email, pass, setIsLoading, setError, onLoginSuccess);
  },
  onSelectDemoClick: (e: React.MouseEvent<HTMLButtonElement>) => {
    const demoEmail = e.currentTarget.dataset.email;
    if (demoEmail) {
      LoginPageActions.selectDemoProfile(demoEmail, setEmail, setPassword, setError);
    }
  },
});

export function LoginPage(props: Readonly<LoginPageProps>) {
  const {
    onLoginSuccess,
    onNavigateToHome,
    initialEmail = 'dispatcher@logipulse.io',
    initialPassword = 'password123',
    initialError = null,
  } = props;
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);

  const handlers = createLoginHandlers(
    email,
    password,
    setIsLoading,
    setError,
    onLoginSuccess,
    setEmail,
    setPassword,
  );

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

        <form onSubmit={handlers.handleSubmit}>
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
              onChange={handlers.onEmailChange}
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
              onChange={handlers.onPasswordChange}
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
                data-email={user.email}
                onClick={handlers.onSelectDemoClick}
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
