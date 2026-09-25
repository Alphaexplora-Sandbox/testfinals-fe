import React, { useState } from 'react';
import { Shipment } from '../types/logistics';
import { apiClient } from '../services/apiClient';

export interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToDashboard: () => void;
  initialTrackingCode?: string;
  initialSearchedShipment?: Shipment | null;
  initialSearchError?: string | null;
}

export const LandingPageActions = {
  performTrack: async (
    code: string,
    setSearching: (s: boolean) => void,
    setError: (err: string | null) => void,
    setShipment: (s: Shipment | null) => void,
  ) => {
    if (!code.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const result = await apiClient.trackShipment(code.trim());
      if (result) {
        setShipment(result);
      } else {
        setError(`Tracking code "${code}" was not found in active telematics.`);
        setShipment(null);
      }
    } catch {
      setError('Error contacting logistics telematics service.');
    } finally {
      setSearching(false);
    }
  },

  quickLookup: async (
    code: string,
    setCode: (c: string) => void,
    setSearching: (s: boolean) => void,
    setError: (err: string | null) => void,
    setShipment: (s: Shipment | null) => void,
  ) => {
    setCode(code);
    setSearching(true);
    setError(null);
    try {
      const result = await apiClient.trackShipment(code);
      setShipment(result);
    } finally {
      setSearching(false);
    }
  },
};

export const createLandingHandlers = (
  trackingCode: string,
  setTrackingCode: (val: string) => void,
  setIsSearching: (s: boolean) => void,
  setSearchError: (err: string | null) => void,
  setSearchedShipment: (s: Shipment | null) => void,
) => ({
  onTrackingChange: (e: React.ChangeEvent<HTMLInputElement>) => setTrackingCode(e.target.value),
  handleTrack: async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await LandingPageActions.performTrack(trackingCode, setIsSearching, setSearchError, setSearchedShipment);
  },
  handleQuickLookup: async (code: string) => {
    await LandingPageActions.quickLookup(code, setTrackingCode, setIsSearching, setSearchError, setSearchedShipment);
  },
  onQuickButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => {
    const code = e.currentTarget.dataset.code;
    if (code) {
      void LandingPageActions.quickLookup(code, setTrackingCode, setIsSearching, setSearchError, setSearchedShipment);
    }
  },
  handleCloseModal: () => setSearchedShipment(null),
});

export function LandingPage(props: Readonly<LandingPageProps>) {
  const {
    onNavigateToLogin,
    onNavigateToDashboard,
    initialTrackingCode = '',
    initialSearchedShipment = null,
    initialSearchError = null,
  } = props;
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [searchedShipment, setSearchedShipment] = useState<Shipment | null>(initialSearchedShipment);
  const [searchError, setSearchError] = useState<string | null>(initialSearchError);
  const [isSearching, setIsSearching] = useState(false);

  const handlers = createLandingHandlers(
    trackingCode,
    setTrackingCode,
    setIsSearching,
    setSearchError,
    setSearchedShipment,
  );

  return (
    <div data-testid="landing-page-root">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <span className="pulse-dot" /> Autonomous Telematics & Fleet Cloud v3.4
        </div>
        <h1 className="hero-heading" data-testid="hero-heading">
          Global Supply Chain Orchestration, <span>Intelligently Accelerated.</span>
        </h1>
        <p className="hero-subtext">
          Real-time cross-continental parcel telemetry, automated fleet dispatch, cold-chain temperature surveillance, and unified multi-hub warehouse control.
        </p>

        {/* Live Tracking Input Box */}
        <form className="tracking-search-card" onSubmit={handlers.handleTrack}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="tracking-input"
            placeholder="Enter Waybill or Tracking # (e.g. LP-8924-XQ)"
            value={trackingCode}
            onChange={handlers.onTrackingChange}
            data-testid="hero-tracking-input"
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={isSearching}
            data-testid="hero-track-btn"
          >
            {isSearching ? 'Scanning Network...' : 'Track Cargo'}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Demos:</span>
          {['LP-8924-XQ', 'LP-4412-TR', 'LP-9032-DE'].map((code) => (
            <button
              key={code}
              type="button"
              className="action-btn-sm"
              style={{ fontFamily: 'monospace', fontWeight: 600 }}
              data-code={code}
              onClick={handlers.onQuickButtonClick}
              data-testid={`quick-code-${code}`}
            >
              {code}
            </button>
          ))}
        </div>

        {searchError && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              maxWidth: '540px',
              margin: '0 auto 2rem',
              fontSize: '0.875rem',
            }}
            data-testid="tracking-error-alert"
          >
            {searchError}
          </div>
        )}
      </section>

      {/* Tracking Result Modal / Drawer */}
      <div
        className="modal-overlay"
        data-testid="tracking-result-modal"
        style={{ display: searchedShipment ? 'flex' : 'none' }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Waybill Verification
              </div>
              <div
                className="modal-title"
                style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}
                data-testid="modal-tracking-number"
              >
                {searchedShipment ? searchedShipment.trackingNumber : 'LP-8924-XQ'}
              </div>
            </div>
            <button
              className="close-btn"
              onClick={handlers.handleCloseModal}
              data-testid="btn-close-modal"
            >
              &times;
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status</div>
              <div style={{ fontWeight: 700, color: '#38bdf8' }} data-testid="modal-shipment-status">
                {searchedShipment ? searchedShipment.status : 'In Transit'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Priority</div>
              <div style={{ fontWeight: 700, color: '#f59e0b' }}>
                {searchedShipment ? searchedShipment.priority : 'Express'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Route</div>
              <div style={{ fontWeight: 600 }}>
                {searchedShipment ? `${searchedShipment.origin} \u2192 ${searchedShipment.destination}` : 'Austin, TX \u2192 Chicago, IL'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated Arrival</div>
              <div style={{ fontWeight: 600 }}>
                {searchedShipment ? searchedShipment.estimatedDelivery : 'Today, 18:30 CST'}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Checkpoint Progression
            </div>
            <div className="timeline">
              {(searchedShipment ? searchedShipment.events : [
                { id: '1', status: 'In Transit', location: 'I-55 Northbound mm 142', description: 'Approaching Chicago metropolitan outer loop.', timestamp: 'Sep 24, 09:15' },
              ]).map((evt) => (
                <div key={evt.id} className="timeline-step">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-status">{evt.status} &bull; <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{evt.location}</span></div>
                    <div className="timeline-desc">{evt.description}</div>
                    <div className="timeline-meta">{evt.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="secondary-btn" onClick={handlers.handleCloseModal}>
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Global Operational Metrics */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-title">On-Time Delivery Rate</span>
            <span className="metric-value" style={{ color: 'var(--accent-emerald)' }}>99.8%</span>
            <span className="metric-trend trend-positive">&uarr; +0.4% this quarter</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Monthly Telematics Events</span>
            <span className="metric-value">1.4M+</span>
            <span className="metric-trend trend-positive">&uarr; Autonomous telemetry</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Global Fulfillment Hubs</span>
            <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>48 Hubs</span>
            <span className="metric-trend" style={{ color: 'var(--text-muted)' }}>US, EU, APAC nodes</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Avg Dispatch Latency</span>
            <span className="metric-value">&lt; 15 min</span>
            <span className="metric-trend trend-positive">&uarr; AI algorithmic queuing</span>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Showcase */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Mission-Critical Supply Chain Features
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Engineered for global freight operators, 3PL providers, and pharmaceutical cold-chains.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              &Delta;
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Autonomous Routing</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Dynamic GPS rerouting based on live highway congestion, weather advisories, and driver hours-of-service compliance.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              &empty;
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cold Chain Precision</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Continuous sub-zero temperature telemetry for vaccines, biologics, and perishable commodities with automatic alert triggers.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              &Sigma;
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Multi-Hub Inventory</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Instant reconciliation of warehouse stock across Rotterdam, Chicago, Dallas, and Singapore with automatic reorder triggers.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              &sect;
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Connected Fleet Telemetry</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Real-time battery/fuel consumption monitoring, cargo weight utilization, and instant driver-to-vehicle dispatch orchestration.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 6rem', padding: '0 1.5rem' }}>
        <div
          className="glass-panel"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
          }}
        >
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to Take Command of Your Fleet?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Sign into the Operations Terminal to access live shipment controls, assign drivers, or create new waybills.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="primary-btn"
              onClick={onNavigateToLogin}
              data-testid="hero-login-btn"
            >
              Sign In to Dispatch Portal
            </button>
            <button
              className="secondary-btn"
              onClick={onNavigateToDashboard}
              data-testid="hero-dashboard-btn"
            >
              Enter Live Command Center
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
