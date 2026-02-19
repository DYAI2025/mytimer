/**
 * Countdown Timer Page
 */

import { useState, useCallback, useEffect } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/shared/TimerDisplay/TimerDisplay';
import { ProgressRing } from '@/components/shared/ProgressRing/ProgressRing';
import { TimerControls } from '@/components/shared/TimerControls/TimerControls';
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
  const [duration, setDuration] = useState(5 * 60 * 1000);
  const { state, formattedTime, progress, start, pause, resume, reset } = useTimerEngine({
    type: 'countdown',
    duration,
  });

  const handlePresetClick = useCallback((newDuration: number) => {
    setDuration(newDuration);
    reset();
  }, [reset]);

  // Update timer when duration changes externally
  useEffect(() => {
    if (!state.isRunning && !state.isPaused) {
      reset();
    }
  }, [duration, state.isRunning, state.isPaused, reset]);

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
          onStart={start}
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
          </div>
        </div>
      </div>
    </div>
  );
}
