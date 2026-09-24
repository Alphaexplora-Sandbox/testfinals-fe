import { renderToString } from 'react-dom/server';
import React from 'react';
import { App } from '../../src/App';
import { LandingPage } from '../../src/components/LandingPage';
import { LoginPage } from '../../src/components/LoginPage';
import { Dashboard } from '../../src/components/Dashboard';
import { apiClient } from '../../src/services/apiClient';
import { DEMO_USERS } from '../../src/data/mockLogisticsData';

describe('Logistics Platform Components', () => {
  it('renders the LandingPage with tracking input and metrics', () => {
    const html = renderToString(
      <LandingPage
        onNavigateToLogin={() => {}}
        onNavigateToDashboard={() => {}}
      />,
    );

    expect(html).toContain('Global Supply Chain Orchestration');
    expect(html).toContain('hero-tracking-input');
    expect(html).toContain('hero-track-btn');
    expect(html).toContain('99.8%');
  });

  it('renders the LoginPage with 1-click demo profiles', () => {
    const html = renderToString(
      <LoginPage
        onLoginSuccess={() => {}}
        onNavigateToHome={() => {}}
      />,
    );

    expect(html).toContain('Operations Terminal Sign In');
    expect(html).toContain('login-email');
    expect(html).toContain('login-password');
    expect(html).toContain('login-submit');
    expect(html).toContain('demo-dispatcher');
    expect(html).toContain('demo-admin');
  });

  it('renders the Dashboard with Command Center metrics and tabs', () => {
    const html = renderToString(
      <Dashboard currentUser={DEMO_USERS[0]} />,
    );

    expect(html).toContain('Operations Command Center');
    expect(html).toContain('tab-shipments');
    expect(html).toContain('tab-fleet');
    expect(html).toContain('tab-warehouses');
    expect(html).toContain('LP-8924-XQ');
  });

  it('renders App across different initial views', () => {
    const landingHtml = renderToString(<App initialView="landing" />);
    expect(landingHtml).toContain('Track &amp; Overview');

    const loginHtml = renderToString(<App initialView="login" />);
    expect(loginHtml).toContain('Operations Terminal Sign In');

    const dashboardHtml = renderToString(<App initialView="dashboard" />);
    expect(dashboardHtml).toContain('Operations Command Center');
  });
});

describe('Logistics API Client', () => {
  it('tracks an existing shipment by code', async () => {
    const shipment = await apiClient.trackShipment('LP-8924-XQ');
    expect(shipment).not.toBeNull();
    expect(shipment?.trackingNumber).toBe('LP-8924-XQ');
    expect(shipment?.status).toBe('In Transit');
  });

  it('returns null for nonexistent tracking code', async () => {
    const shipment = await apiClient.trackShipment('LP-9999-NOTFOUND');
    expect(shipment).toBeNull();
  });

  it('authenticates demo user with correct credentials', async () => {
    const user = await apiClient.login('dispatcher@logipulse.io', 'password123');
    expect(user).toBeDefined();
    expect(user.role).toBe('Dispatcher');
  });

  it('throws error for invalid credentials', async () => {
    await expect(apiClient.login('unknown@test.com', 'wrongpassword')).rejects.toThrow();
  });

  it('advances shipment simulation to next checkpoint', async () => {
    const updated = await apiClient.simulateNextStep('shp-4');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('Picked Up');
  });
});
