/**
 * Time Since Timer
 * Track elapsed time since an event
 */

import { useState, useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { PlayIcon, PauseIcon, ResetIcon, FlagIcon } from '@/components/ui/icons';
import styles from './TimeSince.module.css';

interface Lap {
  id: number;
  time: number;
  label: string;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  const mss = milliseconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hh}:${mm}:${ss}.${mss}`;
  }
  return `${mm}:${ss}.${mss}`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

export default function TimeSince() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lapCount, setLapCount] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (startTime) {
        setElapsed(Date.now() - startTime);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = useCallback(() => {
    if (!isRunning) {
      const now = Date.now();
      setStartTime(now - elapsed);
      setIsRunning(true);
    }
  }, [isRunning, elapsed]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
    setLaps([]);
    setLapCount(0);
  }, []);

  const handleLap = useCallback(() => {
    if (isRunning) {
      setLapCount(c => c + 1);
      setLaps(prev => [
        { id: lapCount + 1, time: elapsed, label: `Lap ${lapCount + 1}` },
        ...prev
      ]);
    }
  }, [isRunning, elapsed, lapCount]);

  // Keyboard shortcuts
  const handleStartPause = useCallback(() => {
    if (isRunning) {
      handlePause();
    } else {
      handleStart();
    }
  }, [isRunning, handleStart, handlePause]);

  useKeyboardShortcuts({
    onStartPause: handleStartPause,
    onReset: handleReset,
    onLap: handleLap,
  });

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Time Since</h1>
        <p className={styles.subtitle}>Track elapsed time since an event started</p>

        <div className={styles.display}>
          <div className={styles.time}>{formatElapsed(elapsed)}</div>
          <div className={styles.duration}>{formatDuration(elapsed)}</div>
        </div>

        <div className={styles.controls}>
          {!isRunning ? (
            <button className={`${styles.button} ${styles.primary}`} onClick={handleStart}>
              <PlayIcon size={24} />
              <span>Start</span>
            </button>
          ) : (
            <button className={`${styles.button} ${styles.primary}`} onClick={handlePause}>
              <PauseIcon size={24} />
              <span>Pause</span>
            </button>
          )}

          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={handleLap}
            disabled={!isRunning}
          >
            <FlagIcon size={20} />
            <span>Lap</span>
          </button>

          <button className={`${styles.button} ${styles.secondary}`} onClick={handleReset}>
            <ResetIcon size={20} />
            <span>Reset</span>
          </button>
        </div>

        {laps.length > 0 && (
          <div className={styles.lapsContainer}>
            <h3 className={styles.lapsTitle}>Laps</h3>
            <div className={styles.lapsList}>
              {laps.map((lap, index) => {
                const prevLap = laps[index + 1];
                const lapTime = prevLap ? lap.time - prevLap.time : lap.time;

                return (
                  <div key={lap.id} className={styles.lapItem}>
                    <span className={styles.lapLabel}>{lap.label}</span>
                    <div className={styles.lapTimes}>
                      <span className={styles.lapTotal}>{formatElapsed(lap.time)}</span>
                      <span className={styles.lapSplit}>+{formatDuration(lapTime)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
