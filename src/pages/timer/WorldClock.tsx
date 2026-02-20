/**
 * World Clock Timer
 * Display time across multiple timezones
 */

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, XIcon, GlobeIcon } from '@/components/ui/icons';
import styles from './WorldClock.module.css';

interface CityEntry {
  id: string;
  city: string;
  timezone: string;
  label?: string;
}

const DEFAULT_CITIES: CityEntry[] = [
  { id: '1', city: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, label: 'Your Location' },
  { id: '2', city: 'New York', timezone: 'America/New_York' },
  { id: '3', city: 'London', timezone: 'Europe/London' },
  { id: '4', city: 'Tokyo', timezone: 'Asia/Tokyo' },
];

const POPULAR_TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getCityName(timezone: string): string {
  return timezone.split('/')[1]?.replace(/_/g, ' ') || timezone;
}

export default function WorldClock() {
  const [cities, setCities] = useState<CityEntry[]>(DEFAULT_CITIES);
  const [now, setNow] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const addCity = useCallback((timezone: string) => {
    if (!isValidTimezone(timezone)) return;
    if (cities.some(c => c.timezone === timezone)) return;

    const newCity: CityEntry = {
      id: Date.now().toString(),
      city: getCityName(timezone),
      timezone,
    };
    setCities(prev => [...prev, newCity]);
    setShowAdd(false);
    setSearchQuery('');
  }, [cities]);

  const removeCity = useCallback((id: string) => {
    setCities(prev => prev.filter(c => c.id !== id));
  }, []);

  const filteredTimezones = POPULAR_TIMEZONES.filter(tz =>
    tz.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !cities.some(c => c.timezone === tz)
  );

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <GlobeIcon size={28} />
          World Clock
        </h1>

        {/* Add City Modal */}
        {showAdd && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Add City</h3>
                <button className={styles.closeBtn} onClick={() => setShowAdd(false)}>
                  <XIcon size={20} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.timezoneList}>
                {filteredTimezones.map(tz => (
                  <button
                    key={tz}
                    className={styles.timezoneOption}
                    onClick={() => addCity(tz)}
                  >
                    {getCityName(tz)}
                    <span className={styles.timezoneOffset}>
                      {new Intl.DateTimeFormat('en-US', {
                        timeZone: tz,
                        timeZoneName: 'shortOffset'
                      }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clock Grid */}
        <div className={styles.clockGrid}>
          {cities.map(city => {
            const timeString = now.toLocaleTimeString('en-US', {
              timeZone: city.timezone,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });
            const dateString = now.toLocaleDateString('en-US', {
              timeZone: city.timezone,
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const offset = new Intl.DateTimeFormat('en-US', {
              timeZone: city.timezone,
              timeZoneName: 'shortOffset'
            }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value;

            // Determine day or night
            const hourInZone = parseInt(now.toLocaleTimeString('en-US', {
              timeZone: city.timezone,
              hour: 'numeric',
              hour12: false,
            }));
            const isDaytime = hourInZone >= 6 && hourInZone < 20;

            return (
              <div
                key={city.id}
                className={`${styles.clockCard} ${isDaytime ? styles.daytime : styles.nighttime}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cityName}>{city.city}</div>
                    {city.label && <div className={styles.cityLabel}>{city.label}</div>}
                  </div>
                  <span className={styles.dayNightIcon}>{isDaytime ? '☀️' : '🌙'}</span>
                  <div className={styles.offset}>{offset}</div>
                  {cities.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeCity(city.id)}
                      aria-label={`Remove ${city.city}`}
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>
                <div className={styles.time}>{timeString}</div>
                <div className={styles.date}>{dateString}</div>
              </div>
            );
          })}
        </div>

        {/* Add Button */}
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <PlusIcon size={20} />
          <span>Add City</span>
        </button>
      </div>
    </div>
  );
}
