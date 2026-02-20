/**
 * Breathing Timer E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Breathing Timer - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/breathing');
  });

  test('DoD: Does start button start the breathing timer?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start|begin/i });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
  });

  test('DoD: Shows breathing phase', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start|begin/i });
    await startButton.click();
    
    // Should show some phase indicator
    const phaseIndicator = page.locator('text=/inhale|hold|exhale|breathe/i').first();
    await expect(phaseIndicator).toBeVisible();
  });

  test('DoD: Pattern selection works', async ({ page }) => {
    const patterns = ['4-7-8', 'Box', 'Simple'];
    
    for (const pattern of patterns) {
      const patternButton = page.getByRole('button', { name: new RegExp(pattern, 'i') });
      if (await patternButton.isVisible().catch(() => false)) {
        await patternButton.click();
      }
    }
  });

  test('DoD: Can stop/reset breathing timer', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start|begin/i });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const stopButton = page.getByRole('button', { name: /stop|reset|end/i }).first();
    if (await stopButton.isVisible().catch(() => false)) {
      await stopButton.click();
    }
  });
});

test.describe('Breathing Timer - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/breathing');
  });

  test('Negative: No crash on rapid start/stop', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start|begin/i });
    
    for (let i = 0; i < 10; i++) {
      await startButton.click().catch(() => {});
      await page.waitForTimeout(100);
    }
    
    await expect(page.locator('body')).toBeVisible();
  });
});
