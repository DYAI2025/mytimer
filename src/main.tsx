/**
 * Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { registerServiceWorker } from './utils/pwa';

// Import global styles
import './styles/tokens/index.css';
import './styles/base/reset.css';
import './styles/base/typography.css';
import './styles/glassmorphism.css';
import './styles/animations.css';
import './styles/utilities/layout.css';

// Register service worker for PWA
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
