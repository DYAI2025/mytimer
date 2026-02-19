/**
 * App Router
 * Hash-based routing with lazy loading
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell/AppShell';

// Loading fallback
function TimerSkeleton() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh'
    }}>
      <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: '50%' }} />
    </div>
  );
}

// Lazy load all pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const CountdownTimer = lazy(() => import('@/pages/timer/CountdownTimer'));
const PomodoroTimer = lazy(() => import('@/pages/timer/PomodoroTimer'));
const StopwatchTimer = lazy(() => import('@/pages/timer/StopwatchTimer'));
const BreathingTimer = lazy(() => import('@/pages/timer/BreathingTimer'));
const AnalogTimer = lazy(() => import('@/pages/timer/AnalogTimer'));
const DigitalClock = lazy(() => import('@/pages/timer/DigitalClock'));
const TimeSince = lazy(() => import('@/pages/timer/TimeSince'));

// Simple hash router
function useHashRouter() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}

export function Router() {
  const route = useHashRouter();

  // Route matching
  const renderRoute = () => {
    const path = route.split('?')[0];

    switch (path) {
      case '/':
      case '':
        return <LandingPage />;
      case '/countdown':
        return <CountdownTimer />;
      case '/pomodoro':
        return <PomodoroTimer />;
      case '/stopwatch':
        return <StopwatchTimer />;
      case '/breathing':
        return <BreathingTimer />;
      case '/analog':
        return <AnalogTimer />;
      case '/digital':
        return <DigitalClock />;
      case '/timesince':
        return <TimeSince />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="#/">Go Home</a>
          </div>
        );
    }
  };

  return (
    <AppShell>
      <Suspense fallback={<TimerSkeleton />}>
        {renderRoute()}
      </Suspense>
    </AppShell>
  );
}
