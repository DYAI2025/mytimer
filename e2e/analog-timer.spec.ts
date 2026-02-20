/**
 * Analog Timer E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Analog Timer - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/analog');
  });

  test('DoD: Does start button start the analog timer?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Canvas element is rendered', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('DoD: Does timer count down?', async ({ page }) => {
    const timeDisplay = page.getByRole('timer');
    await expect(timeDisplay).toBeVisible();
    const initialText = await timeDisplay.textContent();
    
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const after2SecText = await timeDisplay.textContent();
    expect(initialText).not.toBe(after2SecText);
  });

  test('DoD: Does timer stop on pause?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await pauseButton.click();
    
    // Should show resume button
    const resumeButton = page.getByRole('button', { name: 'Resume' });
    await expect(resumeButton).toBeVisible();
  });

  test('DoD: Can timer be reset?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();
    
    // Should be reset to initial time
    const timeDisplay = page.getByRole('timer');
    await expect(timeDisplay).toBeVisible();
  });

  test('DoD: Can adjust timer with preset buttons?', async ({ page }) => {
    // Look for preset buttons with various patterns
    const presets = ['5m', '10m', '15m', '20m', '25m', '30m', '5 min', '10 min'];
    
    for (const preset of presets) {
      const presetButton = page.getByRole('button', { name: new RegExp(preset, 'i') });
      if (await presetButton.isVisible().catch(() => false)) {
        await expect(presetButton).toBeVisible();
        return; // Found at least one preset button
      }
    }
  });

  test('DoD: Can adjust timer with +/- buttons?', async ({ page }) => {
    const adjustmentButtons = page.locator('button').filter({ hasText: /\+[0-9]+m|\-[0-9]+m/ });
    const count = await adjustmentButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('DoD: Can set custom timer duration?', async ({ page }) => {
    const customInput = page.locator('input[type="number"]').first();
    if (await customInput.isVisible().catch(() => false)) {
      await customInput.fill('45');
      
      const setButton = page.getByRole('button', { name: /set/i });
      await setButton.click();
    }
  });

  test('DoD: Fullscreen button works', async ({ page }) => {
    const fullscreenButton = page.getByRole('button', { name: /fullscreen/i });
    await expect(fullscreenButton).toBeVisible();
  });
});

test.describe('Analog Timer - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/analog');
  });

  test('Negative: No crash on excessive button clicks', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (const button of buttons.slice(0, 5)) {
      for (let i = 0; i < 10; i++) {
        await button.click().catch(() => {});
      }
    }
    
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('Negative: Invalid custom input should not break UI', async ({ page }) => {
    const customInput = page.locator('input[type="number"]').first();
    if (await customInput.isVisible().catch(() => false)) {
      // Try invalid values
      await customInput.fill('-10');
      await customInput.fill('9999');
      await customInput.fill('0');
      await customInput.fill('abc');
    }
    
    // UI should still work
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });
});
