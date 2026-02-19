/**
 * Interval Timer
 * HIIT/Tabata style work/rest cycles
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayIcon, PauseIcon, RotateCcwIcon, DumbbellIcon } from '@/components/ui/icons';
import styles from './IntervalTimer.module.css';

type IntervalPhase = 'warmup' | 'work' | 'rest' | 'cooldown' | 'done';

interface IntervalConfig {
  warmup: number;
  work: number;
  rest: number;
  rounds: number;
  cooldown: number;
}

const PRESETS = {
  tabata: { warmup: 10, work: 20, rest: 10, rounds: 8, cooldown: 0 },
  hiit: { warmup: 30, work: 30, rest: 15, rounds: 10, cooldown: 30 },
  emom: { warmup: 0, work: 60, rest: 0, rounds: 10, cooldown: 0 },
  custom: { warmup: 0, work: 45, rest: 15, rounds: 12, cooldown: 0 },
};

const PHASE_COLORS: Record<IntervalPhase, string> = {
  warmup: '#F59E0B',  // Amber
  work: '#00D9FF',     // Cyan
  rest: '#10B981',     // Green
  cooldown: '#8B5CF6', // Purple
  done: '#6B7280',     // Gray
};

const PHASE_LABELS: Record<IntervalPhase, string> = {
  warmup: 'Warm Up',
  work: 'Work',
  rest: 'Rest',
  cooldown: 'Cool Down',
  done: 'Complete',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function beep(freq = 880, duration = 200) {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    o.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + duration / 1000);
    o.start();
    o.stop(ac.currentTime + duration / 1000);
  } catch { }
}

export default function IntervalTimer() {
  const [config, setConfig] = useState<IntervalConfig>(PRESETS.tabata);
  const [phase, setPhase] = useState<IntervalPhase>('work');
  const [remaining, setRemaining] = useState(config.work);
  const [currentRound, setCurrentRound] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const enterPhase = useCallback((newPhase: IntervalPhase) => {
    setPhase(newPhase);
    switch (newPhase) {
      case 'warmup': setRemaining(config.warmup); break;
      case 'work': setRemaining(config.work); break;
      case 'rest': setRemaining(config.rest); break;
      case 'cooldown': setRemaining(config.cooldown); break;
      case 'done': setRemaining(0); break;
    }
  }, [config]);

  const handlePhaseTransition = useCallback(() => {
    if (phase === 'warmup') {
      beep(800, 400);
      enterPhase('work');
    } else if (phase === 'work') {
      beep(600, 300);
      if (currentRound < config.rounds) {
        enterPhase('rest');
      } else if (config.cooldown > 0) {
        enterPhase('cooldown');
      } else {
        finishWorkout();
      }
    } else if (phase === 'rest') {
      beep(1000, 400);
      setCurrentRound(r => r + 1);
      enterPhase('work');
    } else if (phase === 'cooldown') {
      finishWorkout();
    }
  }, [phase, currentRound, config, enterPhase]);

  const finishWorkout = () => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setPhase('done');
    beep(523, 300);
    setTimeout(() => beep(659, 300), 200);
    setTimeout(() => beep(880, 500), 400);
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            handlePhaseTransition();
            return 0;
          }
          // Beep on last 3 seconds
          if (prev <= 3 && prev > 1) {
            beep(1200, 100);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearTimer();
  }, [isRunning, isPaused, handlePhaseTransition]);

  const start = () => {
    if (phase === 'done') {
      reset();
      setTimeout(() => {
        setIsRunning(true);
        if (config.warmup > 0) enterPhase('warmup');
        else enterPhase('work');
      }, 0);
    } else {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setPhase('work');
    setRemaining(config.work);
    setCurrentRound(1);
  };

  const applyPreset = (preset: keyof typeof PRESETS) => {
    const newConfig = PRESETS[preset];
    setConfig(newConfig);
    setPhase('work');
    setRemaining(newConfig.work);
    setCurrentRound(1);
    setIsRunning(false);
    setIsPaused(false);
  };

  const updateConfig = (key: keyof IntervalConfig, value: number) => {
    const num = Math.max(0, Math.min(600, value));
    setConfig(prev => ({ ...prev, [key]: num }));
  };

  const progress = phase === 'work' 
    ? (config.work - remaining) / config.work 
    : phase === 'rest' 
    ? (config.rest - remaining) / config.rest 
    : phase === 'warmup'
    ? (config.warmup - remaining) / config.warmup
    : phase === 'cooldown'
    ? (config.cooldown - remaining) / config.cooldown
    : 0;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <DumbbellIcon size={28} />
          Interval Timer
        </h1>

        {/* Presets */}
        <div className={styles.presets}>
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map(preset => (
            <button
              key={preset}
              className={`${styles.presetBtn} ${
                JSON.stringify(config) === JSON.stringify(PRESETS[preset]) ? styles.active : ''
              }`}
              onClick={() => applyPreset(preset)}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
          <button
            className={`${styles.presetBtn} ${styles.settingsBtn}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={styles.settings}>
            <div className={styles.settingRow}>
              <label>Warm Up (sec)</label>
              <input
                type="number"
                value={config.warmup}
                onChange={(e) => updateConfig('warmup', +e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className={styles.settingRow}>
              <label>Work (sec)</label>
              <input
                type="number"
                value={config.work}
                onChange={(e) => updateConfig('work', +e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className={styles.settingRow}>
              <label>Rest (sec)</label>
              <input
                type="number"
                value={config.rest}
                onChange={(e) => updateConfig('rest', +e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className={styles.settingRow}>
              <label>Rounds</label>
              <input
                type="number"
                value={config.rounds}
                onChange={(e) => updateConfig('rounds', +e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className={styles.settingRow}>
              <label>Cool Down (sec)</label>
              <input
                type="number"
                value={config.cooldown}
                onChange={(e) => updateConfig('cooldown', +e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>
        )}

        {/* Main Display */}
        <div 
          className={styles.display}
          style={{ '--phase-color': PHASE_COLORS[phase] } as React.CSSProperties}
        >
          <div className={styles.phaseBadge}>{PHASE_LABELS[phase]}</div>
          
          <div className={styles.time}>{formatTime(remaining)}</div>
          
          {/* Progress Ring */}
          <div className={styles.progressRing}>
            <svg viewBox="0 0 100 100">
              <circle className={styles.track} cx="50" cy="50" r="45" />
              <circle
                className={styles.progress}
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress)}`,
                }}
              />
            </svg>
          </div>
        </div>

        {/* Round Indicators */}
        <div className={styles.rounds}>
          <span className={styles.roundLabel}>
            Round {Math.min(currentRound, config.rounds)} / {config.rounds}
          </span>
          <div className={styles.roundDots}>
            {Array.from({ length: config.rounds }).map((_, i) => (
              <div
                key={i}
                className={`${styles.roundDot} ${
                  i < currentRound ? styles.completed : ''
                } ${i === currentRound - 1 && phase === 'work' ? styles.active : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {!isRunning ? (
            <button className={`${styles.button} ${styles.primary}`} onClick={start}>
              <PlayIcon size={32} />
              <span>Start</span>
            </button>
          ) : isPaused ? (
            <button className={`${styles.button} ${styles.primary}`} onClick={resume}>
              <PlayIcon size={32} />
              <span>Resume</span>
            </button>
          ) : (
            <button className={`${styles.button} ${styles.primary}`} onClick={pause}>
              <PauseIcon size={32} />
              <span>Pause</span>
            </button>
          )}

          <button className={`${styles.button} ${styles.secondary}`} onClick={reset}>
            <RotateCcwIcon size={24} />
            <span>Reset</span>
          </button>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <p><strong>Tabata:</strong> 20s work / 10s rest × 8 rounds</p>
          <p><strong>HIIT:</strong> 30s work / 15s rest × 10 rounds</p>
          <p><strong>EMOM:</strong> Every minute on the minute</p>
        </div>
      </div>
    </div>
  );
}
