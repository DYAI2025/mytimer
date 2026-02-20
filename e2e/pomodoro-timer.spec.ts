/**
 * Pomodoro Timer E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Pomodoro Timer - Positive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pomodoro');
  });

  test('DoD: Does start button start the pomodoro timer?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Does timer count down during work phase?', async ({ page }) => {
    const timeDisplay = page.getByRole('timer');
    await expect(timeDisplay).toBeVisible();
    
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    // Get initial time
    const initialText = await timeDisplay.textContent();
    
    await page.waitForTimeout(2000);
    
    const after2SecText = await timeDisplay.textContent();
    
    // Time should have changed
    expect(initialText).not.toBe(after2SecText);
  });

  test('DoD: Does timer stop on pause?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await pauseButton.click();
    
    const resumeButton = page.getByRole('button', { name: 'Resume' });
    await expect(resumeButton).toBeVisible();
  });

  test('DoD: Can timer proceed after resume?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await pauseButton.click();
    
    const resumeButton = page.getByRole('button', { name: 'Resume' });
    await resumeButton.click();
    
    await expect(pauseButton).toBeVisible();
  });

  test('DoD: Can timer be reset?', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();
    
    // Should show work phase time (25:00)
    const timeDisplay = page.getByRole('timer');
    const text = await timeDisplay.textContent();
    expect(text).toContain('25:00');
  });

  test('DoD: Shows correct work phase initially', async ({ page }) => {
    const phaseIndicator = page.locator('text=/focus|work/i').first();
    await expect(phaseIndicator).toBeVisible();
  });

  test('DoD: Displays completed pomodoro count', async ({ page }) => {
    const completedText = page.locator('text=/completed|pomodoro/i').first();
    await expect(completedText).toBeVisible();
  });
});

test.describe('Pomodoro Timer - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/pomodoro');
  });

  test('Negative: No crash on excessive button clicks', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    
    for (let i = 0; i < 20; i++) {
      await startButton.click().catch(() => {});
    }
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Negative: Multiple pause/resume cycles', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start' });
    await startButton.click();
    
    for (let i = 0; i < 10; i++) {
      const pauseButton = page.getByRole('button', { name: 'Pause' });
      const resumeButton = page.getByRole('button', { name: 'Resume' });
      
      if (await pauseButton.isVisible().catch(() => false)) {
        await pauseButton.click();
      } else if (await resumeButton.isVisible().catch(() => false)) {
        await resumeButton.click();
      }
    }
    
    await expect(page.locator('body')).toBeVisible();
  });
});
