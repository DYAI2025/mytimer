/**
 * TimerEngine Unit Tests
 * Tests the core timer logic against DoD requirements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimerEngine, formatTime, formatTimePrecise } from './TimerEngine';
import type { TimerEngineConfig } from '@/types';

describe('TimerEngine', () => {
  let engine: TimerEngine;
  let onTick: ReturnType<typeof vi.fn>;
  let onComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    onTick = vi.fn();
    onComplete = vi.fn();
  });

  afterEach(() => {
    engine?.destroy();
    vi.useRealTimers();
  });

  // Helper to advance time and wait for RAF
  const advanceTime = async (ms: number) => {
    vi.advanceTimersByTime(ms);
    // Allow RAF to execute
    await vi.advanceTimersByTimeAsync(16);
  };

  describe('POSITIVE TESTS - Countdown Timer', () => {
    it('DoD: Does start button start the timer?', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);

      expect(engine.getState().isRunning).toBe(false);
      engine.start();
      expect(engine.getState().isRunning).toBe(true);
    });

    it('DoD: Does Timer run in normal time speed?', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      const initialRemaining = engine.getState().remaining;
      
      // Advance by 1 second
      await advanceTime(1000);
      
      const remainingAfter1Sec = engine.getState().remaining;
      const diff = initialRemaining - remainingAfter1Sec;
      
      // Should be approximately 1000ms (allowing for RAF timing variations)
      expect(diff).toBeGreaterThanOrEqual(900);
      expect(diff).toBeLessThanOrEqual(1100);
    });

    it('DoD: Does Timer count backwards for countdown?', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      const initialRemaining = engine.getState().remaining;
      
      await advanceTime(5000);
      
      const remainingAfter5Sec = engine.getState().remaining;
      expect(remainingAfter5Sec).toBeLessThan(initialRemaining);
    });

    it('DoD: Does timer stop on pause button?', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      expect(engine.getState().isRunning).toBe(true);
      expect(engine.getState().isPaused).toBe(false);

      engine.pause();

      expect(engine.getState().isRunning).toBe(false);
      expect(engine.getState().isPaused).toBe(true);
    });

    it('DoD: Does timer stop on stop/reset button?', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      expect(engine.getState().isRunning).toBe(true);

      await advanceTime(2000);
      engine.reset();

      expect(engine.getState().isRunning).toBe(false);
      expect(engine.getState().remaining).toBe(60000);
    });

    it('DoD: Can timer proceed after pause button is clicked a second time (resume)?', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(5000);
      const remainingAtPause = engine.getState().remaining;

      engine.pause();
      await advanceTime(3000); // Wait 3 seconds while paused
      
      // Remaining should not change while paused
      expect(engine.getState().remaining).toBe(remainingAtPause);

      engine.resume();
      expect(engine.getState().isRunning).toBe(true);
      expect(engine.getState().isPaused).toBe(false);

      await advanceTime(2000);
      // Should now be 2 seconds less than when paused
      expect(engine.getState().remaining).toBeLessThan(remainingAtPause);
    });

    it('DoD: Can timer be set back on reset button?', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(10000);
      expect(engine.getState().remaining).toBeLessThan(60000);

      engine.reset();
      
      expect(engine.getState().remaining).toBe(60000);
      expect(engine.getState().isRunning).toBe(false);
      expect(engine.getState().isPaused).toBe(false);
    });

    it('DoD: Is it possible to adjust the timer start value?', () => {
      // This tests that a new engine can be created with different duration
      const config1: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
      };
      const engine1 = new TimerEngine(config1);
      expect(engine1.getState().remaining).toBe(60000);
      engine1.destroy();

      const config2: TimerEngineConfig = {
        type: 'countdown',
        duration: 300000,
      };
      const engine2 = new TimerEngine(config2);
      expect(engine2.getState().remaining).toBe(300000);
      engine2.destroy();
    });

    it('should complete countdown and call onComplete', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 5000,
        onTick,
        onComplete,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(6000);

      expect(engine.getState().remaining).toBe(0);
      expect(engine.getState().isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should track correct elapsed time while running', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      const startedAt = engine.getState().startedAt;
      expect(startedAt).not.toBeNull();

      await advanceTime(3000);

      // Elapsed should be tracked for countdown timers
      expect(engine.getState().elapsed).toBeGreaterThanOrEqual(2900);
    });
  });

  describe('POSITIVE TESTS - Stopwatch Timer', () => {
    it('DoD: Does start button start the stopwatch?', () => {
      const config: TimerEngineConfig = {
        type: 'stopwatch',
        onTick,
      };
      engine = new TimerEngine(config);

      expect(engine.getState().isRunning).toBe(false);
      engine.start();
      expect(engine.getState().isRunning).toBe(true);
    });

    it('DoD: Does Stopwatch count forwards?', async () => {
      const config: TimerEngineConfig = {
        type: 'stopwatch',
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      const initialElapsed = engine.getState().elapsed;
      
      await advanceTime(5000);
      
      const elapsedAfter5Sec = engine.getState().elapsed;
      expect(elapsedAfter5Sec).toBeGreaterThan(initialElapsed);
      expect(elapsedAfter5Sec).toBeGreaterThanOrEqual(4900);
    });

    it('DoD: Does stopwatch stop on pause button?', async () => {
      const config: TimerEngineConfig = {
        type: 'stopwatch',
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(5000);
      const elapsedAtPause = engine.getState().elapsed;

      engine.pause();

      await advanceTime(3000);
      
      // Elapsed should not change while paused
      expect(engine.getState().elapsed).toBe(elapsedAtPause);
    });

    it('DoD: Can stopwatch proceed after resume?', async () => {
      const config: TimerEngineConfig = {
        type: 'stopwatch',
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(3000);
      const elapsedAtPause = engine.getState().elapsed;

      engine.pause();
      engine.resume();

      await advanceTime(2000);

      expect(engine.getState().elapsed).toBeGreaterThan(elapsedAtPause);
    });

    it('DoD: Can stopwatch be reset?', async () => {
      const config: TimerEngineConfig = {
        type: 'stopwatch',
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(10000);
      expect(engine.getState().elapsed).toBeGreaterThan(0);

      engine.reset();

      expect(engine.getState().elapsed).toBe(0);
      expect(engine.getState().isRunning).toBe(false);
    });
  });

  describe('NEGATIVE TESTS', () => {
    it('Negative: Multiple rapid start clicks should not crash or create multiple timers', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);

      // Click start 50 times rapidly
      for (let i = 0; i < 50; i++) {
        engine.start();
      }

      expect(engine.getState().isRunning).toBe(true);
      
      await advanceTime(1000);
      
      // Should still be running normally
      expect(engine.getState().isRunning).toBe(true);
      expect(engine.getState().remaining).toBeLessThan(60000);
    });

    it('Negative: Multiple rapid pause clicks should not crash', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      // Click pause 20 times rapidly
      for (let i = 0; i < 20; i++) {
        engine.pause();
      }

      expect(engine.getState().isPaused).toBe(true);
      expect(engine.getState().isRunning).toBe(false);
    });

    it('Negative: Multiple rapid reset clicks should not crash', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(30000);

      // Click reset 30 times rapidly
      for (let i = 0; i < 30; i++) {
        engine.reset();
      }

      expect(engine.getState().remaining).toBe(60000);
      expect(engine.getState().isRunning).toBe(false);
    });

    it('Negative: Pause before start should not crash', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);

      // Pause before starting
      engine.pause();

      expect(engine.getState().isPaused).toBe(true);
    });

    it('Negative: Resume before start should handle gracefully', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);

      // Resume before starting - should not throw
      expect(() => engine.resume()).not.toThrow();
    });

    it('Negative: Resume without pause should handle gracefully', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      // Resume while already running - should not throw
      expect(() => engine.resume()).not.toThrow();
      expect(engine.getState().isRunning).toBe(true);
    });

    it('Zero duration should not cause infinite loop or crash', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 0,
        onComplete,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(100);

      // Zero duration timer should stop immediately
      expect(engine.getState().remaining).toBe(0);
      expect(engine.getState().isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalled();
    });

    it('Negative: Very large duration should not break', async () => {
      const largeDuration = 24 * 60 * 60 * 1000; // 24 hours
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: largeDuration,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      await advanceTime(5000);

      expect(engine.getState().isRunning).toBe(true);
      expect(engine.getState().remaining).toBeLessThan(largeDuration);
    });

    it('Destroy should clean up without errors', () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      // Destroy multiple times should not throw
      engine.destroy();
      engine.destroy();
      engine.destroy();

      // isRunning should be false after destroy
      expect(engine.getState().isRunning).toBe(false);
    });
  });

  describe('Time Accuracy Tests', () => {
    it('should maintain accuracy over multiple pause/resume cycles', async () => {
      const config: TimerEngineConfig = {
        type: 'countdown',
        duration: 60000,
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      // Run for 2 seconds
      await advanceTime(2000);
      
      // Pause for 3 seconds
      engine.pause();
      await advanceTime(3000);
      
      // Resume and run for 2 more seconds
      engine.resume();
      await advanceTime(2000);
      
      // Total running time should be ~4 seconds
      const remaining = engine.getState().remaining;
      const expectedRemaining = 60000 - 4000; // ~56 seconds
      
      expect(remaining).toBeGreaterThanOrEqual(expectedRemaining - 100);
      expect(remaining).toBeLessThanOrEqual(expectedRemaining + 100);
    });

    it('should not drift significantly over time', async () => {
      const config: TimerEngineConfig = {
        type: 'stopwatch',
        onTick,
      };
      engine = new TimerEngine(config);
      engine.start();

      // Run for 10 simulated seconds
      await advanceTime(10000);

      const elapsed = engine.getState().elapsed;
      
      // Should be within 100ms of expected 10000ms
      expect(elapsed).toBeGreaterThanOrEqual(9900);
      expect(elapsed).toBeLessThanOrEqual(10100);
    });
  });
});

describe('formatTime', () => {
  it('should format milliseconds to MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5000)).toBe('00:05');
    expect(formatTime(60000)).toBe('01:00');
    expect(formatTime(90000)).toBe('01:30');
  });

  it('should format with hours when showHours is true', () => {
    expect(formatTime(3600000, true)).toBe('01:00:00');
    expect(formatTime(3661000, true)).toBe('01:01:01');
  });

  it('should auto-show hours when >= 1 hour', () => {
    expect(formatTime(3600000)).toBe('01:00:00');
    expect(formatTime(7200000)).toBe('02:00:00');
  });

  it('should handle large values without breaking', () => {
    expect(formatTime(24 * 60 * 60 * 1000)).toBe('24:00:00');
    expect(formatTime(100 * 60 * 60 * 1000)).toBe('100:00:00');
  });
});

describe('formatTimePrecise', () => {
  it('should format with milliseconds', () => {
    expect(formatTimePrecise(0)).toBe('0.00');
    expect(formatTimePrecise(1000)).toBe('1.00');
    expect(formatTimePrecise(1500)).toBe('1.50');
    expect(formatTimePrecise(12345)).toBe('12.34');
  });
});
