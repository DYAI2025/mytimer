/**
 * Pomodoro Timer Page
 */

import { useState, useCallback, useEffect } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { TimerDisplay } from '@/components/shared/TimerDisplay/TimerDisplay';
import { ProgressRing } from '@/components/shared/ProgressRing/ProgressRing';
import { TimerControls } from '@/components/shared/TimerControls/TimerControls';
import styles from './PomodoroTimer.module.css';

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

interface PhaseConfig {
  label: string;
  duration: number;
  color: string;
}

const PHASES: Record<PomodoroPhase, PhaseConfig> = {
  work: { label: 'Focus', duration: 25 * 60 * 1000, color: '#00D9FF' },
  shortBreak: { label: 'Short Break', duration: 5 * 60 * 1000, color: '#10B981' },
  longBreak: { label: 'Long Break', duration: 15 * 60 * 1000, color: '#8B5CF6' },
};

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const currentPhase = PHASES[phase];
  const { state, formattedTime, progress, start, pause, resume, reset } = useTimerEngine({
    type: 'countdown',
    duration: currentPhase.duration,
  });

  // Handle phase transitions when timer completes
  useEffect(() => {
    if (state.remaining === 0 && !state.isRunning && !state.isPaused) {
      if (phase === 'work') {
        const newCompleted = completedPomodoros + 1;
        setCompletedPomodoros(newCompleted);
        
        // After 4 pomodoros, take a long break
        if (newCompleted % 4 === 0) {
          setPhase('longBreak');
        } else {
          setPhase('shortBreak');
        }
      } else {
        setPhase('work');
      }
    }
  }, [state.remaining, state.isRunning, state.isPaused, phase, completedPomodoros]);

  const handleReset = useCallback(() => {
    reset();
    setPhase('work');
  }, [reset]);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Pomodoro Timer</h1>
        
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Completed Today</span>
            <span className={styles.statValue}>{completedPomodoros}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Current Phase</span>
            <span className={styles.statValue} style={{ color: currentPhase.color }}>
              {currentPhase.label}
            </span>
          </div>
        </div>

        <div className={styles.timerContainer}>
          <div className={styles.progressRing}>
            <ProgressRing 
              progress={progress} 
              size={320} 
              strokeWidth={8}
              color={currentPhase.color}
            />
            <div className={styles.displayOverlay}>
              <TimerDisplay
                time={formattedTime}
                label={currentPhase.label}
                isRunning={state.isRunning}
              />
            </div>
          </div>
        </div>

        <TimerControls
          isRunning={state.isRunning}
          isPaused={state.isPaused}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onReset={handleReset}
        />

        <div className={styles.instructions}>
          <p>Work for 25 minutes, then take a 5-minute break.</p>
          <p>After 4 pomodoros, take a longer 15-minute break.</p>
        </div>
      </div>
    </div>
  );
}
