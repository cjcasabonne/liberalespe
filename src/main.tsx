import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import LandingPreview from './LandingPreview';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const path = window.location.pathname;
const isLanding = path === '/' || path === '/landing-preview';

createRoot(root).render(
  <StrictMode>
    {isLanding ? <LandingPreview /> : <App />}
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
