/**
 * Breathing Timer Page
 * Guided breathing exercises with visual animation
 */

import { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, RotateCcwIcon, WindIcon } from '@/components/ui/icons';
import styles from './BreathingTimer.module.css';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold-empty';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty: number;
}

const PATTERNS: Record<string, BreathingPattern> = {
  '4-7-8': {
    name: '4-7-8 Relaxing',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdEmpty: 0,
  },
  box: {
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 4,
  },
  simple: {
    name: 'Simple (4-4)',
    inhale: 4,
    hold: 0,
    exhale: 4,
    holdEmpty: 0,
  },
};

export default function BreathingTimer() {
  const [selectedPattern, setSelectedPattern] = useState<string>('4-7-8');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [cycles, setCycles] = useState(0);

  const pattern = PATTERNS[selectedPattern];

  const getPhaseDuration = useCallback((p: BreathingPhase): number => {
    switch (p) {
      case 'inhale': return pattern.inhale;
      case 'hold': return pattern.hold;
      case 'exhale': return pattern.exhale;
      case 'hold-empty': return pattern.holdEmpty;
    }
  }, [pattern]);

  const getNextPhase = useCallback((current: BreathingPhase): BreathingPhase => {
    switch (current) {
      case 'inhale':
        return pattern.hold > 0 ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        if (pattern.holdEmpty > 0) return 'hold-empty';
        setCycles(c => c + 1);
        return 'inhale';
      case 'hold-empty':
        setCycles(c => c + 1);
        return 'inhale';
    }
  }, [pattern.hold, pattern.holdEmpty]);

  const getPhaseLabel = (p: BreathingPhase): string => {
    switch (p) {
      case 'inhale': return 'Inhale';
      case 'hold': return 'Hold';
      case 'exhale': return 'Exhale';
      case 'hold-empty': return 'Hold';
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeInPhase(prev => {
        const phaseDuration = getPhaseDuration(phase);
        if (prev >= phaseDuration - 1) {
          setPhase(current => getNextPhase(current));
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, getPhaseDuration, getNextPhase]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setPhase('inhale');
    setTimeInPhase(0);
    setCycles(0);
  };

  const phaseDuration = getPhaseDuration(phase);
  const progress = phaseDuration > 0 ? (timeInPhase / phaseDuration) * 100 : 0;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <WindIcon size={32} />
          Breathing Timer
        </h1>

        <div className={styles.patternSelector}>
          {Object.entries(PATTERNS).map(([key, p]) => (
            <button
              key={key}
              className={`${styles.patternBtn} ${selectedPattern === key ? styles.active : ''}`}
              onClick={() => {
                setSelectedPattern(key);
                handleReset();
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className={styles.breathingContainer}>
          <div 
            className={`${styles.breathingCircle} ${isRunning ? styles[phase] : ''}`}
            style={{
              '--progress': `${progress}%`,
              '--inhale-duration': `${pattern.inhale}s`,
              '--exhale-duration': `${pattern.exhale}s`,
            } as React.CSSProperties}
          >
            <div className={styles.circleInner}>
              <span className={styles.phaseLabel}>{getPhaseLabel(phase)}</span>
              <span className={styles.timer}>
                {phaseDuration - timeInPhase}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Cycles Completed</span>
            <span className={styles.statValue}>{cycles}</span>
          </div>
        </div>

        <div className={styles.controls}>
          {!isRunning ? (
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleStart}
              aria-label="Start"
            >
              <PlayIcon size={32} />
              <span>Start</span>
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handlePause}
              aria-label="Pause"
            >
              <PauseIcon size={32} />
              <span>Pause</span>
            </button>
          )}

          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={handleReset}
            aria-label="Reset"
          >
            <RotateCcwIcon size={24} />
            <span>Reset</span>
          </button>
        </div>

        <div className={styles.instructions}>
          <p><strong>{pattern.name}:</strong></p>
          <p>
            Inhale for {pattern.inhale}s
            {pattern.hold > 0 && `, hold for ${pattern.hold}s`},
            exhale for {pattern.exhale}s
            {pattern.holdEmpty > 0 && `, hold for ${pattern.holdEmpty}s`}.
          </p>
        </div>
      </div>
    </div>
  );
}
