/**
 * Digital Clock Page
 * Current time display with 12/24h format
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MaximizeIcon } from '@/components/ui/icons';
import styles from './DigitalClock.module.css';

export default function DigitalClockTimer() {
  const [format24h, setFormat24h] = useState(true);
  const [now, setNow] = useState(new Date());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(interval);
  }, []);

  const full = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      el.requestFullscreen?.().catch(() => { });
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        full();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [full]);

  const h24 = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();

  let timeStr: string;
  if (format24h) {
    timeStr = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  } else {
    const h12 = h24 % 12 || 12;
    const ampm = h24 < 12 ? 'AM' : 'PM';
    timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
  }

  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now);

  // Calculate milliseconds progress for subtle animation
  const msProgress = ms / 1000;

  return (
    <div className={`container ${styles.page}`} ref={wrapRef}>
      <div className={styles.content}>
        <h1 className={styles.title}>Digital Clock</h1>

        <div className={styles.clockContainer}>
          <div
            className={styles.time}
            style={{
              textShadow: `0 0 ${20 + msProgress * 20}px rgba(0, 217, 255, ${0.3 + msProgress * 0.2})`
            }}
          >
            {timeStr}
          </div>
          <div className={styles.date}>{dateStr}</div>
        </div>

        <div className={styles.controls}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={format24h}
              onChange={(e) => setFormat24h(e.target.checked)}
            />
            <span>24h format</span>
          </label>
          <button className={styles.fullscreenBtn} onClick={full}>
            <MaximizeIcon size={20} />
            <span>Fullscreen (F)</span>
          </button>
        </div>

        <div className={styles.timezone}>
          <span>Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>
    </div>
  );
}
