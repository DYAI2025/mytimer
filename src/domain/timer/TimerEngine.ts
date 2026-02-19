/**
 * Shared Timer Engine
 * Unified timer logic for all timer types
 */

import type { TimerState, TimerEngineConfig } from '@/types';

export class TimerEngine {
  private rafId: number | null = null;
  private state: TimerState;
  private config: TimerEngineConfig;

  constructor(config: TimerEngineConfig) {
    this.config = config;
    this.state = this.getInitialState();
  }

  private getInitialState(): TimerState {
    return {
      isRunning: false,
      isPaused: false,
      elapsed: 0,
      remaining: this.config.duration || 0,
      startedAt: null,
      pausedAt: null,
      endAt: null,
    };
  }

  start() {
    const now = Date.now();
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.startedAt = now;

    if (this.config.type === 'countdown' && this.config.duration !== undefined) {
      this.state.endAt = now + this.config.duration;
      
      // BUG-002 FIX: Handle zero duration immediately
      if (this.config.duration === 0) {
        this.state.remaining = 0;
        this.state.isRunning = false;
        this.config.onComplete?.();
        return;
      }
    }

    this.tick();
  }

  pause() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.state.isPaused = true;
    this.state.isRunning = false;
    this.state.pausedAt = Date.now();
  }

  resume() {
    if (!this.state.pausedAt) return;

    const pauseDuration = Date.now() - this.state.pausedAt;
    if (this.state.endAt) {
      this.state.endAt += pauseDuration;
    }

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.pausedAt = null;
    this.tick();
  }

  reset() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.state = this.getInitialState();
    this.config.onTick?.(this.state);
  }

  private tick = () => {
    const now = Date.now();

    if (this.config.type === 'countdown' && this.state.endAt) {
      this.state.remaining = Math.max(0, this.state.endAt - now);
      
      // BUG-001 FIX: Track elapsed time for countdown timers
      if (this.state.startedAt) {
        this.state.elapsed = now - this.state.startedAt;
      }

      if (this.state.remaining === 0) {
        this.state.isRunning = false;
        this.config.onComplete?.();
        return;
      }
    } else if (this.config.type === 'stopwatch' && this.state.startedAt) {
      this.state.elapsed = now - this.state.startedAt;
    }

    this.config.onTick?.(this.state);

    if (this.state.isRunning) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  getState(): TimerState {
    return { ...this.state };
  }

  destroy() {
    // BUG-003 FIX: Reset isRunning state when destroying
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.state.isRunning = false;
  }
}

// Utility function to format time for display
export function formatTime(ms: number, showHours = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (showHours || hours > 0) {
    const hh = hours.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

// Utility function to format time with milliseconds
export function formatTimePrecise(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
}
