import http from 'http';
import { SERVICE_NAME, generateHtml, startServer } from '../../src/index';

describe('testfinals-frontend and server', () => {
  it('should export SERVICE_NAME', () => {
    expect(SERVICE_NAME).toBe('testfinals-frontend');
  });

  it('generates HTML for different initial paths', () => {
    const rootHtml = generateHtml('/');
    expect(rootHtml).toContain('LogiPulse - Enterprise Logistics Cloud');
    expect(rootHtml).toContain('Global Supply Chain Orchestration');

    const loginHtml = generateHtml('/login');
    expect(loginHtml).toContain('Operations Terminal Sign In');

    const dashHtml = generateHtml('/dashboard');
    expect(dashHtml).toContain('Operations Command Center');

    const homeHtml = generateHtml('/home');
    expect(homeHtml).toContain('Operations Command Center');

    const fallbackHtml = generateHtml('/other-route');
    expect(fallbackHtml).toContain('Global Supply Chain Orchestration');
  });

  it('starts HTTP server and handles health / page routes', async () => {
    const testPort = 3891;
    const server = startServer(testPort);

    await new Promise((resolve) => server.once('listening', resolve));

    const checkRoute = (path: string): Promise<{ statusCode?: number; body: string }> => {
      return new Promise((resolve, reject) => {
        http.get(`http://localhost:${testPort}${path}`, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
          res.on('error', reject);
        }).on('error', reject);
      });
    };

    const health = await checkRoute('/health');
    expect(health.statusCode).toBe(200);
    expect(JSON.parse(health.body)).toEqual({ status: 'ok', service: 'testfinals-frontend' });

    const apiHealth = await checkRoute('/api/health');
    expect(apiHealth.statusCode).toBe(200);

    const page = await checkRoute('/');
    expect(page.statusCode).toBe(200);
    expect(page.body).toContain('<!DOCTYPE html>');

    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });
});