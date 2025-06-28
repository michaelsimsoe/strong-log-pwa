/**
 * ExerciseLogCard Component
 *
 * Component for displaying and managing sets for an exercise in the active workout.
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2, History } from 'lucide-react';
import { SetInputRow } from './SetInputRow';
import { type ActiveExercise, type ActiveSet } from '../hooks/useActiveWorkout';

interface ExerciseLogCardProps {
  exercise: ActiveExercise;
  onAddSet: (initialValues?: Partial<ActiveSet>) => void;
  onUpdateSet: (setId: string, updates: Partial<ActiveSet>) => void;
  onRemoveSet: (setId: string) => void;
  onRemoveExercise: () => void;
  onAddNote: (setId: string) => void;
}

export function ExerciseLogCard({
  exercise,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveExercise,
  onAddNote,
}: ExerciseLogCardProps) {
  // State for showing confirmation dialog
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{exercise.exerciseDefinition.name}</CardTitle>
        <div className="flex gap-1">
          <Button type="button" size="icon" variant="ghost" aria-label="View exercise history">
            <History size={18} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove exercise"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Set headers */}
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="w-16 text-sm font-medium text-gray-500">Set</div>
          <div className="flex-1 text-sm font-medium text-gray-500">Weight</div>
          <div className="flex-1 text-sm font-medium text-gray-500">Reps</div>
          <div className="w-[108px]"></div> {/* Space for action buttons */}
        </div>

        {/* Set input rows */}
        {exercise.sets.length > 0 ? (
          <div className="space-y-2">
            {exercise.sets.map((set, index) => (
              <SetInputRow
                key={set.id}
                setNumber={index}
                set={set}
                onUpdate={updates => onUpdateSet(set.id, updates)}
                onDelete={() => onRemoveSet(set.id)}
                onAddNote={() => onAddNote(set.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No sets added yet. Click "Add Set" to start logging.
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirmation && (
          <div className="mt-4 p-3 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm mb-2">Remove this exercise from your workout?</p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  onRemoveExercise();
                  setShowDeleteConfirmation(false);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <Button type="button" variant="outline" className="w-full" onClick={() => onAddSet()}>
          <Plus size={16} className="mr-2" />
          Add Set
        </Button>
      </CardFooter>
    </Card>
  );
}
