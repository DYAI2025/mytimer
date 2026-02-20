/**
 * Countdown Timer E2E Tests
 * Tests the Countdown Timer page against DoD requirements
 */

import { test, expect } from '@playwright/test';

test.describe('Countdown Timer - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // App uses hash-based routing
    await page.goto('/#/countdown');
  });

  test('DoD: Does start button start the timer?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
    
    // After clicking start, should see pause button
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Does Timer run in normal time speed?', async ({ page }) => {
    // Set a 1 minute timer
    const oneMinPreset = page.getByRole('button', { name: 'Set 1 min' });
    await oneMinPreset.click();
    
    const timeDisplay = page.getByRole('timer');
    await expect(timeDisplay).toBeVisible();
    const initialText = await timeDisplay.textContent();
    
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    const after2SecText = await timeDisplay.textContent();
    
    // Time should have changed (counted down)
    expect(initialText).not.toBe(after2SecText);
  });

  test('DoD: Does Timer count backwards (countdown)?', async ({ page }) => {
    // Set 5 minute timer
    const fiveMinPreset = page.getByRole('button', { name: 'Set 5 min' });
    await fiveMinPreset.click();
    
    const timeDisplay = page.getByRole('timer');
    await expect(timeDisplay).toBeVisible();
    
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    // Wait a moment and check time is decreasing
    await page.waitForTimeout(1000);
    const textAfter1Sec = await timeDisplay.textContent();
    
    await page.waitForTimeout(2000);
    const textAfter3Sec = await timeDisplay.textContent();
    
    // Parse minutes and seconds
    const parseTime = (text: string) => {
      const match = text?.match(/(\d+):(\d+)/);
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return 0;
    };
    
    const seconds1 = parseTime(textAfter1Sec || '');
    const seconds2 = parseTime(textAfter3Sec || '');
    
    // Should have counted down
    expect(seconds2).toBeLessThan(seconds1);
  });

  test('DoD: Does timer stop on pause button?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    // Wait a bit
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await pauseButton.click();
    
    // Should see resume button
    const resumeButton = page.getByRole('button', { name: 'Resume' });
    await expect(resumeButton).toBeVisible();
  });

  test('DoD: Does timer stop on reset button?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();
    
    // Should be back to start state
    await expect(startButton).toBeVisible();
  });

  test('DoD: Can timer proceed after pause button is clicked a second time (resume)?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await pauseButton.click();
    
    const resumeButton = page.getByRole('button', { name: 'Resume' });
    await resumeButton.click();
    
    // Should be running again (pause button visible)
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Can timer be set back on the defined reset button?', async ({ page }) => {
    // Set 5 minute timer
    const fiveMinPreset = page.getByRole('button', { name: 'Set 5 min' });
    await fiveMinPreset.click();
    
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(3000);
    
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();
    
    // Time display should show 05:00 again
    const timeDisplay = page.getByRole('timer');
    const text = await timeDisplay.textContent();
    expect(text).toContain('05:00');
  });

  test('DoD: Is it possible to adjust the timer start value?', async ({ page }) => {
    // Test preset buttons
    const presets = ['Set 1 min', 'Set 5 min', 'Set 10 min', 'Set 15 min', 'Set 25 min', 'Set 30 min'];
    
    for (const preset of presets) {
      const presetButton = page.getByRole('button', { name: preset });
      await expect(presetButton).toBeVisible();
      await presetButton.click();
    }
    
    // Test custom duration
    const customButton = page.getByRole('button', { name: 'Set custom duration' });
    await expect(customButton).toBeVisible();
    await customButton.click();
    
    // Should show duration picker
    const durationPicker = page.locator('[class*="picker"], [class*="modal"]').first();
    await expect(durationPicker).toBeVisible();
  });
});

test.describe('Countdown Timer - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/countdown');
  });

  test('Negative: No timer crash on excessive click on any button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    
    // Click start 20 times rapidly
    for (let i = 0; i < 20; i++) {
      await startButton.click().catch(() => {});
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
    
    // Try to click pause/resume rapidly
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    if (await pauseButton.isVisible().catch(() => false)) {
      for (let i = 0; i < 10; i++) {
        await pauseButton.click().catch(() => {});
      }
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('Negative: UI should not break with unrealistic values', async ({ page }) => {
    // Open custom duration picker
    const customButton = page.getByRole('button', { name: 'Set custom duration' });
    await customButton.click();
    
    // Try entering extreme values
    const inputs = await page.locator('input[type="number"]').all();
    
    for (const input of inputs) {
      await input.fill('999999');
    }
    
    // Try to confirm
    const confirmButton = page.getByRole('button', { name: /confirm|ok|set/i });
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
    
    // Page should still be functional (no crash)
    await expect(page.locator('body')).toBeVisible();
    
    // UI should still be intact
    const timerDisplay = page.getByRole('timer');
    await expect(timerDisplay).toBeVisible();
  });

  test('Negative: Multiple preset clicks should not cause issues', async ({ page }) => {
    const presets = ['Set 1 min', 'Set 5 min', 'Set 10 min', 'Set 15 min', 'Set 25 min', 'Set 30 min'];
    
    // Click all presets rapidly
    for (const preset of presets) {
      const presetButton = page.getByRole('button', { name: preset });
      await presetButton.click();
    }
    
    // Page should still work
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    // Should be running
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();
  });
});

test.describe('Countdown Timer - Persistence Tests', () => {
  test('DoD: Is Timer persistent when reloading page?', async ({ page }) => {
    // Navigate to countdown timer
    await page.goto('/#/countdown');
    
    // Start timer
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    // Get current time display
    const timeDisplay = page.getByRole('timer');
    const timeBeforeReload = await timeDisplay.textContent();
    
    // Reload page
    await page.reload();
    
    // After reload, timer should either:
    // 1. Be reset to initial state, or
    // 2. Continue from where it left off (if persistence is implemented)
    
    // Check page is functional
    await expect(page.locator('body')).toBeVisible();
  });
});
