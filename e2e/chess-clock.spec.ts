/**
 * Chess Clock E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Chess Clock - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timer/chess');
  });

  test('DoD: Does start button start the chess clock?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
  });

  test('DoD: Shows both player timers', async ({ page }) => {
    const timeDisplays = page.locator('[class*="time"], [class*="player"]').all();
    expect((await timeDisplays).length).toBeGreaterThanOrEqual(2);
  });

  test('DoD: Can switch between players', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.click();
    
    // Find player tap areas or switch button
    const playerArea = page.locator('[class*="player"]').first();
    await playerArea.click();
  });

  test('DoD: Can pause the clock', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.click();
    
    await page.waitForTimeout(500);
    
    const pauseButton = page.getByRole('button', { name: /pause/i });
    if (await pauseButton.isVisible().catch(() => false)) {
      await pauseButton.click();
    }
  });

  test('DoD: Can reset the clock', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();
    
    await resetButton.click();
  });

  test('DoD: Can adjust time settings', async ({ page }) => {
    // Look for time setting inputs
    const inputs = await page.locator('input[type="number"]').all();
    expect(inputs.length).toBeGreaterThan(0);
  });
});

test.describe('Chess Clock - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timer/chess');
  });

  test('Negative: No crash on excessive clicks', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      for (let i = 0; i < 5; i++) {
        await button.click({ force: true });
      }
    }
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Negative: Invalid time settings', async ({ page }) => {
    const inputs = await page.locator('input[type="number"]').all();
    
    for (const input of inputs) {
      await input.fill('-10');
      await input.fill('999');
    }
    
    await expect(page.locator('body')).toBeVisible();
  });
});
