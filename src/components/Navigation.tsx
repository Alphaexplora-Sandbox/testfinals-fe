import React from 'react';
import { UserProfile } from '../types/logistics';

export interface NavigationProps {
  currentView: 'landing' | 'login' | 'dashboard';
  onNavigate: (view: 'landing' | 'login' | 'dashboard') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  isBackendConnected: boolean;
  serviceTitle?: string;
}

export function Navigation({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  isBackendConnected,
  serviceTitle = 'LogiPulse',
}: NavigationProps) {
  return (
    <header className="header-nav" data-testid="main-header">
      <div
        className="brand-badge"
        onClick={() => onNavigate('landing')}
        role="button"
        tabIndex={0}
        data-testid="brand-logo"
      >
        <div className="brand-logo-icon">LP</div>
        <div>
          <div className="brand-title">{serviceTitle}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Enterprise Logistics Cloud
          </div>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${currentView === 'landing' ? 'active' : ''}`}
          onClick={() => onNavigate('landing')}
          data-testid="nav-home"
        >
          Track & Overview
        </button>
        <button
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
          data-testid="nav-dashboard"
        >
          Command Center
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          className="connection-pill"
          title={isBackendConnected ? 'Connected to Render .NET Backend' : 'Running on Local Telemetry'}
          data-testid="backend-status-pill"
        >
          <span className="pulse-dot" style={{ background: isBackendConnected ? '#10b981' : '#38bdf8', boxShadow: isBackendConnected ? '0 0 8px #10b981' : '0 0 8px #38bdf8' }} />
          <span>{isBackendConnected ? 'Render API Online' : 'Local Telemetry Mode'}</span>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#93c5fd',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
              data-testid="user-role-badge"
            >
              {currentUser.role}: {currentUser.fullName.split(' ')[0]}
            </span>
            <button
              className="action-btn-sm"
              onClick={onLogout}
              data-testid="btn-logout"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            className="primary-btn"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            onClick={() => onNavigate('login')}
            data-testid="nav-login-btn"
          >
            Portal Sign In
          </button>
        )}
      </div>
    </header>
  );
}
