/**
 * Unit tests for the data service
 */

import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { db } from './db';
import {
  getUserSettings,
  updateUserSettings,
  getAllExerciseDefinitions,
  getExerciseDefinitionsByMuscleGroup,
  getExerciseDefinitionById,
  createExerciseDefinition,
  updateExerciseDefinition,
  deleteExerciseDefinition,
  getAllWorkoutLogs,
  getWorkoutLogById,
  createWorkoutLog,
  updateWorkoutLog,
  deleteWorkoutLog,
  getSetsByWorkoutId,
  getSetsByWorkoutAndExercise,
  createLoggedSet,
  createLoggedSets,
  updateLoggedSet,
  deleteLoggedSet,
} from './dataService';
import { ZodError } from 'zod';
import type { ExerciseDefinition, LoggedSet } from '../../types/data.types';

// Mock console methods
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Data Service', () => {
  // Reset database before each test
  beforeEach(async () => {
    // Clear all tables instead of deleting the database
    await db.open();
    await Promise.all([
      db.userSettings.clear(),
      db.exerciseDefinitions.clear(),
      db.workoutLogs.clear(),
      db.loggedSets.clear(),
      db.workoutTemplates.clear(),
      db.workoutTemplateExerciseInstances.clear(),
      db.programDefinitions.clear(),
      db.activeProgramInstances.clear(),
      db.progressionRules.clear(),
      db.userGoals.clear(),
      db.userBodyweightLog.clear(),
      db.appliedProgressionLog.clear(),
    ]);
  });

  // Close database after each test
  afterEach(async () => {
    await db.close();
  });

  describe('UserSettings', () => {
    it('should return undefined if user settings do not exist', async () => {
      const settings = await getUserSettings();
      expect(settings).toBeUndefined();
    });

    it('should create and update user settings', async () => {
      // Create initial settings
      const settings = await updateUserSettings({
        preferredWeightUnit: 'kg',
        theme: 'light',
        defaultRestTimerSecs: 60,
      });

      // Check that settings were created with id 1
      expect(settings.id).toBe(1);
      expect(settings.preferredWeightUnit).toBe('kg');
      expect(settings.theme).toBe('light');
      expect(settings.defaultRestTimerSecs).toBe(60);

      // Get settings and verify
      const retrievedSettings = await getUserSettings();
      expect(retrievedSettings).toEqual(settings);

      // Update settings
      const updatedSettings = await updateUserSettings({
        ...settings,
        preferredWeightUnit: 'lbs',
        theme: 'dark',
      });

      // Check that settings were updated
      expect(updatedSettings.id).toBe(1);
      expect(updatedSettings.preferredWeightUnit).toBe('lbs');
      expect(updatedSettings.theme).toBe('dark');
      expect(updatedSettings.defaultRestTimerSecs).toBe(60);

      // Get updated settings and verify
      const retrievedUpdatedSettings = await getUserSettings();
      expect(retrievedUpdatedSettings).toEqual(updatedSettings);
    });

    it('should validate user settings with Zod schema', async () => {
      // Testing invalid weight unit
      await expect(
        updateUserSettings({
          preferredWeightUnit: 'invalid' as 'kg' | 'lbs',
          theme: 'light',
          defaultRestTimerSecs: 60,
        })
      ).rejects.toThrow(ZodError);

      // Testing invalid theme
      await expect(
        updateUserSettings({
          preferredWeightUnit: 'kg',
          theme: 'invalid' as 'light' | 'dark' | 'system',
          defaultRestTimerSecs: 60,
        })
      ).rejects.toThrow(ZodError);

      // Testing invalid rest timer value
      await expect(
        updateUserSettings({
          preferredWeightUnit: 'kg',
          theme: 'light',
          defaultRestTimerSecs: -1,
        })
      ).rejects.toThrow(ZodError);
    });
  });

  describe('ExerciseDefinition', () => {
    it('should create, get, update, and delete exercise definitions', async () => {
      // Create an exercise definition
      const exercise = await createExerciseDefinition({
        name: 'Bench Press',
        equipment: 'Barbell',
        primaryMuscleGroups: ['Chest', 'Triceps'],
        isCustom: false,
        notes: 'Test notes',
      });

      // Check that exercise was created with an id
      expect(exercise.id).toBeDefined();
      expect(exercise.name).toBe('Bench Press');
      expect(exercise.equipment).toBe('Barbell');
      expect(exercise.primaryMuscleGroups).toEqual(['Chest', 'Triceps']);
      expect(exercise.isCustom).toBe(false);
      expect(exercise.notes).toBe('Test notes');

      // Get all exercises and verify
      const allExercises = await getAllExerciseDefinitions();
      expect(allExercises).toHaveLength(1);
      expect(allExercises[0]).toEqual(exercise);

      // Get exercise by ID and verify
      const retrievedExercise = await getExerciseDefinitionById(exercise.id!);
      expect(retrievedExercise).toEqual(exercise);

      // Get exercises by muscle group and verify
      const chestExercises = await getExerciseDefinitionsByMuscleGroup('Chest');
      expect(chestExercises).toHaveLength(1);
      expect(chestExercises[0]).toEqual(exercise);

      const tricepsExercises = await getExerciseDefinitionsByMuscleGroup('Triceps');
      expect(tricepsExercises).toHaveLength(1);
      expect(tricepsExercises[0]).toEqual(exercise);

      const legExercises = await getExerciseDefinitionsByMuscleGroup('Legs');
      expect(legExercises).toHaveLength(0);

      // Update exercise
      const updatedExercise = await updateExerciseDefinition({
        ...exercise,
        name: 'Barbell Bench Press',
        notes: 'Updated notes',
      });

      // Check that exercise was updated
      expect(updatedExercise.id).toBe(exercise.id);
      expect(updatedExercise.name).toBe('Barbell Bench Press');
      expect(updatedExercise.notes).toBe('Updated notes');

      // Get updated exercise and verify
      const retrievedUpdatedExercise = await getExerciseDefinitionById(exercise.id!);
      expect(retrievedUpdatedExercise).toEqual(updatedExercise);

      // Delete exercise
      const deleted = await deleteExerciseDefinition(exercise.id!);
      expect(deleted).toBe(true);

      // Verify exercise was deleted
      const exerciseAfterDelete = await getExerciseDefinitionById(exercise.id!);
      expect(exerciseAfterDelete).toBeUndefined();

      // Verify all exercises are empty
      const allExercisesAfterDelete = await getAllExerciseDefinitions();
      expect(allExercisesAfterDelete).toHaveLength(0);
    });

    it('should validate exercise definitions with Zod schema', async () => {
      // Testing empty name (invalid)
      await expect(
        createExerciseDefinition({
          name: '',
          isCustom: false,
        })
      ).rejects.toThrow(ZodError);

      // Testing missing required field
      await expect(
        createExerciseDefinition({
          name: 'Bench Press',
        } as ExerciseDefinition)
      ).rejects.toThrow(ZodError);
    });
  });

  describe('WorkoutLog and LoggedSet', () => {
    it('should create, get, update, and delete workout logs and sets', async () => {
      // Create an exercise definition first
      const exercise = await createExerciseDefinition({
        name: 'Bench Press',
        equipment: 'Barbell',
        primaryMuscleGroups: ['Chest', 'Triceps'],
        isCustom: false,
      });

      // Create a workout log
      const workout = await createWorkoutLog({
        startTime: Date.now() - 3600000, // 1 hour ago
        endTime: Date.now(),
        durationMs: 3600000,
        name: 'Morning Workout',
      });

      // Check that workout was created with an id
      expect(workout.id).toBeDefined();
      expect(workout.name).toBe('Morning Workout');
      expect(workout.durationMs).toBe(3600000);

      // Get all workouts and verify
      const allWorkouts = await getAllWorkoutLogs();
      expect(allWorkouts).toHaveLength(1);
      expect(allWorkouts[0]).toEqual(workout);

      // Get workout by ID and verify
      const retrievedWorkout = await getWorkoutLogById(workout.id!);
      expect(retrievedWorkout).toEqual(workout);

      // Create logged sets for the workout
      const set1 = await createLoggedSet({
        workoutLogId: workout.id!,
        exerciseDefinitionId: exercise.id!,
        orderInWorkout: 0,
        orderInExercise: 0,
        setType: 'standard',
        loggedWeightKg: 100,
        loggedReps: 10,
      });

      const set2 = await createLoggedSet({
        workoutLogId: workout.id!,
        exerciseDefinitionId: exercise.id!,
        orderInWorkout: 0,
        orderInExercise: 1,
        setType: 'standard',
        loggedWeightKg: 100,
        loggedReps: 8,
      });

      // Create multiple sets at once
      const additionalSets = await createLoggedSets([
        {
          workoutLogId: workout.id!,
          exerciseDefinitionId: exercise.id!,
          orderInWorkout: 0,
          orderInExercise: 2,
          setType: 'standard',
          loggedWeightKg: 100,
          loggedReps: 6,
        },
        {
          workoutLogId: workout.id!,
          exerciseDefinitionId: exercise.id!,
          orderInWorkout: 0,
          orderInExercise: 3,
          setType: 'standard',
          loggedWeightKg: 100,
          loggedReps: 4,
        },
      ]);

      // Check that sets were created with ids
      expect(set1.id).toBeDefined();
      expect(set2.id).toBeDefined();
      expect(additionalSets[0].id).toBeDefined();
      expect(additionalSets[1].id).toBeDefined();

      // Get sets by workout ID and verify
      const setsByWorkout = await getSetsByWorkoutId(workout.id!);
      expect(setsByWorkout).toHaveLength(4);

      // Instead of checking exact order, verify all sets are present
      const allSets = [set1, set2, ...additionalSets];
      expect(setsByWorkout).toEqual(expect.arrayContaining(allSets));

      // Verify each set has the correct properties
      setsByWorkout.forEach(set => {
        expect(set.workoutLogId).toBe(workout.id);
        expect(set.exerciseDefinitionId).toBe(exercise.id);
        expect(set).toHaveProperty('id');
        expect(set).toHaveProperty('orderInWorkout');
        expect(set).toHaveProperty('orderInExercise');
        expect(set).toHaveProperty('setType');
      });

      // Get sets by workout and exercise ID and verify
      const setsByWorkoutAndExercise = await getSetsByWorkoutAndExercise(workout.id!, exercise.id!);
      expect(setsByWorkoutAndExercise).toHaveLength(4);

      // Instead of checking exact order, verify all sets are present
      expect(setsByWorkoutAndExercise).toEqual(expect.arrayContaining(allSets));

      // Verify each set has the correct properties
      setsByWorkoutAndExercise.forEach(set => {
        expect(set.workoutLogId).toBe(workout.id);
        expect(set.exerciseDefinitionId).toBe(exercise.id);
        expect(set).toHaveProperty('id');
        expect(set).toHaveProperty('orderInWorkout');
        expect(set).toHaveProperty('orderInExercise');
        expect(set).toHaveProperty('setType');
      });

      // Update a set
      const updatedSet = await updateLoggedSet({
        ...set1,
        loggedWeightKg: 110,
        loggedReps: 8,
        notes: 'Felt heavy',
      });

      // Check that set was updated
      expect(updatedSet.id).toBe(set1.id);
      expect(updatedSet.loggedWeightKg).toBe(110);
      expect(updatedSet.loggedReps).toBe(8);
      expect(updatedSet.notes).toBe('Felt heavy');

      // Delete a set
      const deletedSet = await deleteLoggedSet(set2.id!);
      expect(deletedSet).toBe(true);

      // Verify set was deleted
      const setsByWorkoutAfterDelete = await getSetsByWorkoutId(workout.id!);
      expect(setsByWorkoutAfterDelete).toHaveLength(3);
      expect(setsByWorkoutAfterDelete.find(s => s.id === set2.id)).toBeUndefined();

      // Update workout
      const updatedWorkout = await updateWorkoutLog({
        ...workout,
        name: 'Updated Workout',
        notes: 'Great session',
      });

      // Check that workout was updated
      expect(updatedWorkout.id).toBe(workout.id);
      expect(updatedWorkout.name).toBe('Updated Workout');
      expect(updatedWorkout.notes).toBe('Great session');

      // Delete workout (should also delete all associated sets)
      const deletedWorkout = await deleteWorkoutLog(workout.id!);
      expect(deletedWorkout).toBe(true);

      // Verify workout was deleted
      const workoutAfterDelete = await getWorkoutLogById(workout.id!);
      expect(workoutAfterDelete).toBeUndefined();

      // Verify all sets for the workout were deleted
      const setsAfterDelete = await getSetsByWorkoutId(workout.id!);
      expect(setsAfterDelete).toHaveLength(0);
    });

    it('should validate workout logs with Zod schema', async () => {
      // Test invalid start/end time relationship
      await expect(
        createWorkoutLog({
          startTime: Date.now(),
          endTime: Date.now() - 3600000, // 1 hour before start (invalid)
          durationMs: 3600000,
        })
      ).rejects.toThrow(ZodError);

      // @ts-expect-error - Testing missing required field
      await expect(
        createWorkoutLog({
          startTime: Date.now(),
        })
      ).rejects.toThrow(ZodError);
    });

    it('should validate logged sets with Zod schema', async () => {
      // Create a workout log first
      const workout = await createWorkoutLog({
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        durationMs: 3600000,
      });

      // Create an exercise definition
      const exercise = await createExerciseDefinition({
        name: 'Bench Press',
        isCustom: false,
      });

      // Testing invalid set type
      // We need to cast to unknown first to bypass TypeScript's type checking
      // since we're intentionally testing invalid input
      await expect(
        createLoggedSet({
          workoutLogId: workout.id!,
          exerciseDefinitionId: exercise.id!,
          orderInWorkout: 0,
          orderInExercise: 0,
          setType: 'invalid',
          loggedWeightKg: 100,
          loggedReps: 10,
        } as unknown as LoggedSet)
      ).rejects.toThrow(ZodError);

      // Testing missing required field for standard set
      await expect(
        createLoggedSet({
          workoutLogId: workout.id!,
          exerciseDefinitionId: exercise.id!,
          orderInWorkout: 0,
          orderInExercise: 0,
          setType: 'standard',
          loggedWeightKg: 100,
        } as LoggedSet)
      ).rejects.toThrow(ZodError);

      // Testing missing required field for amrapTime set
      await expect(
        createLoggedSet({
          workoutLogId: workout.id!,
          exerciseDefinitionId: exercise.id!,
          orderInWorkout: 0,
          orderInExercise: 0,
          setType: 'amrapTime',
          loggedWeightKg: 100,
          loggedReps: 10,
        } as LoggedSet)
      ).rejects.toThrow(ZodError);
    });
  });
});
