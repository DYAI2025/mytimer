/**
 * App Component
 * Root component with all providers
 */

import { SettingsProvider } from '@/contexts/SettingsContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { Router } from './Router';

function App() {
  return (
    <SettingsProvider>
      <TimerProvider>
        <Router />
      </TimerProvider>
    </SettingsProvider>
  );
}

export default App;
