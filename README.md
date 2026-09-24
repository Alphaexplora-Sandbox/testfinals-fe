# testfinals-frontend: LogiPulse Logistics Cloud

Next-generation Logistics Management Platform, Public Waybill Tracking, and Operations Command Center, automated with **AlphaCI Enterprise** CI/CD and deployed to **Vercel**.

## Features

- **Public Tracking & Landing Page (`/`)**:
  - Live waybill search bar (e.g. `LP-8924-XQ`, `LP-4412-TR`, `LP-9032-DE`).
  - Interactive checkpoint timeline stepper modal.
  - Global supply chain operational metrics & capabilities showcase.
- **Operations Terminal Sign In (`/login`)**:
  - Split-screen dark glassmorphic interface with form validation.
  - 1-Click Demo Profiles (Logistics Director, Chief Dispatcher, Warehouse Lead, Fleet Driver) with instant auto-fill for frictionless testing.
- **Operations Command Center (`/dashboard`)**:
  - Real-time KPI metrics grid (Active Freight, In-Transit GPS, Delayed Alerts, Fleet Utilization, Warehouse Occupancy, On-Time SLA).
  - Waybill Manager with search, multi-status filters, and "Register Waybill" modal.
  - Checkpoint Simulator (`Simulate ▶`): step through shipment lifecycle (*Picked Up* &rarr; *In Transit* &rarr; *Out for Delivery* &rarr; *Delivered*) with live UI and telemetry updates.
  - Connected Fleet & Telematics tab: vehicle fuel/battery gauges, capacities, and driver assignments.
  - Multi-Hub Warehouse & Inventory tab: global storage occupancy and critical SKU reorder monitoring.

## Vercel Environment Variables

Configure these in **Vercel Dashboard** -> Project Settings -> **Environment Variables**:

| Variable | Environment | Example Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Preview & Production | `https://alphaci-backend-uat-testfinals-backend.onrender.com` (UAT) / `https://testfinals-backend.onrender.com` (Prod) | Base URL of deployed Render backend API |
| `API_URL` | Preview & Production | Same as `NEXT_PUBLIC_API_URL` | Server-side fallback API URL |
| `NODE_ENV` | Production | `production` | Node environment |

## Playwright End-to-End Testing

Playwright tests run in CI automatically during `30-alphaci-verify.yml` against the deployed Vercel preview/production URLs.

### Running Playwright Locally:
```bash
# Terminal 1: Launch the web server
npm start

# Terminal 2: Run Playwright E2E suite
$env:E2E_BASE_URL="http://localhost:3000"
npx playwright test
```

### Test Suites (`tests/e2e/`):
- `home.e2e-spec.ts`: Tests entry page load, header, hero tracking search, and waybill modal.
- `auth.e2e-spec.ts`: Tests login form, demo credentials auto-fill, and redirection to `/dashboard`.
- `logistics-dashboard.e2e-spec.ts`: Tests metrics display, tab switching, new waybill creation, and waybill inspection.

## Branch Strategy & Promotion Workflow

Always branch from `dev`:
```bash
git checkout dev
git pull origin dev
git checkout -b feat/your-feature
```

Open a pull request into `dev`. Once merged:
1. `dev`: Quality pipeline runs and promotes to `uat`.
2. `uat`: Vercel deploys preview alias, and AlphaCI triggers Playwright E2E verify suite.
3. `main`: Successful verification triggers automatic promotion to `main` and production Vercel deployment.