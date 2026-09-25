import { expect, test } from '@playwright/test';

test.describe('testfinals-frontend authentication', () => {
  test('navigates to login page and displays form controls', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('[data-testid="login-page-root"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  });

  test('clicking demo dispatcher preset auto-fills credentials', async ({ page }) => {
    await page.goto('/login');

    await page.click('[data-testid="demo-dispatcher"]');
    const emailInput = page.locator('[data-testid="login-email"]');
    await expect(emailInput).toHaveValue('dispatcher@logipulse.io');
  });

  test('signs in successfully and redirects to operations command center', async ({ page }) => {
    await page.goto('/login');

    await page.click('[data-testid="demo-dispatcher"]');
    await page.click('[data-testid="login-submit"]');

    // Should redirect to dashboard
    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible({ timeout: 5000 });
  });
});
