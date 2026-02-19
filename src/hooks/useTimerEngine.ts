/**
 * React Hook for Timer Engine
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { TimerEngine, formatTime } from '@/domain/timer/TimerEngine';
import type { TimerState, TimerEngineConfig } from '@/types';

export interface UseTimerEngineReturn {
  state: TimerState;
  formattedTime: string;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useTimerEngine(config: TimerEngineConfig): UseTimerEngineReturn {
  const engineRef = useRef<TimerEngine | null>(null);
  const [state, setState] = useState<TimerState>(() => ({
    isRunning: false,
    isPaused: false,
    elapsed: 0,
    remaining: config.duration || 0,
    startedAt: null,
    pausedAt: null,
    endAt: null,
  }));

  useEffect(() => {
    engineRef.current = new TimerEngine({
      ...config,
      onTick: (newState) => {
        setState(newState);
        config.onTick?.(newState);
      },
    });

    return () => engineRef.current?.destroy();
  }, []);

  const start = useCallback(() => engineRef.current?.start(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const reset = useCallback(() => engineRef.current?.reset(), []);

  const formattedTime = useMemo(() => {
    if (config.type === 'countdown') {
      return formatTime(state.remaining);
    }
    return formatTime(state.elapsed);
  }, [state.remaining, state.elapsed, config.type]);

  const progress = useMemo(() => {
    if (config.type !== 'countdown' || !config.duration) return 0;
    if (config.duration === 0) return 0;
    return 1 - state.remaining / config.duration;
  }, [state.remaining, config.duration, config.type]);

  return {
    state,
    formattedTime,
    progress,
    start,
    pause,
    resume,
    reset,
  };
}
