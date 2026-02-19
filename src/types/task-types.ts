/* Task Management Types */

import type { TimerTypeId } from './timer-types';

export interface Task {
  id: string;
  name: string;
  createdAt: number;
  completedAt: number | null;
  timerType: TimerTypeId;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isArchived: boolean;
}

export interface TaskContextState {
  tasks: Task[];
  activeTaskId: string | null;
  streakDays: number;
  lastActiveDate: string;
  totalCompletedSessions: number;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  soundType: 'chime' | 'bell' | 'beep' | 'custom';
  soundVolume: number;
  notificationsEnabled: boolean;
  use24HourFormat: boolean;
  showSeconds: boolean;
  defaultTimerDurations: Record<string, number>;
  reducedMotion: boolean;
  lastVisitedTimer: TimerTypeId | null;
}
