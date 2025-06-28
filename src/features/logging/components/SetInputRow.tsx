/**
 * SetInputRow Component
 *
 * Component for inputting weight and reps for a single set in a workout.
 */

import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Trash2, Check, MoreVertical } from 'lucide-react';
import { useUserSettingsStore } from '../../../state/userSettingsStore';
import { type ActiveSet } from '../hooks/useActiveWorkout';

interface SetInputRowProps {
  setNumber: number;
  set: ActiveSet;
  onUpdate: (updates: Partial<ActiveSet>) => void;
  onDelete: () => void;
  onAddNote: () => void;
}

export function SetInputRow({ setNumber, set, onUpdate, onDelete, onAddNote }: SetInputRowProps) {
  const { preferredWeightUnit } = useUserSettingsStore();

  // Local state for input values
  const [weightInput, setWeightInput] = useState(set.loggedWeightKg.toString());
  const [repsInput, setRepsInput] = useState(set.loggedReps.toString());

  // Update local state when set prop changes
  useEffect(() => {
    setWeightInput(set.loggedWeightKg.toString());
    setRepsInput(set.loggedReps.toString());
  }, [set.loggedWeightKg, set.loggedReps]);

  // Handle weight input change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeightInput(value);

    // Only update parent state if value is a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate({ loggedWeightKg: numValue });
    }
  };

  // Handle reps input change
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepsInput(value);

    // Only update parent state if value is a valid integer
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate({ loggedReps: numValue });
    }
  };

  // Toggle set completion status
  const toggleCompleted = () => {
    onUpdate({ completed: !set.completed });
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-md ${set.completed ? 'bg-green-50 dark:bg-green-950/30' : 'bg-gray-50 dark:bg-gray-900'}`}
    >
      {/* Set number */}
      <div className="w-16 text-sm font-medium">Set {setNumber + 1}</div>

      {/* Weight input */}
      <div className="flex-1">
        <div className="relative">
          <Input
            type="number"
            min="0"
            step="0.5"
            value={weightInput}
            onChange={handleWeightChange}
            className="pr-8"
            aria-label={`Weight for set ${setNumber + 1}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500 text-sm">
            {preferredWeightUnit}
          </div>
        </div>
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <div className="relative">
          <Input
            type="number"
            min="0"
            step="1"
            value={repsInput}
            onChange={handleRepsChange}
            className="pr-8"
            aria-label={`Reps for set ${setNumber + 1}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500 text-sm">
            reps
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        {/* Complete button */}
        <Button
          type="button"
          size="icon"
          variant={set.completed ? 'default' : 'outline'}
          onClick={toggleCompleted}
          aria-label={set.completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={set.completed ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Check size={16} />
        </Button>

        {/* Delete button */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onDelete}
          aria-label="Delete set"
        >
          <Trash2 size={16} />
        </Button>

        {/* More options button */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onAddNote}
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </Button>
      </div>
    </div>
  );
}
