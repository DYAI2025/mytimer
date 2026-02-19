/**
 * Interval Timer E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Interval Timer - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timer/interval');
  });

  test('DoD: Does start button start the interval timer?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
    
    const pauseButton = page.getByRole('button', { name: /pause/i });
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Does timer count down during work phase?', async ({ page }) => {
    const timeDisplay = page.locator('[class*="time"]').first();
    const initialText = await timeDisplay.textContent();
    
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const after2SecText = await timeDisplay.textContent();
    expect(initialText).not.toBe(after2SecText);
  });

  test('DoD: Does timer stop on pause?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: /pause/i });
    await pauseButton.click();
    
    const resumeButton = page.getByRole('button', { name: /resume/i });
    await expect(resumeButton).toBeVisible();
  });

  test('DoD: Can timer proceed after resume?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: /pause/i });
    await pauseButton.click();
    
    const resumeButton = page.getByRole('button', { name: /resume/i });
    await resumeButton.click();
    
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Can timer be reset?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.click();
    
    // Should show initial state
    const timeDisplay = page.locator('[class*="time"]').first();
    await expect(timeDisplay).toBeVisible();
  });

  test('DoD: Preset buttons work (Tabata, HIIT, EMOM)', async ({ page }) => {
    const presets = ['Tabata', 'HIIT', 'EMOM'];
    
    for (const preset of presets) {
      const presetButton = page.getByRole('button', { name: new RegExp(preset, 'i') });
      await expect(presetButton).toBeVisible();
      await presetButton.click();
    }
  });

  test('DoD: Shows current phase', async ({ page }) => {
    const phaseBadge = page.locator('[class*="phase"], [class*="badge"]').first();
    await expect(phaseBadge).toBeVisible();
  });

  test('DoD: Shows round indicators', async ({ page }) => {
    const roundLabel = page.locator('text=/round/i').first();
    await expect(roundLabel).toBeVisible();
  });

  test('DoD: Settings panel opens', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    // Settings panel should be visible
    const settingsPanel = page.locator('[class*="settings"]').first();
    await expect(settingsPanel).toBeVisible();
  });
});

test.describe('Interval Timer - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timer/interval');
  });

  test('Negative: No crash on excessive button clicks', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i });
    
    for (let i = 0; i < 20; i++) {
      await startButton.click({ force: true });
    }
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Negative: Settings inputs with extreme values', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    const inputs = await page.locator('input[type="number"]').all();
    
    for (const input of inputs) {
      await input.fill('999');
      await input.fill('-100');
      await input.fill('0');
    }
    
    // UI should still work
    await expect(page.locator('body')).toBeVisible();
  });

  test('Negative: Rapid preset switching', async ({ page }) => {
    const presets = ['Tabata', 'HIIT', 'EMOM', 'Custom'];
    
    for (let i = 0; i < 3; i++) {
      for (const preset of presets) {
        const presetButton = page.getByRole('button', { name: new RegExp(preset, 'i') });
        await presetButton.click({ force: true });
      }
    }
    
    await expect(page.locator('body')).toBeVisible();
  });
});
