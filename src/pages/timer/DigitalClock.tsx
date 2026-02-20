/**
 * Digital Clock Page
 * Retro LED display with day strip and info widgets
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MaximizeIcon } from '@/components/ui/icons';
import styles from './DigitalClock.module.css';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
  const dayIndex = now.getDay();

  const showColon = ms < 500;

  let timeStr: string;
  let ampmStr = '';
  if (format24h) {
    const hh = String(h24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    timeStr = `${hh}:${mm}:${ss}`;
  } else {
    const h12 = h24 % 12 || 12;
    ampmStr = h24 < 12 ? 'AM' : 'PM';
    const hh = String(h12).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    timeStr = `${hh}:${mm}:${ss}`;
  }

  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset'
  }).formatToParts(now);
  const offset = offsetParts.find(p => p.type === 'timeZoneName')?.value || '';

  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil(dayOfYear / 7);

  return (
    <div className={`container ${styles.page}`} ref={wrapRef}>
      <div className={styles.content}>
        <h1 className={styles.title}>Digital Clock</h1>

        {/* Day Strip */}
        <div className={styles.dayStrip}>
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`${styles.dayItem} ${i === dayIndex ? styles.active : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className={styles.clockContainer}>
          {/* LED Screen */}
          <div className={styles.screen}>
            <div
              className={styles.time}
              style={{
                textShadow: showColon
                  ? '0 0 10px rgba(0,217,255,0.8), 0 0 30px rgba(0,217,255,0.4), 0 0 60px rgba(0,217,255,0.2)'
                  : '0 0 10px rgba(0,217,255,0.6), 0 0 20px rgba(0,217,255,0.3)'
              }}
            >
              {timeStr}
              {!format24h && <span className={styles.ampm}>{ampmStr}</span>}
            </div>
            <div className={styles.date}>{dateStr}</div>
          </div>
        </div>

        {/* Info Widgets */}
        <div className={styles.widgets}>
          <div className={styles.widget}>
            <span className={styles.widgetLabel}>Week</span>
            <span className={styles.widgetValue}>{weekNumber}</span>
          </div>
          <div className={styles.widget}>
            <span className={styles.widgetLabel}>Day</span>
            <span className={styles.widgetValue}>{dayOfYear}</span>
          </div>
          <div className={styles.widget}>
            <span className={styles.widgetLabel}>TZ</span>
            <span className={styles.widgetValue}>{offset}</span>
          </div>
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
          <span>{tz}</span>
        </div>
      </div>
    </div>
  );
}
