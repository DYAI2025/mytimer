/**
 * Throttled Timer Display Hook
 * Reduces re-renders by throttling display updates
 */

import { useState, useEffect, useRef } from 'react';

export function useThrottledTimerDisplay(
  remainingMs: number,
  intervalMs: number = 250
): string {
  const [displayTime, setDisplayTime] = useState(formatTime(remainingMs));
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= intervalMs) {
      lastUpdateRef.current = now;
      setDisplayTime(formatTime(remainingMs));
    }
  }, [remainingMs, intervalMs]);

  return displayTime;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    const hh = hours.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}
