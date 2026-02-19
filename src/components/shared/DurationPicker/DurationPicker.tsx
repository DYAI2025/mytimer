/**
 * Duration Picker Component
 * Custom duration input with hours, minutes, seconds
 */

import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal/Modal';
import styles from './DurationPicker.module.css';

export interface DurationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationMs: number) => void;
  initialDuration?: number;
}

export function DurationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialDuration = 5 * 60 * 1000,
}: DurationPickerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const totalSeconds = Math.floor(initialDuration / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
  }, [isOpen, initialDuration]);

  const handleConfirm = () => {
    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    if (totalMs > 0) {
      onConfirm(totalMs);
      onClose();
    }
  };

  const handleNumberChange = (
    value: string,
    setter: (n: number) => void,
    max: number
  ) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setter(Math.min(num, max));
    } else if (value === '') {
      setter(0);
    }
  };

  const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const isValid = totalMs > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Custom Duration"
      footer={
        <>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Set Duration
          </button>
        </>
      }
    >
      <div className={styles.picker}>
        <div className={styles.inputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="hours" className={styles.label}>Hours</label>
            <input
              id="hours"
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => handleNumberChange(e.target.value, setHours, 23)}
              className={styles.input}
            />
          </div>

          <span className={styles.separator}>:</span>

          <div className={styles.inputGroup}>
            <label htmlFor="minutes" className={styles.label}>Minutes</label>
            <input
              id="minutes"
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => handleNumberChange(e.target.value, setMinutes, 59)}
              className={styles.input}
            />
          </div>

          <span className={styles.separator}>:</span>

          <div className={styles.inputGroup}>
            <label htmlFor="seconds" className={styles.label}>Seconds</label>
            <input
              id="seconds"
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => handleNumberChange(e.target.value, setSeconds, 59)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.preview}>
          <span className={styles.previewLabel}>Total Duration:</span>
          <span className={styles.previewTime}>
            {hours > 0 && `${hours}h `}
            {minutes > 0 && `${minutes}m `}
            {seconds > 0 && `${seconds}s`}
            {totalMs === 0 && '0s'}
          </span>
        </div>

        {!isValid && (
          <p className={styles.error}>Duration must be greater than 0</p>
        )}
      </div>
    </Modal>
  );
}
