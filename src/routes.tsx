import { createRoutesFromElements, Route } from 'react-router';
import App from './App';
import SettingsPage from './pages/SettingsPage.tsx';
import HomePage from './pages/HomePage.tsx';
import WorkoutsPage from './pages/WorkoutsPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';

/**
 * Application routes configuration using React Router v7
 */
export const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route index element={<HomePage />} />
    <Route path="home" element={<HomePage />} />
    <Route path="workouts" element={<WorkoutsPage />} />
    <Route path="history" element={<HistoryPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
);
