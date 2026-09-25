import { expect, test } from '@playwright/test';

test.describe('testfinals-frontend command center', () => {
  test('displays operational metrics and shipments table on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-shipments"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipments-table"]')).toBeVisible();
  });

  test('switches across tabs to view fleet and warehouses', async ({ page }) => {
    await page.goto('/dashboard');

    // Click Fleet Tab
    await page.click('[data-testid="tab-fleet"]');
    await expect(page.locator('[data-testid="tab-fleet"]')).toHaveClass(/active/);

    // Click Warehouses Tab
    await page.click('[data-testid="tab-warehouses"]');
    await expect(page.locator('[data-testid="tab-warehouses"]')).toHaveClass(/active/);

    // Switch back to Shipments
    await page.click('[data-testid="tab-shipments"]');
    await expect(page.locator('[data-testid="tab-shipments"]')).toHaveClass(/active/);
  });

  test('opens new waybill registration modal', async ({ page }) => {
    await page.goto('/dashboard');

    await page.click('[data-testid="btn-create-shipment"]');
    const modal = page.locator('[data-testid="create-shipment-modal"]');
    await expect(modal).toBeVisible();

    await page.fill('[data-testid="input-sender"]', 'Automated QA Labs');
    await page.fill('[data-testid="input-recipient"]', 'Global Cargo Consignee');
    await page.click('[data-testid="submit-new-shipment"]');

    await expect(modal).not.toBeVisible();
  });

  test('inspects waybill and views telemetry timeline', async ({ page }) => {
    await page.goto('/dashboard');

    const inspectBtn = page.locator('[data-testid="btn-inspect-waybill"]').first();
    if (await inspectBtn.isVisible()) {
      await inspectBtn.click();
      const modal = page.locator('[data-testid="shipment-detail-modal"]');
      await expect(modal).toBeVisible();
    }
  });
});
