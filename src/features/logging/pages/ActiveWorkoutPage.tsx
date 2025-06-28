/**
 * ActiveWorkoutPage Component
 *
 * Main page for logging an active workout session.
 * Allows users to add exercises, log sets, and complete the workout.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ExercisePicker } from '../../../components/shared/ExercisePicker';
import { ExerciseLogCard } from '../components/ExerciseLogCard';
import { useActiveWorkout, type ActiveSet } from '../hooks/useActiveWorkout';
import { type ExerciseDefinition } from '../../../types/data.types';

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const {
    activeWorkout,
    isWorkoutActive,
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateSetNotes,
    completeWorkout,
    discardWorkout,
  } = useActiveWorkout();

  // State for exercise picker dialog
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  // State for finish workout confirmation
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  // State for discard workout confirmation
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  // State for tracking if workout is being saved
  const [isSaving, setIsSaving] = useState(false);

  // Start a new workout if none is active
  if (!isWorkoutActive) {
    startWorkout();
    return <div className="p-4">Starting workout...</div>;
  }

  // Handle adding an exercise
  const handleAddExercise = (exercise: ExerciseDefinition) => {
    addExercise(exercise);
    // Automatically add the first set
    setTimeout(() => {
      addSet(exercise.id!);
    }, 0);
  };

  // Handle completing the workout
  const handleCompleteWorkout = async () => {
    try {
      setIsSaving(true);
      await completeWorkout();
      navigate('/workouts'); // Navigate back to workouts page
    } catch (error) {
      console.error('Failed to complete workout:', error);
      setIsSaving(false);
    }
  };

  // Handle discarding the workout
  const handleDiscardWorkout = () => {
    discardWorkout();
    navigate('/workouts'); // Navigate back to workouts page
  };

  // Handle adding a note to a set
  const handleAddNote = (exerciseId: string, setId: string) => {
    // For now, just add a placeholder note
    // In a future story, this could open a dialog for entering notes
    updateSetNotes(exerciseId, setId, 'Note added');
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDiscardConfirmation(true)}
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">New Workout</h1>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowFinishConfirmation(true)}
          disabled={isSaving}
        >
          <Check size={16} className="mr-1" />
          Finish
        </Button>
      </div>

      {/* Exercise list */}
      {activeWorkout?.exercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No exercises added yet.</p>
          <Button variant="default" onClick={() => setIsExercisePickerOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Exercise
          </Button>
        </div>
      ) : (
        <>
          {/* Exercise cards */}
          <div className="space-y-4 mb-6">
            {activeWorkout?.exercises.map(exercise => (
              <ExerciseLogCard
                key={exercise.exerciseDefinitionId}
                exercise={exercise}
                onAddSet={(initialValues?: Partial<ActiveSet>) =>
                  addSet(exercise.exerciseDefinitionId, initialValues)
                }
                onUpdateSet={(setId, updates) =>
                  updateSet(exercise.exerciseDefinitionId, setId, updates)
                }
                onRemoveSet={setId => removeSet(exercise.exerciseDefinitionId, setId)}
                onRemoveExercise={() => removeExercise(exercise.exerciseDefinitionId)}
                onAddNote={setId => handleAddNote(exercise.exerciseDefinitionId, setId)}
              />
            ))}
          </div>

          {/* Add exercise button */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setIsExercisePickerOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Add Another Exercise
          </Button>
        </>
      )}

      {/* Exercise picker dialog */}
      <ExercisePicker
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelectExercise={handleAddExercise}
      />

      {/* Finish workout confirmation */}
      {showFinishConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Finish Workout</h3>
            <p className="mb-4">Are you sure you want to finish and save this workout?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFinishConfirmation(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="default" onClick={handleCompleteWorkout} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Finish Workout'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Discard workout confirmation */}
      {showDiscardConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Discard Workout</h3>
            <p className="mb-4">
              Are you sure you want to discard this workout? All progress will be lost.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDiscardConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDiscardWorkout}>
                Discard Workout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
