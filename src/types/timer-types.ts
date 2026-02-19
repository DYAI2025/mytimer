/* Timer Type Definitions */

export type TimerTypeId =
  | 'countdown'
  | 'stopwatch'
  | 'analog'
  | 'timesince'
  | 'digital'
  | 'pomodoro'
  | 'flow'
  | 'deepwork'
  | 'sprint'
  | 'meeting'
  | 'meditation'
  | 'breathing'
  | 'nap'
  | 'micro'
  | 'cooking'
  | 'interval'
  | 'reading'
  | 'chess'
  | 'couples'
  | 'metronome'
  | 'world'
  | 'alarm';

export type TimerPhase = 'idle' | 'running' | 'paused' | 'complete';

export type TimerCategory =
  | 'core'
  | 'productivity'
  | 'wellness'
  | 'activity'
  | 'specialty';

export interface TimerInstance {
  id: string;
  type: TimerTypeId;
  phase: TimerPhase;
  duration: number;
  remaining: number;
  elapsed: number;
  startedAt: number | null;
  pausedAt: number | null;
  endAt: number | null;
  laps: number[];
  currentCycle: number;
  totalCycles: number;
  phaseType: 'work' | 'break' | 'longBreak' | null;
}

export interface TimerTypeConfig {
  id: TimerTypeId;
  label: string;
  description: string;
  category: TimerCategory;
  defaultDuration: number;
  icon: string;
  features: string[];
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;
  remaining: number;
  startedAt: number | null;
  pausedAt: number | null;
  endAt: number | null;
}

export interface TimerEngineConfig {
  type: 'countdown' | 'stopwatch' | 'interval';
  duration?: number;
  onTick?: (state: TimerState) => void;
  onComplete?: () => void;
  onPhaseChange?: (phase: string) => void;
}

// Timer Catalog
export const TIMER_CATALOG: TimerTypeConfig[] = [
  // Core Timers
  {
    id: 'countdown',
    label: 'Countdown',
    description: 'Simple countdown timer with presets',
    category: 'core',
    defaultDuration: 5 * 60 * 1000,
    icon: 'Timer',
    features: ['presets', 'progress-ring', 'custom-duration'],
  },
  {
    id: 'stopwatch',
    label: 'Stopwatch',
    description: 'Track elapsed time with lap recording',
    category: 'core',
    defaultDuration: 0,
    icon: 'Clock',
    features: ['laps', 'split-times'],
  },
  {
    id: 'analog',
    label: 'Analog Clock',
    description: 'Visual countdown with animated clock face',
    category: 'core',
    defaultDuration: 5 * 60 * 1000,
    icon: 'Clock',
    features: ['canvas', 'animated-hands'],
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    description: '25-minute focus sessions with breaks',
    category: 'productivity',
    defaultDuration: 25 * 60 * 1000,
    icon: 'Timer',
    features: ['cycles', 'breaks', 'streaks'],
  },
  {
    id: 'breathing',
    label: 'Breathing',
    description: 'Guided breathing exercises',
    category: 'wellness',
    defaultDuration: 4 * 60 * 1000,
    icon: 'Wind',
    features: ['visual-guide', '4-7-8', 'box'],
  },
];
