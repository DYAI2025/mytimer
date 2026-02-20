/**
 * Stopwatch Timer Page
 * Classic stopwatch design with crown and red sweep
 */

import { useState, useCallback } from 'react';
import { formatTime } from '@/domain/timer/TimerEngine';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { PlayIcon, PauseIcon, FlagIcon, RotateCcwIcon } from '@/components/ui/icons';
import styles from './StopwatchTimer.module.css';

export default function StopwatchTimer() {
  const [laps, setLaps] = useState<number[]>([]);
  const { state, formattedTime, start, pause, resume, reset } = useTimerEngine({
    type: 'stopwatch',
  });

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
  }, [resume]);

  const handleLap = useCallback(() => {
    if (state.isRunning) {
      setLaps((prev) => [state.elapsed, ...prev]);
    }
  }, [state.isRunning, state.elapsed]);

  const handleReset = useCallback(() => {
    reset();
    setLaps([]);
  }, [reset]);

  // Keyboard shortcuts
  const handleStartPause = useCallback(() => {
    if (state.isRunning) {
      pause();
    } else if (state.isPaused) {
      resume();
    } else {
      start();
    }
  }, [state.isRunning, state.isPaused, start, pause, resume]);

  useKeyboardShortcuts({
    onStartPause: handleStartPause,
    onReset: handleReset,
    onLap: handleLap,
  });

  // Split formatted time into main and ms parts
  const timeParts = formattedTime.split('.');
  const mainTime = timeParts[0];
  const msTime = timeParts[1] || '00';

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Stopwatch</h1>
        <p className={styles.subtitle}>Track elapsed time with precision</p>

        <div className={styles.timerContainer}>
          {/* Decorative Crown */}
          <div className={styles.crown}>
            <div className={styles.crownBtn} />
          </div>

          {/* Watch Face */}
          <div className={`${styles.watchFace} ${state.isRunning ? styles.running : ''}`}>
            <div className={styles.displayInner}>
              <div className={styles.timeMain}>{mainTime}</div>
              <div className={styles.timeMs}>.{msTime}</div>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          {!state.isRunning && !state.isPaused && (
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleStart}
              aria-label="Start"
            >
              <PlayIcon size={32} />
              <span>Start</span>
            </button>
          )}

          {state.isRunning && (
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handlePause}
              aria-label="Pause"
            >
              <PauseIcon size={32} />
              <span>Pause</span>
            </button>
          )}

          {state.isPaused && (
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleResume}
              aria-label="Resume"
            >
              <PlayIcon size={32} />
              <span>Resume</span>
            </button>
          )}

          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={handleLap}
            disabled={!state.isRunning}
            aria-label="Lap"
          >
            <FlagIcon size={24} />
            <span>Lap</span>
          </button>

          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={handleReset}
            aria-label="Reset"
          >
            <RotateCcwIcon size={24} />
            <span>Reset</span>
          </button>
        </div>

        {laps.length > 0 && (
          <div className={styles.lapsContainer}>
            <h3 className={styles.lapsTitle}>Lap Times</h3>
            <div className={styles.lapsList}>
              {laps.map((lap, index) => (
                <div key={index} className={styles.lapItem}>
                  <span className={styles.lapNumber}>Lap {laps.length - index}</span>
                  <span className={styles.lapTime}>{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
