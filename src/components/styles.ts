export const CSS_STYLES = `
:root {
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-card: rgba(17, 24, 39, 0.75);
  --bg-card-hover: rgba(30, 41, 59, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: #3b82f6;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --accent-purple: #8b5cf6;
  --shadow-glow: 0 0 25px rgba(6, 182, 212, 0.15);
  --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-primary);
  background-image: 
    radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.08) 0%, transparent 45%);
  background-attachment: fixed;
  color: var(--text-primary);
  font-family: var(--font-family);
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Glassmorphic Container */
.glass-panel {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}

/* Header & Nav */
.header-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10, 14, 23, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0.85rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.brand-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 1.15rem;
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  background: linear-gradient(to right, #f8fafc, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-btn.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.connection-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulseAnimation 2s infinite;
}

@keyframes pulseAnimation {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Hero Section */
.hero-section {
  max-width: 1200px;
  margin: 3.5rem auto 2.5rem;
  padding: 0 1.5rem;
  text-align: center;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 9999px;
  color: var(--accent-cyan);
  font-size: 0.825rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-heading {
  font-size: 3.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 1.25rem;
}

.hero-heading span {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtext {
  font-size: 1.15rem;
  color: var(--text-secondary);
  max-width: 720px;
  margin: 0 auto 2.5rem;
}

/* Tracking Input Box */
.tracking-search-card {
  max-width: 680px;
  margin: 0 auto 3rem;
  padding: 0.6rem 0.6rem 0.6rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(17, 24, 39, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4), var(--shadow-glow);
}

.tracking-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.05rem;
  color: #fff;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.tracking-input::placeholder {
  color: var(--text-muted);
  font-family: var(--font-family);
  font-weight: 400;
}

.primary-btn {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
}

.primary-btn:active {
  transform: translateY(0);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Metrics Row */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.metric-card {
  padding: 1.35rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--bg-card);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.metric-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  font-weight: 600;
}

.metric-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.metric-trend {
  font-size: 0.775rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.trend-positive { color: var(--accent-emerald); }
.trend-warning { color: var(--accent-amber); }
.trend-danger { color: var(--accent-rose); }

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-intransit {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-outfordelivery {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.status-delivered {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-delayed {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Priority Badges */
.priority-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.priority-coldchain {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.priority-express {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

/* Data Table */
.data-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th {
  background: rgba(15, 23, 42, 0.6);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table td {
  padding: 1rem 1.15rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

/* Action Buttons inside Table */
.action-btn-sm {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.775rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-right: 0.4rem;
}

.action-btn-sm:hover {
  color: #fff;
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

/* Modals & Dialogs */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-content {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  padding: 2rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 1rem;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover { color: #fff; }

/* Stepper / Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 1.5rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-step {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -1.5rem;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  border: 3px solid #111827;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.timeline-status {
  font-weight: 600;
  font-size: 0.925rem;
  color: #fff;
}

.timeline-meta {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.timeline-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Form Controls */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input, .form-select {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus, .form-select:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* Demo Credentials Box */
.demo-credentials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
  margin-top: 1rem;
}

.demo-account-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.demo-account-btn:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.35);
}

.demo-role {
  font-size: 0.8rem;
  font-weight: 600;
  color: #60a5fa;
}

.demo-email {
  font-size: 0.72rem;
  color: var(--text-muted);
}
`;
