/**
 * Audio Service
 * Manages timer sounds and notifications
 */

export type SoundType = 'chime' | 'bell' | 'beep' | 'custom';

class AudioService {
  private audioContext: AudioContext | null = null;
  private volume = 0.7;
  private muted = false;
  private soundType: SoundType = 'chime';

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch {
      // Audio not supported
    }
  }

  private playTone(frequency: number, duration: number): void {
    if (!this.audioContext || this.muted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(this.volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
    } catch {
      // Ignore audio errors
    }
  }

  private playChime(): void {
    this.playTone(523.25, 300); // C5
    setTimeout(() => this.playTone(659.25, 500), 300); // E5
  }

  private playBell(): void {
    this.playTone(880, 400); // A5
    setTimeout(() => this.playTone(698.46, 400), 200); // F5
    setTimeout(() => this.playTone(523.25, 600), 400); // C5
  }

  private playBeep(): void {
    this.playTone(880, 200);
  }

  public play(type?: SoundType): void {
    const soundToPlay = type || this.soundType;

    switch (soundToPlay) {
      case 'bell':
        this.playBell();
        break;
      case 'beep':
        this.playBeep();
        break;
      case 'custom':
      case 'chime':
      default:
        this.playChime();
        break;
    }
  }

  public playTick(): void {
    if (!this.muted) {
      this.playTone(800, 50);
    }
  }

  public playInterval(): void {
    if (!this.muted) {
      this.playTone(440, 300);
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public setSoundType(type: SoundType): void {
    this.soundType = type;
  }

  public getVolume(): number {
    return this.volume;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getSoundType(): SoundType {
    return this.soundType;
  }

  public isSupported(): boolean {
    return !!this.audioContext;
  }
}

// Singleton instance
export const audioService = new AudioService();

// Notification utilities
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, body: string, options?: NotificationOptions): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'timer-notification',
      requireInteraction: false,
      ...options,
    });
  } catch {
    // Notification failed
  }
}

export function updatePageTitle(message: string): void {
  document.title = message;
}

export function vibrateDevice(pattern: number | number[] = 200): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
