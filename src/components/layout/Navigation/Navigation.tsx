/**
 * Navigation Component
 */

import { useState } from 'react';
import { 
  MenuIcon, 
  CloseIcon, 
  ClockIcon, 
  WindIcon, 
  BrainIcon, 
  TimerIcon,
  HourglassIcon,
  WatchIcon,
  GlobeIcon,
  ChefHatIcon,
  ActivityIcon
} from '@/components/ui/icons';
import styles from './Navigation.module.css';

const NAV_LINKS = [
  { href: '#/', label: 'Home', icon: ClockIcon },
  { href: '#/countdown', label: 'Countdown', icon: TimerIcon },
  { href: '#/pomodoro', label: 'Pomodoro', icon: BrainIcon },
  { href: '#/stopwatch', label: 'Stopwatch', icon: HourglassIcon },
  { href: '#/analog', label: 'Analog', icon: WatchIcon },
  { href: '#/digital', label: 'Digital', icon: ClockIcon },
  { href: '#/timesince', label: 'Time Since', icon: HourglassIcon },
  { href: '#/chess', label: 'Chess', icon: ClockIcon },
  { href: '#/world', label: 'World', icon: GlobeIcon },
  { href: '#/cooking', label: 'Cooking', icon: ChefHatIcon },
  { href: '#/interval', label: 'Interval', icon: ActivityIcon },
  { href: '#/breathing', label: 'Breathing', icon: WindIcon },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className={styles.navContent}>
          <a href="#/" className={styles.logo}>
            <ClockIcon className={styles.logoIcon} aria-hidden="true" />
            <span>Timer Collection</span>
          </a>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>

          <ul className={styles.desktopLinks} role="menubar">
            {NAV_LINKS.map((link) => (
              <li key={link.href} role="none">
                <a
                  href={link.href}
                  className={styles.navLink}
                  role="menuitem"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {mobileMenuOpen && (
          <ul
            id="mobile-menu"
            className={styles.mobileLinks}
            role="menu"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href} role="none">
                <a
                  href={link.href}
                  className={styles.mobileLink}
                  role="menuitem"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={20} aria-hidden="true" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
