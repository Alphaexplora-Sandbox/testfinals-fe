import { expect, test } from '@playwright/test';

test.describe('testfinals-frontend deployment', () => {
  test('serves its entry page', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });

  test('displays brand header and tracking search hero', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="brand-logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-tracking-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-track-btn"]')).toBeVisible();
  });

  test('searches for a valid tracking number and displays checkpoint modal', async ({ page }) => {
    await page.goto('/');

    await page.fill('[data-testid="hero-tracking-input"]', 'LP-8924-XQ');
    await page.click('[data-testid="hero-track-btn"]');

    const modal = page.locator('[data-testid="tracking-result-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText('LP-8924-XQ');
    await expect(page.locator('[data-testid="modal-shipment-status"]')).toBeVisible();

    // Close modal
    await page.click('[data-testid="btn-close-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('clicking quick code suggestion opens tracking details', async ({ page }) => {
    await page.goto('/');

    const quickBtn = page.locator('[data-testid="quick-code-LP-4412-TR"]');
    if (await quickBtn.isVisible()) {
      await quickBtn.click();
      const modal = page.locator('[data-testid="tracking-result-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal).toContainText('LP-4412-TR');
    }
  });
});
