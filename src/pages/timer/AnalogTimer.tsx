/**
 * Analog Countdown Timer
 * Canvas-based analog clock with progress rings
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon, ResetIcon, MaximizeIcon } from '@/components/ui/icons';
import styles from './AnalogTimer.module.css';

const MAX_DURATION = 4 * 3600 * 1000; // 4 hours max

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function beep(ms = 300, f = 880) {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = f;
    o.type = 'sine';
    o.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000);
    o.start();
    o.stop(ac.currentTime + ms / 1000 + 0.05);
  } catch {
    // Audio not available
  }
}

function drawHand(ctx: CanvasRenderingContext2D, len: number, ang: number, w: number, col: string, withShadow = false) {
  ctx.save();
  ctx.rotate(ang);

  if (withShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  ctx.beginPath();
  ctx.moveTo(-len * 0.2, 0);
  ctx.lineTo(-len * 0.05, -w * 0.8);
  ctx.lineTo(len * 0.95, -w * 0.3);
  ctx.lineTo(len, 0);
  ctx.lineTo(len * 0.95, w * 0.3);
  ctx.lineTo(-len * 0.05, w * 0.8);
  ctx.closePath();

  ctx.fillStyle = col;
  ctx.fill();
  ctx.restore();
}

interface TimerState {
  durationMs: number;
  remainingMs: number;
  running: boolean;
  endAt: number | null;
}

export default function AnalogTimer() {
  const [state, setState] = useState<TimerState>({
    durationMs: 5 * 60 * 1000,
    remainingMs: 5 * 60 * 1000,
    running: false,
    endAt: null,
  });
  const [customMinutes, setCustomMinutes] = useState('');
  const cnvRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Sync timer
  const sync = useCallback(() => {
    if (!state.running || !state.endAt) return;
    const now = Date.now();
    const rem = Math.max(0, state.endAt - now);
    const currentSeconds = Math.floor(state.remainingMs / 1000);
    const newSeconds = Math.floor(rem / 1000);
    if (newSeconds !== currentSeconds) {
      setState(s => ({ ...s, remainingMs: rem }));
    }
  }, [state.running, state.endAt, state.remainingMs]);

  // Animation loop
  useEffect(() => {
    const loop = () => {
      sync();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sync]);

  // Completion check
  useEffect(() => {
    if (state.running && state.remainingMs <= 0) {
      setState(s => ({ ...s, running: false, endAt: null, remainingMs: 0 }));
      beep(400, 660);
      setTimeout(() => beep(200, 880), 250);
      setTimeout(() => beep(200, 880), 500);
    }
  }, [state.remainingMs, state.running]);

  // Draw clock
  useEffect(() => {
    const cnv = cnvRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const resize = () => {
      const r = cnv.getBoundingClientRect();
      cnv.width = Math.floor(r.width * dpr);
      cnv.height = Math.floor(r.height * dpr);
      draw(ctx, cnv.width, cnv.height, state);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cnv);
    return () => ro.disconnect();
  }, [state]);

  function draw(ctx: CanvasRenderingContext2D, w: number, h: number, st: TimerState) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.4;

    ctx.clearRect(0, 0, w, h);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
    ctx.lineWidth = r * 0.08;
    ctx.stroke();

    // Main clock face background
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 22, 40, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
    ctx.lineWidth = Math.max(2, r * 0.02);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);

    // Hour numbers
    const hourNumbers = [12, 3, 6, 9];
    ctx.fillStyle = '#E2E8F0';
    ctx.font = `bold ${Math.floor(r * 0.12)}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    hourNumbers.forEach(num => {
      const angle = ((num === 12 ? 0 : num) / 12) * Math.PI * 2 - Math.PI / 2;
      const dist = r * 0.7;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      ctx.fillText(num.toString(), x, y);
    });

    // Minute ticks
    for (let i = 0; i < 60; i++) {
      if (i % 15 === 0) continue;
      const a = i / 60 * Math.PI * 2 - Math.PI / 2;
      const isHourMark = i % 5 === 0;
      const len = isHourMark ? r * 0.08 : r * 0.04;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - len), Math.sin(a) * (r - len));
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.strokeStyle = isHourMark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = isHourMark ? 2 : 1;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Progress rings
    if (st.remainingMs > 0) {
      const remainingSeconds = Math.floor(st.remainingMs / 1000);
      const totalHours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const minuteProgress = minutes / 60;
      const minuteAngle = minuteProgress * Math.PI * 2;
      const hue = minuteProgress * 120;
      const ringColor = `hsl(${hue}, 70%, 50%)`;
      const ringWidth = r * 0.1;
      const baseRadius = r * 0.92;

      // Completed hour rings
      for (let h = 0; h < totalHours; h++) {
        const ringRadius = baseRadius - (h * ringWidth * 1.1);
        const ringHue = 120 - (h * 30);
        ctx.beginPath();
        ctx.strokeStyle = `hsl(${Math.max(0, ringHue)}, 70%, 50%)`;
        ctx.lineWidth = ringWidth;
        ctx.lineCap = 'round';
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2, false);
        ctx.stroke();
      }

      // Current hour progress arc
      const currentRingRadius = baseRadius - (totalHours * ringWidth * 1.1);
      ctx.beginPath();
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = ringWidth;
      ctx.lineCap = 'round';
      ctx.arc(0, 0, currentRingRadius, -Math.PI / 2, -Math.PI / 2 + minuteAngle, false);
      ctx.stroke();
    }

    // Hands
    const totalSeconds = Math.floor(st.remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalHoursWithMinutes = hours + minutes / 60;
    const hrs = totalHoursWithMinutes / 12;
    const mins = minutes / 60;
    const secs = seconds / 60;

    drawHand(ctx, r * 0.5, hrs * Math.PI * 2 - Math.PI / 2, r * 0.035, '#E2E8F0', true);
    drawHand(ctx, r * 0.72, mins * Math.PI * 2 - Math.PI / 2, r * 0.025, '#00D9FF', true);
    drawHand(ctx, r * 0.82, secs * Math.PI * 2 - Math.PI / 2, r * 0.012, '#EF4444', false);

    // Center cap
    ctx.beginPath();
    ctx.fillStyle = '#00D9FF';
    ctx.arc(0, 0, Math.max(4, r * 0.04), 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#0A1628';
    ctx.arc(0, 0, Math.max(2, r * 0.02), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const start = useCallback(() => {
    if (state.remainingMs <= 0) {
      setState(s => ({ ...s, remainingMs: s.durationMs, running: true, endAt: Date.now() + s.durationMs }));
    } else {
      setState(s => ({ ...s, running: true, endAt: Date.now() + s.remainingMs }));
    }
  }, [state.remainingMs, state.durationMs]);

  const pause = useCallback(() => setState(s => ({ ...s, running: false, endAt: null })), []);
  const reset = useCallback(() => setState(s => ({ ...s, running: false, endAt: null, remainingMs: s.durationMs })), []);

  const plus = useCallback((ms: number) => setState(s => {
    const base = s.running ? Math.max(0, (s.endAt ?? Date.now()) - Date.now()) : s.remainingMs;
    const next = clamp(base + ms, 0, MAX_DURATION);
    return s.running ? { ...s, remainingMs: next, endAt: Date.now() + next } : { ...s, remainingMs: next };
  }), []);

  const setDur = useCallback((ms: number) => setState(s => ({
    ...s, durationMs: clamp(ms, 1000, MAX_DURATION), remainingMs: clamp(ms, 1000, MAX_DURATION), running: false, endAt: null
  })), []);

  const handleCustomMinutes = useCallback(() => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 180) {
      setDur(minutes * 60 * 1000);
      setCustomMinutes('');
    }
  }, [customMinutes, setDur]);

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
    const on = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        state.running ? pause() : start();
      } else if (e.key.toLowerCase() === 'r') {
        reset();
      } else if (e.key.toLowerCase() === 'f') {
        full();
      } else if (e.key === 'ArrowUp') {
        plus(10 * 1000);
      } else if (e.key === 'ArrowDown') {
        plus(-10 * 1000);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [start, pause, reset, plus, full, state.running]);

  return (
    <div className={`container ${styles.page}`} ref={wrapRef}>
      <div className={styles.content}>
        <h1 className={styles.title}>Analog Countdown</h1>

        <div className={styles.timeDisplay} aria-live="polite">
          <div className={styles.hms}>{formatTime(state.remainingMs)}</div>
          <div className={styles.meta}>
            <span>Duration: {formatTime(state.durationMs)}</span>
            <span>{state.running ? 'Running' : 'Paused'}</span>
          </div>
        </div>

        <div className={styles.canvasContainer}>
          <canvas ref={cnvRef} className={styles.canvas} width={600} height={600} />
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={state.running ? pause : start}
          >
            {state.running ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
            <span>{state.running ? 'Pause' : 'Start'}</span>
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={reset}>
            <ResetIcon size={20} />
            <span>Reset</span>
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={full}>
            <MaximizeIcon size={20} />
            <span>Fullscreen</span>
          </button>
        </div>

        <div className={styles.presets}>
          {[5, 10, 15, 20, 25, 30].map(m => (
            <button key={m} className={styles.presetBtn} onClick={() => setDur(m * 60 * 1000)}>
              {m}m
            </button>
          ))}
        </div>

        <div className={styles.adjustments}>
          {[[1, 60], [-1, 60], [5, 300], [-5, 300], [10, 600], [-10, 600]].map(([label, ms]) => (
            <button key={label} className={styles.adjustBtn} onClick={() => plus(label * ms * 1000)}>
              {label > 0 ? `+${label}m` : `${label}m`}
            </button>
          ))}
        </div>

        <div className={styles.customInput}>
          <label>Custom Timer (1-180 min):</label>
          <div className={styles.inputGroup}>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomMinutes()}
              placeholder="Enter minutes"
              disabled={state.running}
            />
            <button onClick={handleCustomMinutes} disabled={state.running || !customMinutes}>
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
