/**
 * Timer Controls Component
 * Start, Pause, Resume, Reset buttons
 */

import { PlayIcon, PauseIcon, ResetIcon } from '@/components/ui/icons';
import styles from './TimerControls.module.css';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerControlsProps) {
  const handlePrimaryAction = () => {
    if (isRunning) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onStart();
    }
  };

  const getPrimaryIcon = () => {
    if (isRunning) return <PauseIcon size={32} />;
    if (isPaused) return <PlayIcon size={32} />;
    return <PlayIcon size={32} />;
  };

  const getPrimaryLabel = () => {
    if (isRunning) return 'Pause';
    if (isPaused) return 'Resume';
    return 'Start';
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={handlePrimaryAction}
        aria-label={getPrimaryLabel()}
      >
        {getPrimaryIcon()}
        <span className={styles.buttonLabel}>{getPrimaryLabel()}</span>
      </button>

      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onReset}
        aria-label="Reset"
      >
        <ResetIcon size={24} />
        <span className={styles.buttonLabel}>Reset</span>
      </button>
    </div>
  );
}
