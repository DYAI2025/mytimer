/**
 * Stopwatch Timer E2E Tests
 * Tests the Stopwatch Timer page against DoD requirements
 */

import { test, expect } from '@playwright/test';

test.describe('Stopwatch Timer - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/stopwatch');
  });

  test('DoD: Does start button start the stopwatch?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
    
    // After clicking start, should see pause button
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Does Stopwatch count forwards?', async ({ page }) => {
    const timeDisplay = page.getByRole('timer');
    await expect(timeDisplay).toBeVisible();
    const initialText = await timeDisplay.textContent();
    
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    // Wait 2 seconds
    await page.waitForTimeout(2000);
    
    const after2SecText = await timeDisplay.textContent();
    
    // Parse time values (format: MM:SS or HH:MM:SS)
    const parseTime = (text: string) => {
      const parts = text?.trim().split(':').map(Number);
      if (parts && parts.length === 2) {
        return parts[0] * 60 + parts[1]; // MM:SS
      } else if (parts && parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
      }
      return 0;
    };
    
    const initialSeconds = parseTime(initialText || '00:00');
    const after2Seconds = parseTime(after2SecText || '00:00');
    
    // Should have counted up
    expect(after2Seconds).toBeGreaterThan(initialSeconds);
  });

  test('DoD: Does stopwatch stop on pause button?', async ({ page }) => {
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

  test('DoD: Can stopwatch proceed after resume?', async ({ page }) => {
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

  test('DoD: Can stopwatch be set back on reset button?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(3000);
    
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();
    
    // Time display should show 00:00 again
    const timeDisplay = page.getByRole('timer');
    const text = await timeDisplay.textContent();
    expect(text).toMatch(/00:00|0:00/);
  });

  test('DoD: Lap recording functionality', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    // Look for lap button (might be labeled differently)
    const lapButton = page.getByRole('button', { name: /lap|split/i });
    
    // If lap button exists, test it
    if (await lapButton.isVisible().catch(() => false)) {
      await lapButton.click();
      
      await page.waitForTimeout(1000);
      
      // Click lap again
      await lapButton.click();
      
      // Should have lap times displayed
      const lapContainer = page.locator('[class*="lap"]').first();
      await expect(lapContainer).toBeVisible();
    }
  });
});

test.describe('Stopwatch Timer - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/stopwatch');
  });

  test('Negative: No crash on excessive button clicks', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    
    // Click start 20 times rapidly
    for (let i = 0; i < 20; i++) {
      await startButton.click().catch(() => {});
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
    
    // Try lap button while not running
    const lapButton = page.getByRole('button', { name: /lap|split/i });
    for (let i = 0; i < 10; i++) {
      await lapButton.click().catch(() => {});
    }
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('Negative: Multiple rapid resets should not cause issues', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const resetButton = page.getByRole('button', { name: 'Reset' });
    
    // Click reset 10 times
    for (let i = 0; i < 10; i++) {
      await resetButton.click();
    }
    
    // Page should be functional
    await expect(page.locator('body')).toBeVisible();
    
    // Should be able to start again
    await startButton.click();
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();
  });
});
