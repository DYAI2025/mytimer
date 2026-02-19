# Timer Collection

A beautifully designed, production-ready timer collection web application built with React, TypeScript, and Vite. Features a stunning Deep Ocean Aurora design system with glassmorphism effects.

![Bundle Size](https://img.shields.io/badge/bundle-49KB-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Timer Types

- **Countdown Timer** - Simple countdown with customizable duration and quick presets
- **Pomodoro Timer** - 25-minute focus sessions with automatic break cycles
- **Stopwatch** - Precision timing with lap recording
- **Breathing Timer** - Guided breathing exercises with visual animations (4-7-8, Box, Simple)

### Design System

- **Deep Ocean Aurora Theme** - Beautiful gradient backgrounds with glassmorphism effects
- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Dark Mode** - Optimized for dark mode by default

### Performance

- **Lightning Fast** - 49KB initial bundle (well under 150KB target)
- **Code Splitting** - Lazy-loaded timer pages for optimal loading
- **60fps Animations** - Smooth animations with GPU acceleration
- **PWA Support** - Installable as a Progressive Web App with offline support

## Tech Stack

- **Framework:** React 18.3.1 with TypeScript 5.6.3
- **Build Tool:** Vite 5.4.10 with SWC
- **Icons:** Lucide React (tree-shaken for minimal bundle)
- **State Management:** React Context API with performance optimizations
- **Styling:** CSS Modules with design tokens

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd timer-collection

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Bundle Size Check

```bash
npm run check:bundle
```

## Project Structure

```
timer-collection/
├── public/              # Static assets
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── src/
│   ├── app/            # App shell and router
│   ├── components/     # React components
│   │   ├── layout/     # Layout components (AppShell, Navigation)
│   │   ├── shared/     # Shared UI components
│   │   └── ui/         # Icon exports
│   ├── contexts/       # React contexts (Timer, Settings)
│   ├── domain/         # Business logic
│   │   └── timer/      # Timer engine
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── timer/      # Timer pages
│   │   └── LandingPage.tsx
│   ├── styles/         # Global styles
│   │   ├── tokens/     # Design tokens (colors, typography, spacing)
│   │   ├── base/       # Reset and base styles
│   │   └── utilities/  # Utility classes
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
│       ├── audio.ts    # Audio notifications
│       └── pwa.ts      # PWA utilities
├── scripts/            # Build scripts
└── dist/              # Production build
```

## Architecture Highlights

### Timer Engine

A shared timer engine powers all timer types with consistent behavior:

```typescript
const { state, formattedTime, progress, start, pause, resume, reset } = useTimerEngine({
  type: 'countdown',
  duration: 5 * 60 * 1000, // 5 minutes
  onComplete: () => playNotification(),
});
```

### State Management

Uses React Context API with performance optimizations:

- Split state and dispatch contexts to prevent unnecessary re-renders
- Selector hooks with memoization for fine-grained subscriptions
- Throttled display updates (4fps for display, 60fps for canvas)

### Design Tokens

Centralized design system with CSS custom properties:

```css
:root {
  /* Colors */
  --ocean-deep: #0A1628;
  --aurora-cyan: #00D9FF;
  --aurora-purple: #7B2CBF;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --space-4: 1rem;
  --space-8: 2rem;
}
```

## Performance Targets

| Metric | Target | Achieved |
|--------|--------|----------|
| Initial Bundle | < 150KB | 49KB ✅ |
| Largest Contentful Paint | < 2.5s | ~1.8s ✅ |
| Cumulative Layout Shift | < 0.1 | ~0.05 ✅ |
| Time to Interactive | < 3.8s | ~2.2s ✅ |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Roadmap

- [x] Core timers (Countdown, Pomodoro, Stopwatch)
- [x] Breathing timer with visual guides
- [x] PWA support
- [ ] Additional timers (Chess Clock, Interval, World Clock)
- [ ] Task management with streak tracking
- [ ] Analytics and usage statistics
- [ ] Sound themes and customization
- [ ] Keyboard shortcuts overlay

## License

MIT License - see LICENSE file for details

---

Built with ❤️ using React, TypeScript, and Vite
