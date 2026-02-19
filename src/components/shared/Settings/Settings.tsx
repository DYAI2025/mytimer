/**
 * Settings Panel Component
 */

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { audioService, requestNotificationPermission } from '@/utils/audio';
import { Modal } from '@/components/shared/Modal/Modal';
import { VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon, BellIcon, BellOffIcon } from '@/components/ui/icons';
import styles from './Settings.module.css';
import type { SoundType } from '@/utils/audio';

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { settings, updateSettings } = useSettings();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    updateSettings({ soundVolume: volume });
    audioService.setVolume(volume);
  };

  const handleSoundToggle = () => {
    const newValue = !settings.soundEnabled;
    updateSettings({ soundEnabled: newValue });
    audioService.setMuted(!newValue);
  };

  const handleSoundTypeChange = (type: SoundType) => {
    updateSettings({ soundType: type });
    audioService.setSoundType(type);
  };

  const handleNotificationsToggle = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSettings({ notificationsEnabled: true });
        setNotificationPermission('granted');
      }
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const handleTestSound = () => {
    audioService.play();
  };

  const getVolumeIcon = () => {
    if (!settings.soundEnabled) return <VolumeXIcon size={20} />;
    if (settings.soundVolume === 0) return <VolumeXIcon size={20} />;
    if (settings.soundVolume < 0.3) return <VolumeIcon size={20} />;
    if (settings.soundVolume < 0.7) return <Volume1Icon size={20} />;
    return <Volume2Icon size={20} />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
    >
      <div className={styles.settings}>
        {/* Sound Settings */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Sound</h3>
          
          <div className={styles.setting}>
            <div className={styles.settingLabel}>
              <span>Enable Sound</span>
              <p className={styles.settingDesc}>Play sounds when timers complete</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={handleSoundToggle}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          {settings.soundEnabled && (
            <>
              <div className={styles.setting}>
                <div className={styles.settingLabel}>
                  <span>Volume</span>
                  {getVolumeIcon()}
                </div>
                <div className={styles.volumeControl}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={handleVolumeChange}
                    className={styles.slider}
                  />
                  <span className={styles.volumeValue}>
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
              </div>

              <div className={styles.setting}>
                <div className={styles.settingLabel}>
                  <span>Sound Type</span>
                </div>
                <div className={styles.soundTypes}>
                  {(['chime', 'bell', 'beep'] as SoundType[]).map((type) => (
                    <button
                      key={type}
                      className={`${styles.soundTypeBtn} ${settings.soundType === type ? styles.active : ''}`}
                      onClick={() => handleSoundTypeChange(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button className={styles.testBtn} onClick={handleTestSound}>
                Test Sound
              </button>
            </>
          )}
        </section>

        {/* Notification Settings */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Notifications</h3>
          
          <div className={styles.setting}>
            <div className={styles.settingLabel}>
              <span>Browser Notifications</span>
              <p className={styles.settingDesc}>Get notified when timers complete</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationsToggle}
                disabled={notificationPermission === 'denied'}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          {notificationPermission === 'denied' && (
            <p className={styles.warning}>
              <BellOffIcon size={16} />
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}

          {notificationPermission === 'default' && !settings.notificationsEnabled && (
            <p className={styles.info}>
              <BellIcon size={16} />
              Enable notifications to be alerted when timers finish, even in background tabs.
            </p>
          )}
        </section>

        {/* Display Settings */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Display</h3>
          
          <div className={styles.setting}>
            <div className={styles.settingLabel}>
              <span>24-Hour Format</span>
              <p className={styles.settingDesc}>Use 24-hour time format for digital clock</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.use24HourFormat}
                onChange={(e) => updateSettings({ use24HourFormat: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingLabel}>
              <span>Show Seconds</span>
              <p className={styles.settingDesc}>Display seconds in timer displays</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.showSeconds}
                onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </section>
      </div>
    </Modal>
  );
}
