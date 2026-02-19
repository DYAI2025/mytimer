/**
 * Settings Context - User Preferences
 */

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { audioService } from '@/utils/audio';
import type { UserSettings, TimerTypeId } from '@/types';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  soundEnabled: true,
  soundType: 'chime',
  soundVolume: 0.7,
  notificationsEnabled: true,
  use24HourFormat: false,
  showSeconds: true,
  defaultTimerDurations: {
    countdown: 5 * 60 * 1000,
    stopwatch: 0,
    pomodoro: 25 * 60 * 1000,
    flow: 90 * 60 * 1000,
    deepwork: 120 * 60 * 1000,
  },
  reducedMotion: false,
  lastVisitedTimer: null,
};

const STORAGE_KEY = 'timer-settings-v1';

interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateLastTimer: (timerId: TimerTypeId) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Sync audio service with settings
  useEffect(() => {
    audioService.setVolume(settings.soundVolume);
    audioService.setMuted(!settings.soundEnabled);
    audioService.setSoundType(settings.soundType);
  }, [settings.soundVolume, settings.soundEnabled, settings.soundType]);

  const updateSettings = useMemo(
    () => (updates: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateLastTimer = useMemo(
    () => (timerId: TimerTypeId) => {
      setSettings((prev) => ({ ...prev, lastVisitedTimer: timerId }));
    },
    []
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      updateLastTimer,
    }),
    [settings, updateSettings, updateLastTimer]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
