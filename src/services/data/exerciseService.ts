/**
 * Exercise Service
 *
 * Provides CRUD operations for exercise definitions with Zod validation.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { type ExerciseDefinition, exerciseDefinitionSchema } from '../../types/data.types';

/**
 * Create a new exercise definition
 * @param exercise The exercise to create (without ID)
 * @returns The created exercise with ID
 * @throws If validation fails or a duplicate name exists
 */
export async function createExercise(
  exercise: Omit<ExerciseDefinition, 'id'>
): Promise<ExerciseDefinition> {
  // Validate with Zod schema
  const validatedExercise = exerciseDefinitionSchema.parse({
    ...exercise,
    id: uuidv4(), // Generate UUID for new exercise
  });

  try {
    // Check for duplicate name
    const existingExercise = await db.exerciseDefinitions
      .where('name')
      .equals(validatedExercise.name)
      .first();
    if (existingExercise) {
      throw new Error(`An exercise with the name "${validatedExercise.name}" already exists`);
    }

    // Add to database
    const id = await db.exerciseDefinitions.add(validatedExercise);
    return { ...validatedExercise, id: id as string };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create exercise');
  }
}

/**
 * Get all exercise definitions
 * @returns Array of all exercise definitions
 */
export async function getAllExercises(): Promise<ExerciseDefinition[]> {
  return db.exerciseDefinitions.toArray();
}

/**
 * Get custom exercises (created by user)
 * @returns Array of custom exercise definitions
 */
export async function getCustomExercises(): Promise<ExerciseDefinition[]> {
  return db.exerciseDefinitions.where('isCustom').equals(true).toArray();
}

/**
 * Get pre-populated exercises (not created by user)
 * @returns Array of pre-populated exercise definitions
 */
export async function getPrePopulatedExercises(): Promise<ExerciseDefinition[]> {
  return db.exerciseDefinitions.where('isCustom').equals(false).toArray();
}

/**
 * Search exercises by name (case-insensitive partial match)
 * @param searchTerm The search term to match against exercise names
 * @returns Array of matching exercise definitions
 */
export async function searchExercisesByName(searchTerm: string): Promise<ExerciseDefinition[]> {
  const term = searchTerm.toLowerCase();
  return db.exerciseDefinitions
    .filter(exercise => exercise.name.toLowerCase().includes(term))
    .toArray();
}

/**
 * Get an exercise by ID
 * @param id The exercise ID
 * @returns The exercise definition or undefined if not found
 */
export async function getExerciseById(id: string): Promise<ExerciseDefinition | undefined> {
  return db.exerciseDefinitions.get(id);
}

/**
 * Update an existing exercise
 * @param id The exercise ID to update
 * @param exercise The updated exercise data
 * @returns The updated exercise
 * @throws If validation fails, exercise not found, or duplicate name
 */
export async function updateExercise(
  id: string,
  exercise: Omit<ExerciseDefinition, 'id'>
): Promise<ExerciseDefinition> {
  // Validate with Zod schema
  const validatedExercise = exerciseDefinitionSchema.parse({
    ...exercise,
    id,
  });

  // Check if exercise exists
  const existingExercise = await db.exerciseDefinitions.get(id);
  if (!existingExercise) {
    throw new Error(`Exercise with ID ${id} not found`);
  }

  // Check for duplicate name (if name changed)
  if (existingExercise.name !== validatedExercise.name) {
    const duplicateName = await db.exerciseDefinitions
      .where('name')
      .equals(validatedExercise.name)
      .first();

    if (duplicateName) {
      throw new Error(`An exercise with the name "${validatedExercise.name}" already exists`);
    }
  }

  // Update in database
  await db.exerciseDefinitions.update(id, validatedExercise);
  return validatedExercise;
}

/**
 * Delete an exercise by ID
 * @param id The exercise ID to delete
 * @returns true if deleted, false if not found
 * @throws If the exercise is not a custom exercise (cannot delete pre-populated)
 */
export async function deleteExercise(id: string): Promise<boolean> {
  // Check if exercise exists and is custom
  const exercise = await db.exerciseDefinitions.get(id);
  if (!exercise) {
    return false;
  }

  // Only allow deleting custom exercises
  if (!exercise.isCustom) {
    throw new Error('Cannot delete pre-populated exercises');
  }

  // Delete from database
  await db.exerciseDefinitions.delete(id);
  return true;
}
