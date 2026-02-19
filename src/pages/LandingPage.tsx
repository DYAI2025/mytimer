/**
 * Landing Page
 */

import { 
  TimerIcon, 
  ClockIcon, 
  BrainIcon, 
  WindIcon, 
  WatchIcon, 
  HourglassIcon,
  GlobeIcon,
  ChefHatIcon,
  ActivityIcon
} from '@/components/ui/icons';
import styles from './LandingPage.module.css';

const FEATURED_TIMERS = [
  {
    id: 'countdown',
    title: 'Countdown',
    description: 'Simple countdown with customizable duration',
    icon: TimerIcon,
    href: '#/countdown',
    color: '#00D9FF',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro',
    description: '25-minute focus sessions with breaks',
    icon: BrainIcon,
    href: '#/pomodoro',
    color: '#F59E0B',
  },
  {
    id: 'analog',
    title: 'Analog',
    description: 'Visual countdown with animated clock face',
    icon: WatchIcon,
    href: '#/analog',
    color: '#EC4899',
  },
  {
    id: 'stopwatch',
    title: 'Stopwatch',
    description: 'Track elapsed time with lap recording',
    icon: HourglassIcon,
    href: '#/stopwatch',
    color: '#10B981',
  },
  {
    id: 'digital',
    title: 'Digital Clock',
    description: 'Current time with 12/24h format',
    icon: ClockIcon,
    href: '#/digital',
    color: '#8B5CF6',
  },
  {
    id: 'timesince',
    title: 'Time Since',
    description: 'Track time elapsed since an event',
    icon: HourglassIcon,
    href: '#/timesince',
    color: '#EF4444',
  },
  {
    id: 'chess',
    title: 'Chess Clock',
    description: 'Dual timer for turn-based games',
    icon: ClockIcon,
    href: '#/chess',
    color: '#6366F1',
  },
  {
    id: 'world',
    title: 'World Clock',
    description: 'Time across multiple timezones',
    icon: GlobeIcon,
    href: '#/world',
    color: '#14B8A6',
  },
  {
    id: 'cooking',
    title: 'Cooking Timer',
    description: 'Multiple timers for cooking',
    icon: ChefHatIcon,
    href: '#/cooking',
    color: '#F97316',
  },
  {
    id: 'interval',
    title: 'Interval',
    description: 'HIIT/Tabata work-rest cycles',
    icon: ActivityIcon,
    href: '#/interval',
    color: '#DC2626',
  },
  {
    id: 'breathing',
    title: 'Breathing',
    description: 'Guided breathing exercises for relaxation',
    icon: WindIcon,
    href: '#/breathing',
    color: '#06B6D4',
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Master Your Time
              <span className={styles.heroAccent}>Boost Your Focus</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A collection of beautifully designed timers for every purpose.
              From productivity to wellness, find the perfect timer for your needs.
            </p>
            <div className={styles.heroActions}>
              <a href="#/countdown" className={styles.primaryButton}>
                <TimerIcon size={20} />
                Start Countdown
              </a>
              <a href="#/pomodoro" className={styles.secondaryButton}>
                <BrainIcon size={20} />
                Try Pomodoro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Timers Section */}
      <section className={styles.featured}>
        <div className="container">
          <h2 className={styles.sectionTitle}>All Timers</h2>
          <div className={styles.timerGrid}>
            {FEATURED_TIMERS.map((timer) => (
              <a
                key={timer.id}
                href={timer.href}
                className={styles.timerCard}
                style={{ '--card-color': timer.color } as React.CSSProperties}
              >
                <div className={styles.cardIcon}>
                  <timer.icon size={32} />
                </div>
                <h3 className={styles.cardTitle}>{timer.title}</h3>
                <p className={styles.cardDescription}>{timer.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Timer Collection?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Lightning Fast</h3>
              <p>No loading screens, instant start. Optimized for performance.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🎨</div>
              <h3>Beautiful Design</h3>
              <p>Stunning glassmorphism UI with smooth animations.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>Privacy First</h3>
              <p>All data stays on your device. No account required.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📱</div>
              <h3>Works Everywhere</h3>
              <p>Responsive design works on desktop, tablet, and mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>© 2026 Timer Collection. Built with care.</p>
        </div>
      </footer>
    </div>
  );
}
