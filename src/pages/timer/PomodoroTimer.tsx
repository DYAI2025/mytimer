/**
 * Pomodoro Timer Page
 */

import { useState, useCallback, useEffect } from 'react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSettings } from '@/contexts/SettingsContext';
import { audioService, showNotification, updatePageTitle, vibrateDevice, requestNotificationPermission } from '@/utils/audio';
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
  longBreak: { label: 'Long Break', duration: 20 * 60 * 1000, color: '#8B5CF6' },
};

export default function PomodoroTimer() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  
  const currentPhase = PHASES[phase];

  const handleTimerComplete = useCallback(() => {
    // Play interval sound
    if (settings.soundEnabled) {
      audioService.play();
    }

    // Determine next phase and notification message
    let notificationMessage = '';
    if (phase === 'work') {
      const nextPomodoros = completedPomodoros + 1;
      const nextPhase = nextPomodoros % 4 === 0 ? 'long' : 'short';
      notificationMessage = `Work session complete! Take a ${nextPhase} break.`;
    } else {
      notificationMessage = `Break complete! Ready to focus again?`;
    }

    // Show notification
    if (settings.notificationsEnabled) {
      showNotification('Pomodoro Update', notificationMessage);
    }

    // Update page title
    updatePageTitle(`⏰ ${notificationMessage} - Timer Collection`);

    // Vibrate
    vibrateDevice([200, 100, 200]);
  }, [settings, phase, completedPomodoros]);

  const { state, formattedTime, progress, start, pause, resume, reset } = useTimerEngine({
    type: 'countdown',
    duration: currentPhase.duration,
    onComplete: handleTimerComplete,
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

  const handleStart = useCallback(() => {
    if (!hasRequestedPermission && settings.notificationsEnabled) {
      requestNotificationPermission();
      setHasRequestedPermission(true);
    }
    start();
  }, [start, hasRequestedPermission, settings.notificationsEnabled]);

  // Keyboard shortcuts
  const handleStartPause = useCallback(() => {
    if (state.isRunning) {
      pause();
    } else if (state.isPaused) {
      resume();
    } else {
      handleStart();
    }
  }, [state.isRunning, state.isPaused, handleStart, pause, resume]);

  useKeyboardShortcuts({
    onStartPause: handleStartPause,
    onReset: handleReset,
  });

  // Generate session dots (show 4 per cycle)
  const cyclePosition = completedPomodoros % 4;
  const sessionDots = Array.from({ length: 4 }, (_, i) => {
    if (i < cyclePosition) return 'completed';
    if (i === cyclePosition && phase === 'work') return 'current';
    return 'empty';
  });

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Pomodoro Timer</h1>

        {/* Session Dots */}
        <div className={styles.sessions}>
          {sessionDots.map((status, i) => (
            <div
              key={i}
              className={`${styles.sessionDot} ${status === 'completed' ? styles.completed : ''} ${status === 'current' ? styles.current : ''}`}
            />
          ))}
          <span className={styles.sessionLabel}>{completedPomodoros} done</span>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Completed</span>
            <span className={styles.statValue}>{completedPomodoros}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Phase</span>
            <span className={styles.statValue} style={{ color: currentPhase.color }}>
              {currentPhase.label}
            </span>
          </div>
        </div>

        <div
          className={styles.timerContainer}
          style={{ '--phase-glow': `rgba(${phase === 'work' ? '0,217,255' : phase === 'shortBreak' ? '16,185,129' : '139,92,246'}, 0.1)` } as React.CSSProperties}
        >
          <div className={styles.progressRing}>
            <ProgressRing 
              progress={progress} 
              size={320} 
              strokeWidth={8}
              color={currentPhase.color}
            />
            <div className={styles.displayOverlay}>
              <div className={styles.phaseLabel} style={{ color: currentPhase.color }}>
                {currentPhase.label}
              </div>
              <TimerDisplay
                time={formattedTime}
                isRunning={state.isRunning}
              />
            </div>
          </div>
        </div>

        <TimerControls
          isRunning={state.isRunning}
          isPaused={state.isPaused}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onReset={handleReset}
        />

        <div className={styles.instructions}>
          <p>Work for 25 minutes, then take a 5-minute break.</p>
          <p>After 4 pomodoros, take a longer 20-minute break.</p>
        </div>
      </div>
    </div>
  );
}
