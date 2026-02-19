/**
 * App Shell - Main Layout Component
 */

import { Navigation } from '../Navigation/Navigation';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={`${styles.appShell} aurora-bg`}>
      <Navigation />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
