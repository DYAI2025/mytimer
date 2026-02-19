/**
 * Timer Context - State Management
 * Uses split context pattern for performance optimization
 */

import { createContext, useContext, useReducer, useMemo } from 'react';
import type { TimerInstance, TimerTypeId } from '@/types';

// State
interface TimerContextState {
  activeTimerId: string | null;
  timers: Record<string, TimerInstance>;
}

const initialState: TimerContextState = {
  activeTimerId: null,
  timers: {},
};

// Actions
type TimerAction =
  | { type: 'TIMER_START'; payload: { timerId: string; duration?: number; type: TimerTypeId } }
  | { type: 'TIMER_PAUSE'; payload: { timerId: string } }
  | { type: 'TIMER_RESUME'; payload: { timerId: string } }
  | { type: 'TIMER_RESET'; payload: { timerId: string } }
  | { type: 'TIMER_COMPLETE'; payload: { timerId: string } }
  | { type: 'TIMER_TICK'; payload: { timerId: string; now: number } }
  | { type: 'TIMER_LAP'; payload: { timerId: string } }
  | { type: 'SET_ACTIVE_TIMER'; payload: { timerId: string | null } }
  | { type: 'RESTORE_STATE'; payload: { state: TimerContextState } }
  | { type: 'SYNC_FROM_STORAGE'; payload: { timers: Record<string, TimerInstance> } };

// Reducer
function timerReducer(state: TimerContextState, action: TimerAction): TimerContextState {
  switch (action.type) {
    case 'TIMER_START': {
      const { timerId, duration, type } = action.payload;
      const existing = state.timers[timerId];
      const now = Date.now();
      const dur = duration ?? existing?.duration ?? 0;

      return {
        ...state,
        activeTimerId: timerId,
        timers: {
          ...state.timers,
          [timerId]: {
            ...existing,
            id: timerId,
            type,
            phase: 'running',
            duration: dur,
            remaining: dur,
            elapsed: 0,
            startedAt: now,
            pausedAt: null,
            endAt: now + dur,
            laps: [],
            currentCycle: existing?.currentCycle ?? 1,
            totalCycles: existing?.totalCycles ?? 1,
            phaseType: existing?.phaseType ?? null,
          },
        },
      };
    }

    case 'TIMER_PAUSE': {
      const { timerId } = action.payload;
      const timer = state.timers[timerId];
      if (!timer || timer.phase !== 'running') return state;

      return {
        ...state,
        timers: {
          ...state.timers,
          [timerId]: {
            ...timer,
            phase: 'paused',
            pausedAt: Date.now(),
          },
        },
      };
    }

    case 'TIMER_RESUME': {
      const { timerId } = action.payload;
      const timer = state.timers[timerId];
      if (!timer || timer.phase !== 'paused' || !timer.pausedAt) return state;

      const pauseDuration = Date.now() - timer.pausedAt;

      return {
        ...state,
        timers: {
          ...state.timers,
          [timerId]: {
            ...timer,
            phase: 'running',
            pausedAt: null,
            endAt: timer.endAt ? timer.endAt + pauseDuration : null,
          },
        },
      };
    }

    case 'TIMER_TICK': {
      const { timerId, now } = action.payload;
      const timer = state.timers[timerId];
      if (!timer || timer.phase !== 'running') return state;

      const remaining = timer.endAt ? Math.max(0, timer.endAt - now) : 0;
      const elapsed = timer.startedAt ? now - timer.startedAt : 0;

      if (remaining === 0 && timer.endAt) {
        return {
          ...state,
          timers: {
            ...state.timers,
            [timerId]: { ...timer, phase: 'complete', remaining: 0, elapsed },
          },
        };
      }

      return {
        ...state,
        timers: {
          ...state.timers,
          [timerId]: { ...timer, remaining, elapsed },
        },
      };
    }

    case 'TIMER_RESET': {
      const { timerId } = action.payload;
      const timer = state.timers[timerId];
      if (!timer) return state;

      return {
        ...state,
        activeTimerId: state.activeTimerId === timerId ? null : state.activeTimerId,
        timers: {
          ...state.timers,
          [timerId]: {
            ...timer,
            phase: 'idle',
            remaining: timer.duration,
            elapsed: 0,
            startedAt: null,
            pausedAt: null,
            endAt: null,
            laps: [],
            currentCycle: 1,
          },
        },
      };
    }

    case 'TIMER_COMPLETE': {
      const { timerId } = action.payload;
      const timer = state.timers[timerId];
      if (!timer) return state;

      return {
        ...state,
        timers: {
          ...state.timers,
          [timerId]: { ...timer, phase: 'complete', remaining: 0 },
        },
      };
    }

    case 'TIMER_LAP': {
      const { timerId } = action.payload;
      const timer = state.timers[timerId];
      if (!timer || timer.phase !== 'running') return state;

      return {
        ...state,
        timers: {
          ...state.timers,
          [timerId]: { ...timer, laps: [...timer.laps, timer.elapsed] },
        },
      };
    }

    case 'SET_ACTIVE_TIMER': {
      return { ...state, activeTimerId: action.payload.timerId };
    }

    case 'RESTORE_STATE': {
      return action.payload.state;
    }

    case 'SYNC_FROM_STORAGE': {
      return { ...state, timers: { ...state.timers, ...action.payload.timers } };
    }

    default:
      return state;
  }
}

// Contexts
const TimerStateContext = createContext<TimerContextState | null>(null);
const TimerDispatchContext = createContext<React.Dispatch<TimerAction> | null>(null);

// Provider
export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  return (
    <TimerDispatchContext.Provider value={dispatch}>
      <TimerStateContext.Provider value={state}>
        {children}
      </TimerStateContext.Provider>
    </TimerDispatchContext.Provider>
  );
}

// Hooks
export function useTimerState(): TimerContextState {
  const ctx = useContext(TimerStateContext);
  if (!ctx) throw new Error('useTimerState must be used within TimerProvider');
  return ctx;
}

export function useTimerDispatch(): React.Dispatch<TimerAction> {
  const ctx = useContext(TimerDispatchContext);
  if (!ctx) throw new Error('useTimerDispatch must be used within TimerProvider');
  return ctx;
}

// Selector hooks with memoization
export function useTimerById(timerId: string): TimerInstance | undefined {
  const state = useTimerState();
  return useMemo(() => state.timers[timerId], [state.timers, timerId]);
}

export function useActiveTimer(): TimerInstance | null {
  const state = useTimerState();
  return useMemo(() => {
    if (!state.activeTimerId) return null;
    return state.timers[state.activeTimerId] ?? null;
  }, [state.activeTimerId, state.timers]);
}

export function useTimerProgress(timerId: string): number {
  const timer = useTimerById(timerId);
  return useMemo(() => {
    if (!timer || timer.duration === 0) return 0;
    return 1 - timer.remaining / timer.duration;
  }, [timer?.remaining, timer?.duration]);
}

// Action hook
export function useTimerActions() {
  const dispatch = useTimerDispatch();

  return useMemo(
    () => ({
      start: (timerId: string, type: TimerTypeId, duration?: number) =>
        dispatch({ type: 'TIMER_START', payload: { timerId, duration, type } }),
      pause: (timerId: string) => dispatch({ type: 'TIMER_PAUSE', payload: { timerId } }),
      resume: (timerId: string) => dispatch({ type: 'TIMER_RESUME', payload: { timerId } }),
      reset: (timerId: string) => dispatch({ type: 'TIMER_RESET', payload: { timerId } }),
      complete: (timerId: string) => dispatch({ type: 'TIMER_COMPLETE', payload: { timerId } }),
      recordLap: (timerId: string) => dispatch({ type: 'TIMER_LAP', payload: { timerId } }),
      tick: (timerId: string, now: number) =>
        dispatch({ type: 'TIMER_TICK', payload: { timerId, now } }),
      setActive: (timerId: string | null) =>
        dispatch({ type: 'SET_ACTIVE_TIMER', payload: { timerId } }),
      restoreState: (state: TimerContextState) =>
        dispatch({ type: 'RESTORE_STATE', payload: { state } }),
      syncFromStorage: (timers: Record<string, TimerInstance>) =>
        dispatch({ type: 'SYNC_FROM_STORAGE', payload: { timers } }),
    }),
    [dispatch]
  );
}
