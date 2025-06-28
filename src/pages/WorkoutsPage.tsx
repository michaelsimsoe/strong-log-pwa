import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

/**
 * Workouts page component
 * Displays workout history and provides a button to start a new workout
 */
export default function WorkoutsPage() {
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    navigate('/workouts/active');
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Button onClick={handleStartWorkout}>
          <Plus size={16} className="mr-2" />
          New Workout
        </Button>
      </div>

      {/* Placeholder for workout history - will be implemented in a future story */}
      <div className="text-center py-12 text-gray-500">
        <p>Your completed workouts will appear here.</p>
        <p className="mt-2">Start a new workout to begin logging!</p>
      </div>
    </div>
  );
}
