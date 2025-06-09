/**
 * StrongLog V1.0 Data Service
 *
 * This file provides wrapper functions for CRUD operations on the database entities.
 * Each function validates data using Zod schemas before writing to the database.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type {
  UserSettings,
  ExerciseDefinition,
  WorkoutLog,
  LoggedSet,
} from '../../types/data.types';
import {
  userSettingsSchema,
  exerciseDefinitionSchema,
  workoutLogSchema,
  loggedSetSchema,
} from '../../types/data.types';

// ==================== UserSettings ====================

/**
 * Get user settings
 * @returns The user settings object, or undefined if not found
 */
export async function getUserSettings(): Promise<UserSettings | undefined> {
  try {
    // There should only be one user settings object with id 1
    const settings = await db.userSettings.get(1);
    return settings;
  } catch (error) {
    console.error('Failed to get user settings:', error);
    throw error;
  }
}

/**
 * Update user settings
 * @param settings The updated user settings
 * @returns The updated user settings
 */
export async function updateUserSettings(settings: UserSettings): Promise<UserSettings> {
  try {
    // Validate settings with Zod schema
    const validatedSettings = userSettingsSchema.parse(settings);

    // Ensure id is 1 for the single settings object
    const settingsToUpdate = { ...validatedSettings, id: 1 };

    // Update or create settings
    await db.userSettings.put(settingsToUpdate);

    return settingsToUpdate;
  } catch (error) {
    console.error('Failed to update user settings:', error);
    throw error;
  }
}

// ==================== ExerciseDefinition ====================

/**
 * Get all exercise definitions
 * @returns Array of all exercise definitions
 */
export async function getAllExerciseDefinitions(): Promise<ExerciseDefinition[]> {
  try {
    return await db.exerciseDefinitions.toArray();
  } catch (error) {
    console.error('Failed to get all exercise definitions:', error);
    throw error;
  }
}

/**
 * Get exercise definitions by muscle group
 * @param muscleGroup The muscle group to filter by
 * @returns Array of matching exercise definitions
 */
export async function getExerciseDefinitionsByMuscleGroup(
  muscleGroup: string
): Promise<ExerciseDefinition[]> {
  try {
    return await db.exerciseDefinitions.where('primaryMuscleGroups').equals(muscleGroup).toArray();
  } catch (error) {
    console.error(`Failed to get exercise definitions for muscle group ${muscleGroup}:`, error);
    throw error;
  }
}

/**
 * Get an exercise definition by ID
 * @param id The ID of the exercise definition
 * @returns The exercise definition, or undefined if not found
 */
export async function getExerciseDefinitionById(
  id: string
): Promise<ExerciseDefinition | undefined> {
  try {
    return await db.exerciseDefinitions.get(id);
  } catch (error) {
    console.error(`Failed to get exercise definition with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new exercise definition
 * @param exerciseDefinition The exercise definition to create
 * @returns The created exercise definition with its ID
 */
export async function createExerciseDefinition(
  exerciseDefinition: ExerciseDefinition
): Promise<ExerciseDefinition> {
  try {
    // Validate with Zod schema
    const validatedExercise = exerciseDefinitionSchema.parse(exerciseDefinition);

    // Generate UUID if not provided
    const exerciseToCreate = {
      ...validatedExercise,
      id: validatedExercise.id || uuidv4(),
    };

    // Add to database
    await db.exerciseDefinitions.add(exerciseToCreate);

    return exerciseToCreate;
  } catch (error) {
    console.error('Failed to create exercise definition:', error);
    throw error;
  }
}

/**
 * Update an exercise definition
 * @param exerciseDefinition The exercise definition to update
 * @returns The updated exercise definition
 */
export async function updateExerciseDefinition(
  exerciseDefinition: ExerciseDefinition
): Promise<ExerciseDefinition> {
  try {
    // Ensure ID exists
    if (!exerciseDefinition.id) {
      throw new Error('Exercise definition ID is required for updates');
    }

    // Validate with Zod schema
    const validatedExercise = exerciseDefinitionSchema.parse(exerciseDefinition);

    // Update in database
    await db.exerciseDefinitions.update(validatedExercise.id as string, validatedExercise);

    return validatedExercise;
  } catch (error) {
    console.error('Failed to update exercise definition:', error);
    throw error;
  }
}

/**
 * Delete an exercise definition
 * @param id The ID of the exercise definition to delete
 * @returns True if deleted, false if not found
 */
export async function deleteExerciseDefinition(id: string): Promise<boolean> {
  try {
    // Check if the record exists first
    const exists = await db.exerciseDefinitions.get(id);
    if (!exists) return false;

    // Delete from database
    await db.exerciseDefinitions.delete(id);

    // Return true since we confirmed the record existed before deletion
    return true;
  } catch (error) {
    console.error(`Failed to delete exercise definition with ID ${id}:`, error);
    throw error;
  }
}

// ==================== WorkoutLog ====================

/**
 * Get all workout logs
 * @returns Array of all workout logs
 */
export async function getAllWorkoutLogs(): Promise<WorkoutLog[]> {
  try {
    return await db.workoutLogs
      .orderBy('startTime')
      .reverse() // Most recent first
      .toArray();
  } catch (error) {
    console.error('Failed to get all workout logs:', error);
    throw error;
  }
}

/**
 * Get a workout log by ID
 * @param id The ID of the workout log
 * @returns The workout log, or undefined if not found
 */
export async function getWorkoutLogById(id: string): Promise<WorkoutLog | undefined> {
  try {
    return await db.workoutLogs.get(id);
  } catch (error) {
    console.error(`Failed to get workout log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new workout log
 * @param workoutLog The workout log to create
 * @returns The created workout log with its ID
 */
export async function createWorkoutLog(workoutLog: WorkoutLog): Promise<WorkoutLog> {
  try {
    // Validate with Zod schema
    const validatedWorkout = workoutLogSchema.parse(workoutLog);

    // Generate UUID if not provided
    const workoutToCreate = {
      ...validatedWorkout,
      id: validatedWorkout.id || uuidv4(),
    };

    // Add to database
    await db.workoutLogs.add(workoutToCreate);

    return workoutToCreate;
  } catch (error) {
    console.error('Failed to create workout log:', error);
    throw error;
  }
}

/**
 * Update a workout log
 * @param workoutLog The workout log to update
 * @returns The updated workout log
 */
export async function updateWorkoutLog(workoutLog: WorkoutLog): Promise<WorkoutLog> {
  try {
    // Ensure ID exists
    if (!workoutLog.id) {
      throw new Error('Workout log ID is required for updates');
    }

    // Validate with Zod schema
    const validatedWorkout = workoutLogSchema.parse(workoutLog);

    // Update in database
    await db.workoutLogs.update(validatedWorkout.id as string, validatedWorkout);

    return validatedWorkout;
  } catch (error) {
    console.error('Failed to update workout log:', error);
    throw error;
  }
}

/**
 * Delete a workout log and all its associated sets
 * @param id The ID of the workout log to delete
 * @returns True if deleted, false if not found
 */
export async function deleteWorkoutLog(id: string): Promise<boolean> {
  try {
    // Use transaction to ensure atomicity when deleting workout and its sets
    return await db.transaction('rw', [db.workoutLogs, db.loggedSets], async () => {
      // Delete all sets associated with this workout
      await db.loggedSets.where('workoutLogId').equals(id).delete();

      // Check if the workout exists first
      const exists = await db.workoutLogs.get(id);
      if (!exists) return false;

      // Delete the workout log
      await db.workoutLogs.delete(id);

      // Return true since we confirmed the record existed before deletion
      return true;
    });
  } catch (error) {
    console.error(`Failed to delete workout log with ID ${id}:`, error);
    throw error;
  }
}

// ==================== LoggedSet ====================

/**
 * Get all sets for a workout
 * @param workoutLogId The ID of the workout log
 * @returns Array of all sets for the workout
 */
export async function getSetsByWorkoutId(workoutLogId: string): Promise<LoggedSet[]> {
  try {
    return await db.loggedSets
      .where('workoutLogId')
      .equals(workoutLogId)
      .sortBy('[orderInWorkout+orderInExercise]'); // Sort by exercise order, then set order
  } catch (error) {
    console.error(`Failed to get sets for workout ${workoutLogId}:`, error);
    throw error;
  }
}

/**
 * Get all sets for a specific exercise in a workout
 * @param workoutLogId The ID of the workout log
 * @param exerciseDefinitionId The ID of the exercise definition
 * @returns Array of all sets for the exercise in the workout
 */
export async function getSetsByWorkoutAndExercise(
  workoutLogId: string,
  exerciseDefinitionId: string
): Promise<LoggedSet[]> {
  try {
    return await db.loggedSets
      .where('[workoutLogId+exerciseDefinitionId+orderInWorkout]')
      .between(
        [workoutLogId, exerciseDefinitionId, 0],
        [workoutLogId, exerciseDefinitionId, Infinity]
      )
      .sortBy('orderInExercise');
  } catch (error) {
    console.error(
      `Failed to get sets for workout ${workoutLogId} and exercise ${exerciseDefinitionId}:`,
      error
    );
    throw error;
  }
}

/**
 * Create a new logged set
 * @param loggedSet The set to create
 * @returns The created set with its ID
 */
export async function createLoggedSet(loggedSet: LoggedSet): Promise<LoggedSet> {
  try {
    // Validate with Zod schema
    const validatedSet = loggedSetSchema.parse(loggedSet);

    // Generate UUID if not provided
    const setToCreate = {
      ...validatedSet,
      id: validatedSet.id || uuidv4(),
    };

    // Add to database
    await db.loggedSets.add(setToCreate);

    return setToCreate;
  } catch (error) {
    console.error('Failed to create logged set:', error);
    throw error;
  }
}

/**
 * Create multiple logged sets in a single transaction
 * @param loggedSets Array of sets to create
 * @returns Array of created sets with their IDs
 */
export async function createLoggedSets(loggedSets: LoggedSet[]): Promise<LoggedSet[]> {
  try {
    // Validate each set with Zod schema
    const validatedSets = loggedSets.map(set => {
      const validatedSet = loggedSetSchema.parse(set);
      return {
        ...validatedSet,
        id: validatedSet.id || uuidv4(),
      };
    });

    // Add all sets in a single transaction
    await db.loggedSets.bulkAdd(validatedSets);

    return validatedSets;
  } catch (error) {
    console.error('Failed to create logged sets:', error);
    throw error;
  }
}

/**
 * Update a logged set
 * @param loggedSet The set to update
 * @returns The updated set
 */
export async function updateLoggedSet(loggedSet: LoggedSet): Promise<LoggedSet> {
  try {
    // Ensure ID exists
    if (!loggedSet.id) {
      throw new Error('Logged set ID is required for updates');
    }

    // Validate with Zod schema
    const validatedSet = loggedSetSchema.parse(loggedSet);

    // Update in database
    await db.loggedSets.update(validatedSet.id as string, validatedSet);

    return validatedSet;
  } catch (error) {
    console.error('Failed to update logged set:', error);
    throw error;
  }
}

/**
 * Delete a logged set
 * @param id The ID of the set to delete
 * @returns True if deleted, false if not found
 */
export async function deleteLoggedSet(id: string): Promise<boolean> {
  try {
    // Check if the record exists first
    const exists = await db.loggedSets.get(id);
    if (!exists) return false;

    // Delete from database
    await db.loggedSets.delete(id);

    // Return true since we confirmed the record existed before deletion
    return true;
  } catch (error) {
    console.error(`Failed to delete logged set with ID ${id}:`, error);
    throw error;
  }
}
