/**
 * Cooking Timer
 * Multiple simultaneous timers for cooking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlusIcon, PlayIcon, PauseIcon, RotateCcwIcon, XIcon, ChefHatIcon } from '@/components/ui/icons';
import styles from './CookingTimer.module.css';

interface CookingTimerItem {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  running: boolean;
  startedAt: number | null;
  color: string;
}

const PRESETS = [
  { name: 'Soft Boiled Egg', duration: 6 * 60, emoji: '🥚' },
  { name: 'Hard Boiled Egg', duration: 10 * 60, emoji: '🥚' },
  { name: 'Pasta Al Dente', duration: 8 * 60, emoji: '🍝' },
  { name: 'Rice', duration: 18 * 60, emoji: '🍚' },
  { name: 'Steak Medium', duration: 4 * 60, emoji: '🥩' },
  { name: 'Tea', duration: 3 * 60, emoji: '🍵' },
  { name: 'Coffee', duration: 4 * 60, emoji: '☕' },
];

const COLORS = ['#00D9FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function beep() {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = 880;
    o.type = 'sine';
    o.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.3);
    o.start();
    o.stop(ac.currentTime + 0.3);
  } catch { }
}

export default function CookingTimer() {
  const [timers, setTimers] = useState<CookingTimerItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      setTimers(prev => prev.map(timer => {
        if (!timer.running || !timer.startedAt) return timer;
        const elapsed = Math.floor((now - timer.startedAt) / 1000);
        const remaining = Math.max(0, timer.duration - elapsed);
        if (remaining === 0 && timer.remaining > 0) {
          beep();
        }
        return { ...timer, remaining };
      }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const addTimer = useCallback((name: string, durationSeconds: number) => {
    const newTimer: CookingTimerItem = {
      id: Date.now().toString(),
      name,
      duration: durationSeconds,
      remaining: durationSeconds,
      running: false,
      startedAt: null,
      color: COLORS[colorIndex % COLORS.length],
    };
    setTimers(prev => [...prev, newTimer]);
    setColorIndex(prev => prev + 1);
  }, [colorIndex]);

  const addCustomTimer = useCallback(() => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      addTimer(customName || `Timer ${timers.length + 1}`, mins * 60);
      setCustomName('');
      setCustomMinutes('');
    }
  }, [customMinutes, customName, timers.length, addTimer]);

  const toggleTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id !== id) return timer;
      if (timer.running) {
        return { ...timer, running: false, startedAt: null };
      } else {
        if (timer.remaining === 0) {
          return { ...timer, remaining: timer.duration, running: true, startedAt: Date.now() };
        }
        return { ...timer, running: true, startedAt: Date.now() - (timer.duration - timer.remaining) * 1000 };
      }
    }));
  }, []);

  const resetTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === id ? { ...timer, remaining: timer.duration, running: false, startedAt: null } : timer
    ));
  }, []);

  const removeTimer = useCallback((id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <ChefHatIcon size={28} />
          Cooking Timer
        </h1>

        {/* Presets */}
        <div className={styles.presets}>
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              className={styles.presetBtn}
              onClick={() => addTimer(preset.name, preset.duration)}
            >
              <span>{preset.emoji}</span>
              {preset.name}
            </button>
          ))}
        </div>

        {/* Custom Timer Input */}
        <div className={styles.customInput}>
          <input
            type="text"
            placeholder="Name (e.g., Roast)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className={styles.nameInput}
          />
          <input
            type="number"
            placeholder="Min"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            min="1"
            className={styles.minuteInput}
          />
          <button
            className={styles.addBtn}
            onClick={addCustomTimer}
            disabled={!customMinutes}
          >
            <PlusIcon size={18} />
          </button>
        </div>

        {/* Timers Grid */}
        {timers.length > 0 && (
          <div className={styles.timersGrid}>
            {timers.map(timer => {
              const progress = timer.duration > 0 ? (timer.duration - timer.remaining) / timer.duration : 0;
              const isDone = timer.remaining === 0;

              const circumference = 2 * Math.PI * 42;
              const dashOffset = circumference * (1 - progress);

              return (
                <div
                  key={timer.id}
                  className={`${styles.timerCard} ${isDone ? styles.done : ''}`}
                  style={{ '--timer-color': timer.color } as React.CSSProperties}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.timerName}>{timer.name}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeTimer(timer.id)}
                      aria-label={`Remove ${timer.name}`}
                    >
                      <XIcon size={16} />
                    </button>
                  </div>

                  {/* Circular Progress Ring */}
                  <div className={styles.progressBar}>
                    <svg className={styles.progressRingSvg} viewBox="0 0 100 100">
                      <circle className={styles.progressTrack} cx="50" cy="50" r="42" />
                      <circle
                        className={styles.progressArc}
                        cx="50"
                        cy="50"
                        r="42"
                        style={{
                          strokeDasharray: `${circumference}`,
                          strokeDashoffset: `${dashOffset}`,
                        }}
                      />
                    </svg>
                  </div>

                  <div className={styles.time}>{formatTime(timer.remaining)}</div>

                  <div className={styles.cardControls}>
                    <button
                      className={styles.controlBtn}
                      onClick={() => toggleTimer(timer.id)}
                    >
                      {timer.running ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
                    </button>
                    <button
                      className={styles.controlBtn}
                      onClick={() => resetTimer(timer.id)}
                    >
                      <RotateCcwIcon size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {timers.length === 0 && (
          <div className={styles.empty}>
            <p>No timers yet.</p>
            <p>Select a preset or add a custom timer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
