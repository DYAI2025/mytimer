/**
 * Keyboard Shortcuts Hook
 * Provides keyboard controls for timer operations
 */

import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onStartPause?: () => void;
  onReset?: () => void;
  onLap?: () => void;
  onFullscreen?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
          // Space bar - Start/Pause
          event.preventDefault();
          handlers.onStartPause?.();
          break;
        
        case 'r':
        case 'R':
          // R key - Reset
          event.preventDefault();
          handlers.onReset?.();
          break;
        
        case 'l':
        case 'L':
          // L key - Lap (for stopwatch/time since)
          event.preventDefault();
          handlers.onLap?.();
          break;
        
        case 'f':
        case 'F':
          // F key - Fullscreen
          event.preventDefault();
          handlers.onFullscreen?.();
          break;
        
        case 'Escape':
          // Escape - Exit fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
