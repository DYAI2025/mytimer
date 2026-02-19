# Changelog

All notable changes to Timer Collection will be documented in this file.

## [1.2.0] - 2026-02-19

### Added

#### New Timers
- **Interval Timer**: High-intensity interval training timer with configurable work/rest periods and rounds
- **Chess Clock**: Two-player timer with alternating turns and optional time increments
- **World Clock**: Display time across multiple timezones with add/remove cities functionality

#### Core Features
- **Sound System**: Complete audio system with multiple sound themes (chime, bell, beep)
  - Volume control (0-100%)
  - Mute toggle
  - Test sound button
  - Configurable sound type
- **Settings Panel**: Comprehensive settings modal accessible from navigation
  - Sound preferences
  - Notification preferences
  - Display settings (24-hour format, show seconds)
  - Settings persistence via localStorage
- **Browser Notifications**: Get notified when timers complete, even in background tabs
  - Request permission on first use
  - Works across all timer types
  - Customized messages per timer
- **Custom Duration Input**: Set custom durations for Countdown timer
  - Hours, minutes, seconds picker
  - Visual preview of total duration
  - Input validation
- **Keyboard Shortcuts**: Universal keyboard controls for all timers
  - Space: Start/Pause
  - R: Reset
  - L: Lap (where applicable)
  - F: Fullscreen (where applicable)
  - Esc: Exit fullscreen
- **Mobile Haptic Feedback**: Vibration on timer completion and interactions (mobile devices)

#### UI Improvements
- **Navigation Overflow Fix**: All timer links now visible on desktop navigation
- **Favicon**: Beautiful cyan clock icon favicon (SVG + fallbacks)
- **Settings Button**: Easy access to settings from navigation bar
- **Long Breaks**: Pomodoro timer now includes 20-minute long breaks after every 4 pomodoros

### Enhanced
- **Pomodoro Timer**: Added intelligent phase notifications and long break support
- **Countdown Timer**: Added custom duration picker and completion notifications
- **All Timers**: Added sound and notification support on completion
- **SEO**: Enhanced meta tags for better search engine visibility and social sharing

### Fixed
- Navigation overflow on standard desktop widths (1280px-1440px)
- Missing favicon (404 error)
- Keyboard shortcuts now work consistently across all timer pages

### Security
- Ran npm audit fix to address known vulnerabilities in dev dependencies

## [1.0.0] - 2026-02-15

### Added
- Initial release with 8 timer types:
  - Countdown Timer
  - Pomodoro Timer
  - Stopwatch
  - Analog Clock
  - Digital Clock
  - Time Since
  - Breathing Exercise
- Beautiful glassmorphism design with Deep Ocean Aurora theme
- Responsive design for mobile, tablet, and desktop
- Progressive Web App (PWA) support
- Zero bugs, 100% accessibility score
- 49KB bundle size (optimized)
