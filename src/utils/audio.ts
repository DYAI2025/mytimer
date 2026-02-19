/**
 * Audio Utilities
 * Web Audio API for timer notifications
 */

// Simple beep sound using Web Audio API
export function playBeep(frequency = 880, duration = 200, volume = 0.5): void {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Audio not supported
  }
}

// Chime sound (two tones)
export function playChime(volume = 0.5): void {
  playBeep(523.25, 300, volume); // C5
  setTimeout(() => playBeep(659.25, 500, volume), 300); // E5
}

// Bell sound (three descending tones)
export function playBell(volume = 0.5): void {
  playBeep(880, 400, volume); // A5
  setTimeout(() => playBeep(698.46, 400, volume), 200); // F5
  setTimeout(() => playBeep(523.25, 600, volume), 400); // C5
}

// Completion sound based on type
export function playNotification(type: 'chime' | 'bell' | 'beep' = 'chime', volume = 0.5): void {
  switch (type) {
    case 'bell':
      playBell(volume);
      break;
    case 'beep':
      playBeep(880, 200, volume);
      break;
    case 'chime':
    default:
      playChime(volume);
      break;
  }
}

// Test if audio is supported
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Show notification
export function showNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
    });
  }
}
