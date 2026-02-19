/**
 * Chess Clock Timer
 * Dual timer for chess and turn-based games
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcwIcon, SettingsIcon } from '@/components/ui/icons';
import styles from './ChessClock.module.css';

const DEFAULT_TIME = 5 * 60 * 1000; // 5 minutes

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
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

interface PlayerState {
  player1Time: number;
  player2Time: number;
  activePlayer: 1 | 2 | null;
  startedAt: number | null;
}

export default function ChessClock() {
  const [state, setState] = useState<PlayerState>({
    player1Time: DEFAULT_TIME,
    player2Time: DEFAULT_TIME,
    activePlayer: null,
    startedAt: null,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempMinutes, setTempMinutes] = useState('5');
  const [, forceUpdate] = useState({});
  const rafRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    if (state.activePlayer && state.startedAt) {
      const loop = () => {
        const now = Date.now();
        const elapsed = now - state.startedAt;

        if (state.activePlayer === 1) {
          const newTime = Math.max(0, state.player1Time - elapsed);
          if (newTime === 0) {
            beep(660, 1000);
            setState(s => ({ ...s, activePlayer: null, startedAt: null, player1Time: 0 }));
            return;
          }
        } else if (state.activePlayer === 2) {
          const newTime = Math.max(0, state.player2Time - elapsed);
          if (newTime === 0) {
            beep(660, 1000);
            setState(s => ({ ...s, activePlayer: null, startedAt: null, player2Time: 0 }));
            return;
          }
        }

        forceUpdate({});
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.activePlayer, state.startedAt, state.player1Time, state.player2Time]);

  const switchToPlayer = useCallback((clickedPlayer: 1 | 2) => {
    const now = Date.now();

    if (!state.activePlayer) {
      setState(s => ({ ...s, activePlayer: clickedPlayer, startedAt: now }));
      return;
    }

    if (state.activePlayer === clickedPlayer) {
      const elapsed = now - (state.startedAt ?? now);
      const opponent = clickedPlayer === 1 ? 2 : 1;

      setState(s => ({
        ...s,
        player1Time: s.activePlayer === 1 ? Math.max(0, s.player1Time - elapsed) : s.player1Time,
        player2Time: s.activePlayer === 2 ? Math.max(0, s.player2Time - elapsed) : s.player2Time,
        activePlayer: opponent,
        startedAt: now
      }));
    }
  }, [state.activePlayer, state.startedAt]);

  const reset = useCallback(() => {
    setState({
      player1Time: DEFAULT_TIME,
      player2Time: DEFAULT_TIME,
      activePlayer: null,
      startedAt: null,
    });
  }, []);

  const applyTimeSettings = useCallback(() => {
    let mins = parseInt(tempMinutes);
    if (isNaN(mins) || mins < 1) mins = 1;
    if (mins > 180) mins = 180;

    const newTime = mins * 60 * 1000;
    setState({
      player1Time: newTime,
      player2Time: newTime,
      activePlayer: null,
      startedAt: null,
    });
    setShowSettings(false);
  }, [tempMinutes]);

  const currentP1Time = state.activePlayer === 1 && state.startedAt
    ? Math.max(0, state.player1Time - (Date.now() - state.startedAt))
    : state.player1Time;

  const currentP2Time = state.activePlayer === 2 && state.startedAt
    ? Math.max(0, state.player2Time - (Date.now() - state.startedAt))
    : state.player2Time;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Chess Clock</h1>

        {/* Settings Modal */}
        {showSettings && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Set Time</h3>
              <div className={styles.inputGroup}>
                <label>Minutes per player:</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={tempMinutes}
                  onChange={(e) => setTempMinutes(e.target.value)}
                />
              </div>
              <div className={styles.modalButtons}>
                <button className={styles.primaryBtn} onClick={applyTimeSettings}>
                  Apply
                </button>
                <button className={styles.secondaryBtn} onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Areas */}
        <div className={styles.playersContainer}>
          <div
            className={`${styles.player} ${styles.player1} ${state.activePlayer === 1 ? styles.active : ''}`}
            onClick={() => switchToPlayer(1)}
          >
            <div className={styles.piece}>♔</div>
            <div className={styles.playerLabel}>Player 1</div>
            <div className={styles.playerTime}>{formatTime(currentP1Time)}</div>
            <div className={styles.tapHint}>Tap to switch</div>
          </div>

          <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={reset}>
              <RotateCcwIcon size={20} />
              <span>Reset</span>
            </button>
            <button className={styles.controlBtn} onClick={() => setShowSettings(true)}>
              <SettingsIcon size={20} />
              <span>Time</span>
            </button>
          </div>

          <div
            className={`${styles.player} ${styles.player2} ${state.activePlayer === 2 ? styles.active : ''}`}
            onClick={() => switchToPlayer(2)}
          >
            <div className={`${styles.piece} ${styles.black}`}>♚</div>
            <div className={styles.playerLabel}>Player 2</div>
            <div className={styles.playerTime}>{formatTime(currentP2Time)}</div>
            <div className={styles.tapHint}>Tap to switch</div>
          </div>
        </div>

        <div className={styles.instructions}>
          <p>Tap your side after making a move to switch to your opponent.</p>
          <p>First tap starts the game.</p>
        </div>
      </div>
    </div>
  );
}
