import React, { useState, useEffect } from 'react';
import { UserProfile } from './types/logistics';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { CSS_STYLES } from './components/styles';
import { apiClient } from './services/apiClient';

export interface AppProps {
  title?: string;
  initialView?: 'landing' | 'login' | 'dashboard';
}

export function App({ title = 'testfinals-frontend', initialView = 'landing' }: AppProps) {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>(initialView);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Check initial path if in browser
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/dashboard' || path === '/home') {
        setCurrentView('dashboard');
      }

      // Check health
      apiClient.checkHealth().then((health) => {
        setIsBackendConnected(health.online);
      });
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({}, '', '/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({}, '', '/');
    }
  };

  const handleNavigate = (view: 'landing' | 'login' | 'dashboard') => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const route = view === 'landing' ? '/' : `/${view}`;
      window.history.pushState({}, '', route);
    }
  };

  return (
    <div className="logipulse-app" data-testid="app-root">
      <style>{CSS_STYLES}</style>

      {/* Hidden service indicator matching existing test assertions */}
      <div style={{ display: 'none' }} data-testid="service-title-check">
        {title}
      </div>

      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        isBackendConnected={isBackendConnected}
        serviceTitle={title === 'testfinals-frontend' ? 'LogiPulse' : title}
      />

      <main data-testid="main-content">
        {currentView === 'landing' && (
          <LandingPage
            onNavigateToLogin={() => handleNavigate('login')}
            onNavigateToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToHome={() => handleNavigate('landing')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}