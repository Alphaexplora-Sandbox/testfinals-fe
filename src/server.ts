import http from 'node:http';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';

export const PORT = Number(process.env.PORT) || 3000;

export function generateHtml(initialPath: string = '/'): string {
  let initialView: 'landing' | 'login' | 'dashboard' = 'landing';
  if (initialPath === '/login') initialView = 'login';
  if (initialPath === '/dashboard' || initialPath === '/home') initialView = 'dashboard';

  const renderedApp = renderToString(React.createElement(App, { initialView }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LogiPulse - Enterprise Logistics Cloud</title>
  <meta name="description" content="Next-generation global logistics telematics, autonomous fleet dispatch, and cold-chain surveillance cloud.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📦</text></svg>">
</head>
<body>
  <div id="root">${renderedApp}</div>
  <script>
    // Client-side progressive enhancement & interactivity
    (function() {
      // 1. Navigation handling
      function setupNav() {
        document.querySelectorAll('[data-testid^="nav-"]').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            var target = btn.getAttribute('data-testid');
            if (target === 'nav-home') window.location.href = '/';
            if (target === 'nav-dashboard') window.location.href = '/dashboard';
            if (target === 'nav-login-btn') window.location.href = '/login';
          });
        });

        var brandLogo = document.querySelector('[data-testid="brand-logo"]');
        if (brandLogo) {
          brandLogo.addEventListener('click', function() { window.location.href = '/'; });
        }

        var heroLogin = document.querySelector('[data-testid="hero-login-btn"]');
        if (heroLogin) {
          heroLogin.addEventListener('click', function() { window.location.href = '/login'; });
        }

        var heroDashboard = document.querySelector('[data-testid="hero-dashboard-btn"]');
        if (heroDashboard) {
          heroDashboard.addEventListener('click', function() { window.location.href = '/dashboard'; });
        }

        var backHome = document.querySelector('[data-testid="back-to-home"]');
        if (backHome) {
          backHome.addEventListener('click', function() { window.location.href = '/'; });
        }
      }

      // 2. Demo credentials auto-fill
      function setupLogin() {
        document.querySelectorAll('[data-testid^="demo-"]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var emailInput = document.querySelector('[data-testid="login-email"]');
            var passwordInput = document.querySelector('[data-testid="login-password"]');
            var role = btn.getAttribute('data-testid').replace('demo-', '');
            var emailMap = {
              'admin': 'admin@logipulse.io',
              'dispatcher': 'dispatcher@logipulse.io',
              'warehousemanager': 'warehouse@logipulse.io',
              'driver': 'driver@logipulse.io'
            };
            if (emailInput && emailMap[role]) emailInput.value = emailMap[role];
            if (passwordInput) passwordInput.value = 'password123';
          });
        });

        var loginForm = document.querySelector('[data-testid="login-page-root"] form');
        if (loginForm) {
          loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.querySelector('[data-testid="login-email"]').value;
            var password = document.querySelector('[data-testid="login-password"]').value;
            if (password === 'password123' || password === 'admin' || password === 'demo') {
              window.location.href = '/dashboard';
            } else {
              var alert = document.querySelector('[data-testid="login-error-alert"]');
              if (!alert) {
                alert = document.createElement('div');
                alert.setAttribute('data-testid', 'login-error-alert');
                alert.style.cssText = 'padding: 0.75rem 1rem; border-radius: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 0.85rem; margin-bottom: 1.5rem;';
                loginForm.parentNode.insertBefore(alert, loginForm);
              }
              alert.textContent = 'Invalid email or password. Use demo credentials.';
            }
          });
        }
      }

      // 3. Tab switching in Dashboard
      function setupTabs() {
        var tabShipments = document.querySelector('[data-testid="tab-shipments"]');
        var tabFleet = document.querySelector('[data-testid="tab-fleet"]');
        var tabWarehouses = document.querySelector('[data-testid="tab-warehouses"]');

        function switchTab(selected) {
          document.querySelectorAll('[data-testid^="tab-"]').forEach(function(t) {
            t.classList.remove('active');
          });
          if (selected === 'shipments' && tabShipments) tabShipments.classList.add('active');
          if (selected === 'fleet' && tabFleet) tabFleet.classList.add('active');
          if (selected === 'warehouses' && tabWarehouses) tabWarehouses.classList.add('active');
        }

        if (tabShipments) tabShipments.addEventListener('click', function() { switchTab('shipments'); });
        if (tabFleet) tabFleet.addEventListener('click', function() { switchTab('fleet'); });
        if (tabWarehouses) tabWarehouses.addEventListener('click', function() { switchTab('warehouses'); });
      }

      // 4. Quick tracking & search form
      function setupQuickTracking() {
        document.querySelectorAll('[data-testid^="quick-code-"]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var code = btn.textContent.trim();
            var input = document.querySelector('[data-testid="hero-tracking-input"]');
            if (input) input.value = code;
            var trackingModal = document.querySelector('[data-testid="tracking-result-modal"]');
            var titleEl = trackingModal ? trackingModal.querySelector('[data-testid="modal-tracking-number"]') : null;
            if (titleEl) titleEl.textContent = code;
            if (trackingModal) trackingModal.style.display = 'flex';
          });
        });

        var trackBtn = document.querySelector('[data-testid="hero-track-btn"]');
        if (trackBtn) {
          trackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var input = document.querySelector('[data-testid="hero-tracking-input"]');
            var code = input && input.value.trim() ? input.value.trim() : 'LP-8924-XQ';
            var trackingModal = document.querySelector('[data-testid="tracking-result-modal"]');
            var titleEl = trackingModal ? trackingModal.querySelector('[data-testid="modal-tracking-number"]') : null;
            if (titleEl) titleEl.textContent = code;
            if (trackingModal) trackingModal.style.display = 'flex';
          });
        }
      }

      // 5. Modals dialogs (create shipment, inspect waybill, close modal)
      function setupModals() {
        var createBtn = document.querySelector('[data-testid="btn-create-shipment"]');
        var createModal = document.querySelector('[data-testid="create-shipment-modal"]');
        if (createBtn && createModal) {
          createBtn.addEventListener('click', function() {
            createModal.style.display = 'flex';
          });
        }

        var createForm = createModal ? createModal.querySelector('form') : null;
        if (createForm) {
          createForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (createModal) createModal.style.display = 'none';
          });
        }

        document.querySelectorAll('[data-testid="btn-inspect-waybill"]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var detailModal = document.querySelector('[data-testid="shipment-detail-modal"]');
            if (detailModal) detailModal.style.display = 'flex';
          });
        });

        var closeBtn = document.querySelector('[data-testid="btn-close-modal"]');
        var trackingModal = document.querySelector('[data-testid="tracking-result-modal"]');
        if (closeBtn && trackingModal) {
          closeBtn.addEventListener('click', function() {
            trackingModal.style.display = 'none';
          });
        }

        document.querySelectorAll('.modal-overlay .secondary-btn, .modal-overlay .close-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var overlay = btn.closest('.modal-overlay');
            if (overlay) overlay.style.display = 'none';
          });
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          setupNav();
          setupLogin();
          setupTabs();
          setupQuickTracking();
          setupModals();
        });
      } else {
        setupNav();
        setupLogin();
        setupTabs();
        setupQuickTracking();
        setupModals();
      }
    })();
  </script>
</body>
</html>`;
}

export function startServer(port: number = PORT): http.Server {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Health check endpoint
    if (pathname === '/health' || pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'testfinals-frontend' }));
      return;
    }

    // Serve HTML
    const html = generateHtml(pathname);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(html);
  });

  server.listen(port, () => {
    console.log(`LogiPulse Frontend listening at http://localhost:${port}`);
  });

  return server;
}
