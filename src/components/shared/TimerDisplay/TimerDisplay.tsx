/**
 * Timer Display Component
 * Large monospaced display with glow effect
 */

import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  time: string;
  label?: string;
  isRunning?: boolean;
}

export function TimerDisplay({ time, label, isRunning = false }: TimerDisplayProps) {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.display} ${isRunning ? styles.running : ''}`}
        role="timer"
        aria-label={label || 'Timer'}
        aria-live="off"
      >
        {time}
      </div>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
}
