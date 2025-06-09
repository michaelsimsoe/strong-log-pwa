import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider, createBrowserRouter } from 'react-router';
import './index.css';
import { routes } from './routes';

// Register service worker for PWA functionality
const updateSW = registerSW({
  onNeedRefresh() {
    // This function is called when a new service worker is available
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // This function is called when the app is ready to work offline
    console.info('App is ready for offline use');
  },
});

// Create the router using the routes configuration
const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
