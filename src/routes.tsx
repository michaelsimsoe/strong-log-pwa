import { createRoutesFromElements, Route } from 'react-router';
import App from './App';
import SettingsPage from './pages/SettingsPage.tsx';
import HomePage from './pages/HomePage.tsx';
import WorkoutsPage from './pages/WorkoutsPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import { ExerciseListPage } from './features/exercises/pages/ExerciseListPage';
import { CreateExercisePage } from './features/exercises/pages/CreateExercisePage';
import { EditExercisePage } from './features/exercises/pages/EditExercisePage';
import { ActiveWorkoutPage } from './features/logging/pages/ActiveWorkoutPage';

/**
 * Application routes configuration using React Router v7
 */
export const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route index element={<HomePage />} />
    <Route path="home" element={<HomePage />} />
    <Route path="workouts" element={<WorkoutsPage />} />
    <Route path="workouts/active" element={<ActiveWorkoutPage />} />
    <Route path="history" element={<HistoryPage />} />
    <Route path="settings" element={<SettingsPage />} />
    {/* Exercise management routes */}
    <Route path="exercises" element={<ExerciseListPage />} />
    <Route path="exercises/create" element={<CreateExercisePage />} />
    <Route path="exercises/edit/:id" element={<EditExercisePage />} />
  </Route>
);
