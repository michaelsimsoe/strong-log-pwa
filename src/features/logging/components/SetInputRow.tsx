/**
 * SetInputRow Component
 *
 * Component for inputting weight and reps for a single set in a workout.
 */

import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Trash2, Check, MoreVertical, AlertCircle, Timer } from 'lucide-react';
import { useUserSettingsStore } from '../../../state/userSettingsStore';
import { type ActiveSet } from '../hooks/useActiveWorkout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';

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
  const [setType, setSetType] = useState<'standard' | 'amrapReps'>(set.setType);

  // Validation state
  const [weightError, setWeightError] = useState<string | null>(null);
  const [repsError, setRepsError] = useState<string | null>(null);

  // Update local state when set prop changes
  useEffect(() => {
    setWeightInput(set.loggedWeightKg.toString());
    setRepsInput(set.loggedReps.toString());
  }, [set.loggedWeightKg, set.loggedReps]);

  // Handle weight input change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeightInput(value);

    // Validate input
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setWeightError('Please enter a valid number');
      return;
    } else if (numValue < 0) {
      setWeightError('Weight cannot be negative');
      return;
    } else {
      setWeightError(null);
      onUpdate({ loggedWeightKg: numValue });
    }
  };

  // Handle reps input change
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepsInput(value);

    // Validate input
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setRepsError('Please enter a valid number');
      return;
    } else if (numValue < 0) {
      setRepsError('Reps cannot be negative');
      return;
    } else {
      setRepsError(null);
      onUpdate({ loggedReps: numValue });
    }
  };

  // Toggle set completion status
  const toggleCompleted = () => {
    onUpdate({ completed: !set.completed });
  };

  // Handle set type change
  const handleSetTypeChange = (value: string) => {
    const newSetType = value as 'standard' | 'amrapReps';
    setSetType(newSetType);
    onUpdate({ setType: newSetType });
  };

  return (
    <div
      className={`flex flex-col gap-2 p-2 rounded-md ${set.completed ? 'bg-green-50 dark:bg-green-950/30' : 'bg-gray-50 dark:bg-gray-900'}`}
    >
      {/* Top row with set number and type selector */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Set {setNumber + 1}</div>

        {/* Set type selector */}
        <Select value={setType} onValueChange={handleSetTypeChange}>
          <SelectTrigger className="w-[140px]" aria-label="Select set type">
            <SelectValue placeholder="Set type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="amrapReps">AMRAP for Reps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inputs row */}
      <div className="flex items-center gap-2">
        {/* Weight input */}
        <div className="flex-1">
          <div className="space-y-1">
            <Label htmlFor={`weight-set-${setNumber}`} className="sr-only">
              Weight for set {setNumber + 1}
            </Label>
            <div className="relative">
              <Input
                id={`weight-set-${setNumber}`}
                type="number"
                min="0"
                step="0.5"
                value={weightInput}
                onChange={handleWeightChange}
                className={`pr-8 ${weightError ? 'border-red-500' : ''}`}
                aria-label={`Weight for set ${setNumber + 1}`}
                aria-invalid={weightError ? 'true' : 'false'}
                aria-describedby={weightError ? `weight-error-${setNumber}` : undefined}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500 text-sm">
                {preferredWeightUnit}
              </div>
            </div>
            {weightError && (
              <div
                id={`weight-error-${setNumber}`}
                className="text-xs text-red-500 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle size={12} />
                {weightError}
              </div>
            )}
          </div>
        </div>

        {/* Reps input */}
        <div className="flex-1">
          <div className="space-y-1">
            <Label htmlFor={`reps-set-${setNumber}`} className="sr-only">
              {set.setType === 'amrapReps' ? 'Achieved reps' : 'Reps'} for set {setNumber + 1}
            </Label>
            <div className="relative">
              <Input
                id={`reps-set-${setNumber}`}
                type="number"
                min="0"
                step="1"
                value={repsInput}
                onChange={handleRepsChange}
                className={`pr-8 ${repsError ? 'border-red-500' : ''}`}
                aria-label={`${set.setType === 'amrapReps' ? 'Achieved reps' : 'Reps'} for set ${setNumber + 1}`}
                aria-invalid={repsError ? 'true' : 'false'}
                aria-describedby={repsError ? `reps-error-${setNumber}` : undefined}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500 text-sm">
                reps
              </div>
            </div>
            {repsError && (
              <div
                id={`reps-error-${setNumber}`}
                className="text-xs text-red-500 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle size={12} />
                {repsError}
              </div>
            )}
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

      {/* Label for AMRAP sets */}
      {set.setType === 'amrapReps' && (
        <div
          className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1"
          aria-live="polite"
        >
          <Timer size={14} aria-hidden="true" />
          <span>AMRAP: As Many Reps As Possible</span>
        </div>
      )}
    </div>
  );
}
