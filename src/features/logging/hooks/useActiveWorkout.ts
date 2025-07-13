/**
 * useActiveWorkout Hook
 *
 * Custom hook for managing the state of an active workout session.
 * Handles adding exercises, logging sets, and completing the workout.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  type ExerciseDefinition,
  type WorkoutLog,
  type StandardSet,
  type AmrapRepsSet,
  type AmrapTimeSet,
  type RepsForTimeSet,
  type LoggedSet,
} from '../../../types/data.types';
import { saveWorkoutWithSets } from '../../../services/data/workoutService';

// Types for the active workout state
export interface ActiveExercise {
  exerciseDefinitionId: string;
  exerciseDefinition: ExerciseDefinition;
  orderInWorkout: number;
  sets: ActiveSet[];
}

export interface ActiveSet {
  id: string; // Temporary ID for UI management
  orderInExercise: number;
  setType: 'standard' | 'amrapReps' | 'amrapTime' | 'repsForTime';
  loggedWeightKg: number;
  loggedReps: number;
  completed: boolean;
  notes?: string;
  targetWeightKg?: number; // Optional for AMRAP sets
  targetDurationSecs?: number; // For AMRAP Time sets
  targetReps?: number; // For Reps for Time sets
  loggedTimeTakenSecs?: number; // For Reps for Time sets - time taken to complete reps
}

export interface ActiveWorkout {
  startTime: number;
  name?: string;
  exercises: ActiveExercise[];
  notes?: string;
}

interface UseActiveWorkoutReturn {
  // State
  activeWorkout: ActiveWorkout | null;
  isWorkoutActive: boolean;

  // Actions
  startWorkout: () => void;
  addExercise: (exercise: ExerciseDefinition) => void;
  removeExercise: (exerciseDefinitionId: string) => void;
  addSet: (exerciseDefinitionId: string, initialValues?: Partial<ActiveSet>) => void;
  updateSet: (exerciseDefinitionId: string, setId: string, updates: Partial<ActiveSet>) => void;
  removeSet: (exerciseDefinitionId: string, setId: string) => void;
  updateWorkoutNotes: (notes: string) => void;
  updateSetNotes: (exerciseDefinitionId: string, setId: string, notes: string) => void;
  completeWorkout: () => Promise<{ workoutId: string }>;
  discardWorkout: () => void;
}

/**
 * Hook for managing the state of an active workout
 */
export function useActiveWorkout(): UseActiveWorkoutReturn {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);

  // Check if a workout is currently active
  const isWorkoutActive = activeWorkout !== null;

  // Start a new workout
  const startWorkout = useCallback(() => {
    setActiveWorkout({
      startTime: Date.now(),
      exercises: [],
    });
  }, []);

  // Add an exercise to the workout
  const addExercise = useCallback((exercise: ExerciseDefinition) => {
    setActiveWorkout(prev => {
      if (!prev) return prev;

      // Check if exercise already exists in the workout
      const existingExercise = prev.exercises.find(e => e.exerciseDefinitionId === exercise.id);

      if (existingExercise) {
        return prev; // Exercise already exists, don't add it again
      }

      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            exerciseDefinitionId: exercise.id!,
            exerciseDefinition: exercise,
            orderInWorkout: prev.exercises.length,
            sets: [],
          },
        ],
      };
    });
  }, []);

  // Remove an exercise from the workout
  const removeExercise = useCallback((exerciseDefinitionId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return prev;

      const updatedExercises = prev.exercises.filter(
        e => e.exerciseDefinitionId !== exerciseDefinitionId
      );

      // Reorder remaining exercises
      const reorderedExercises = updatedExercises.map((exercise, index) => ({
        ...exercise,
        orderInWorkout: index,
      }));

      return {
        ...prev,
        exercises: reorderedExercises,
      };
    });
  }, []);

  // Add a set to an exercise
  const addSet = useCallback(
    (exerciseDefinitionId: string, initialValues?: Partial<ActiveSet>) => {
      setActiveWorkout(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          exercises: prev.exercises.map(exercise => {
            if (exercise.exerciseDefinitionId !== exerciseDefinitionId) {
              return exercise;
            }

            // Find the previous set for default values
            const previousSet =
              exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1] : null;

            const newSet: ActiveSet = {
              id: uuidv4(),
              orderInExercise: exercise.sets.length + 1,
              setType: initialValues?.setType ?? previousSet?.setType ?? 'standard',
              loggedWeightKg: initialValues?.loggedWeightKg ?? previousSet?.loggedWeightKg ?? 0,
              loggedReps: initialValues?.loggedReps ?? previousSet?.loggedReps ?? 0,
              completed: initialValues?.completed ?? false,
              notes: initialValues?.notes,
              targetWeightKg: initialValues?.targetWeightKg ?? previousSet?.targetWeightKg,
              targetDurationSecs:
                initialValues?.targetDurationSecs ?? previousSet?.targetDurationSecs,
            };

            return {
              ...exercise,
              sets: [...exercise.sets, newSet],
            };
          }),
        };
      });
    },
    [setActiveWorkout]
  );

  // Update a set
  const updateSet = useCallback(
    (exerciseDefinitionId: string, setId: string, updates: Partial<ActiveSet>) => {
      setActiveWorkout(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          exercises: prev.exercises.map(exercise => {
            if (exercise.exerciseDefinitionId !== exerciseDefinitionId) {
              return exercise;
            }

            return {
              ...exercise,
              sets: exercise.sets.map(set => {
                if (set.id !== setId) {
                  return set;
                }

                return {
                  ...set,
                  ...updates,
                };
              }),
            };
          }),
        };
      });
    },
    [setActiveWorkout]
  );

  // Remove a set
  const removeSet = useCallback((exerciseDefinitionId: string, setId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map(exercise => {
          if (exercise.exerciseDefinitionId !== exerciseDefinitionId) {
            return exercise;
          }

          const updatedSets = exercise.sets.filter(set => set.id !== setId);

          // Reorder remaining sets
          const reorderedSets = updatedSets.map((set, index) => ({
            ...set,
            orderInExercise: index,
          }));

          return {
            ...exercise,
            sets: reorderedSets,
          };
        }),
      };
    });
  }, []);

  // Update workout notes
  const updateWorkoutNotes = useCallback((notes: string) => {
    setActiveWorkout(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        notes,
      };
    });
  }, []);

  // Update set notes
  const updateSetNotes = useCallback(
    (exerciseDefinitionId: string, setId: string, notes: string) => {
      updateSet(exerciseDefinitionId, setId, { notes });
    },
    [updateSet]
  );

  // Complete the workout and save it to the database
  const completeWorkout = useCallback(async () => {
    if (!activeWorkout) {
      throw new Error('No active workout to complete');
    }

    const endTime = Date.now();
    const durationMs = endTime - activeWorkout.startTime;

    // Create workout log
    const workoutLog: Omit<WorkoutLog, 'id'> = {
      startTime: activeWorkout.startTime,
      endTime,
      durationMs,
      name: activeWorkout.name,
      notes: activeWorkout.notes,
    };

    // Create logged sets
    const loggedSets: Array<Omit<LoggedSet, 'id' | 'workoutLogId'>> = [];

    activeWorkout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        // Only include completed sets
        if (set.completed) {
          // Create the appropriate set type based on the active set's type
          if (set.setType === 'amrapReps') {
            const loggedSet: Omit<AmrapRepsSet, 'id' | 'workoutLogId'> = {
              exerciseDefinitionId: exercise.exerciseDefinitionId,
              orderInWorkout: exercise.orderInWorkout,
              orderInExercise: set.orderInExercise,
              setType: 'amrapReps',
              targetWeightKg: set.targetWeightKg,
              loggedWeightKg: set.loggedWeightKg,
              loggedReps: set.loggedReps,
              notes: set.notes,
            };
            loggedSets.push(loggedSet);
          } else if (set.setType === 'amrapTime') {
            // AMRAP Time set
            const loggedSet: Omit<AmrapTimeSet, 'id' | 'workoutLogId'> = {
              exerciseDefinitionId: exercise.exerciseDefinitionId,
              orderInWorkout: exercise.orderInWorkout,
              orderInExercise: set.orderInExercise,
              setType: 'amrapTime',
              targetWeightKg: set.targetWeightKg,
              targetDurationSecs: set.targetDurationSecs || 60, // Default to 60 seconds if not set
              loggedWeightKg: set.loggedWeightKg,
              loggedReps: set.loggedReps,
              loggedDurationSecs: set.targetDurationSecs, // Use target duration as logged duration for now
              notes: set.notes,
            };
            loggedSets.push(loggedSet);
          } else if (set.setType === 'repsForTime') {
            // Reps For Time set
            const loggedSet: Omit<RepsForTimeSet, 'id' | 'workoutLogId'> = {
              exerciseDefinitionId: exercise.exerciseDefinitionId,
              orderInWorkout: exercise.orderInWorkout,
              orderInExercise: set.orderInExercise,
              setType: 'repsForTime',
              targetWeightKg: set.targetWeightKg,
              targetReps: set.targetReps || set.loggedReps, // Use logged reps as target if not specified
              loggedWeightKg: set.loggedWeightKg,
              loggedReps: set.loggedReps,
              loggedTimeTakenSecs: set.loggedTimeTakenSecs || 0, // Time taken to complete the reps
              notes: set.notes,
            };
            loggedSets.push(loggedSet);
          } else {
            // Standard set
            const loggedSet: Omit<StandardSet, 'id' | 'workoutLogId'> = {
              exerciseDefinitionId: exercise.exerciseDefinitionId,
              orderInWorkout: exercise.orderInWorkout,
              orderInExercise: set.orderInExercise,
              setType: 'standard',
              loggedWeightKg: set.loggedWeightKg,
              loggedReps: set.loggedReps,
              notes: set.notes,
            };
            loggedSets.push(loggedSet);
          }
        }
      });
    });

    // Save workout and sets to database
    try {
      const result = await saveWorkoutWithSets(workoutLog, loggedSets);

      // Reset active workout
      setActiveWorkout(null);

      return { workoutId: result.workout.id as string };
    } catch (error) {
      console.error('Failed to save workout:', error);
      throw error;
    }
  }, [activeWorkout]);

  // Discard the current workout
  const discardWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  return {
    activeWorkout,
    isWorkoutActive,
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateWorkoutNotes,
    updateSetNotes,
    completeWorkout,
    discardWorkout,
  };
}
