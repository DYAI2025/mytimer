/**
 * Countdown Timer Page
 */

import { useState, useCallback, useEffect } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSettings } from '@/contexts/SettingsContext';
import { audioService, showNotification, updatePageTitle, vibrateDevice, requestNotificationPermission } from '@/utils/audio';
import { TimerDisplay } from '@/components/shared/TimerDisplay/TimerDisplay';
import { ProgressRing } from '@/components/shared/ProgressRing/ProgressRing';
import { TimerControls } from '@/components/shared/TimerControls/TimerControls';
import { DurationPicker } from '@/components/shared/DurationPicker/DurationPicker';
import styles from './CountdownTimer.module.css';

const PRESETS = [
  { label: '1 min', duration: 60 * 1000 },
  { label: '5 min', duration: 5 * 60 * 1000 },
  { label: '10 min', duration: 10 * 60 * 1000 },
  { label: '15 min', duration: 15 * 60 * 1000 },
  { label: '25 min', duration: 25 * 60 * 1000 },
  { label: '30 min', duration: 30 * 60 * 1000 },
];

export default function CountdownTimer() {
  const { settings } = useSettings();
  const [duration, setDuration] = useState(5 * 60 * 1000);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  const handleTimerComplete = useCallback(() => {
    // Play sound
    if (settings.soundEnabled) {
      audioService.play();
    }

    // Show notification
    if (settings.notificationsEnabled) {
      showNotification(
        'Timer Complete!',
        `Your ${Math.floor(duration / 60000)}-minute countdown has finished.`
      );
    }

    // Update page title
    updatePageTitle('⏰ Timer Complete! - Timer Collection');

    // Vibrate
    vibrateDevice([200, 100, 200]);
  }, [settings, duration]);

  const { state, formattedTime, progress, start, pause, resume, reset } = useTimerEngine({
    type: 'countdown',
    duration,
    onComplete: handleTimerComplete,
  });

  const handlePresetClick = useCallback((newDuration: number) => {
    setDuration(newDuration);
    reset();
  }, [reset]);

  const handleCustomDuration = useCallback((newDuration: number) => {
    setDuration(newDuration);
    reset();
  }, [reset]);

  // Request notification permission on first start
  const handleStart = useCallback(() => {
    if (!hasRequestedPermission && settings.notificationsEnabled) {
      requestNotificationPermission();
      setHasRequestedPermission(true);
    }
    start();
  }, [start, hasRequestedPermission, settings.notificationsEnabled]);

  // Update timer when duration changes externally
  useEffect(() => {
    if (!state.isRunning && !state.isPaused) {
      reset();
    }
  }, [duration, state.isRunning, state.isPaused, reset]);

  // Keyboard shortcuts
  const handleStartPause = useCallback(() => {
    if (state.isRunning) {
      pause();
    } else if (state.isPaused) {
      resume();
    } else {
      handleStart();
    }
  }, [state.isRunning, state.isPaused, handleStart, pause, resume]);

  useKeyboardShortcuts({
    onStartPause: handleStartPause,
    onReset: reset,
  });

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Countdown Timer</h1>
        <p className={styles.subtitle}>Set a time and stay focused</p>

        <div className={styles.timerContainer}>
          <div className={styles.progressRing}>
            <ProgressRing progress={progress} size={320} strokeWidth={8} />
            <div className={styles.displayOverlay}>
              <TimerDisplay
                time={formattedTime}
                isRunning={state.isRunning}
              />
            </div>
          </div>
        </div>

        <TimerControls
          isRunning={state.isRunning}
          isPaused={state.isPaused}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onReset={reset}
        />

        <div className={styles.presets}>
          <span className="label">Quick Presets</span>
          <div className={styles.presetButtons}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className={`${styles.presetBtn} ${duration === preset.duration ? styles.active : ''}`}
                onClick={() => handlePresetClick(preset.duration)}
                aria-label={`Set ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
            <button
              className={styles.customBtn}
              onClick={() => setPickerOpen(true)}
              aria-label="Set custom duration"
            >
              Custom
            </button>
          </div>
        </div>

        <DurationPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onConfirm={handleCustomDuration}
          initialDuration={duration}
        />
      </div>
    </div>
  );
}
