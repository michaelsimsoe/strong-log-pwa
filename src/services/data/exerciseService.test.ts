import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from './db';
import {
  createExercise,
  getAllExercises,
  getCustomExercises,
  getPrePopulatedExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  searchExercisesByName,
} from './exerciseService';
import type { ExerciseDefinition } from '../../types/data.types';
import { ZodError } from 'zod';

// Mock the uuid module
vi.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('Exercise Service', () => {
  // Clear the database before each test
  beforeEach(async () => {
    await db.exerciseDefinitions.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createExercise', () => {
    it('should create a valid exercise', async () => {
      const exercise: Omit<ExerciseDefinition, 'id'> = {
        name: 'Test Exercise',
        equipment: 'Barbell',
        primaryMuscleGroups: ['Chest', 'Triceps'],
        isCustom: true,
      };

      const result = await createExercise(exercise);

      expect(result).toEqual({
        ...exercise,
        id: 'test-uuid',
      });

      // Verify it was added to the database
      const dbExercise = await db.exerciseDefinitions.get('test-uuid');
      expect(dbExercise).toEqual(result);
    });

    it('should throw an error for invalid exercise data', async () => {
      const invalidExercise = {
        // Missing required 'name' field
        equipment: 'Barbell',
        isCustom: true,
      };

      // Using type assertion to test validation error
      // @ts-expect-error - Intentionally passing invalid data to test validation
      await expect(createExercise(invalidExercise)).rejects.toThrow(ZodError);
    });

    it('should throw an error for duplicate exercise name', async () => {
      const exercise = {
        name: 'Duplicate Exercise',
        isCustom: true,
      };

      // Create the first exercise
      await createExercise(exercise);

      // Try to create another with the same name
      await expect(createExercise(exercise)).rejects.toThrow('already exists');
    });
  });

  describe('getAllExercises', () => {
    it('should return all exercises', async () => {
      const exercises = [
        { id: '1', name: 'Exercise 1', isCustom: true, primaryMuscleGroups: [] },
        { id: '2', name: 'Exercise 2', isCustom: false, primaryMuscleGroups: [] },
      ];

      // Add exercises to the database
      await db.exerciseDefinitions.bulkAdd(exercises);

      const result = await getAllExercises();
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining(exercises));
    });

    it('should return an empty array when no exercises exist', async () => {
      const result = await getAllExercises();
      expect(result).toEqual([]);
    });
  });

  describe('getCustomExercises', () => {
    it('should return only custom exercises', async () => {
      // Mock the database query directly
      const mockCustomExercises = [
        {
          id: '1',
          name: 'Custom Exercise',
          isCustom: true,
          primaryMuscleGroups: [],
        },
      ];

      // Mock the database toArray method
      const originalToArray = db.exerciseDefinitions.toArray;
      db.exerciseDefinitions.toArray = vi.fn().mockResolvedValue(mockCustomExercises);

      // Mock the where and equals methods
      const mockWhere = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockCustomExercises),
        }),
      });

      // Replace the where method temporarily
      const originalWhere = db.exerciseDefinitions.where;
      db.exerciseDefinitions.where = mockWhere;

      try {
        const result = await getCustomExercises();

        // Verify the function called the correct methods
        expect(mockWhere).toHaveBeenCalledWith('isCustom');
        expect(result).toEqual(mockCustomExercises);
      } finally {
        // Restore original methods
        db.exerciseDefinitions.where = originalWhere;
        db.exerciseDefinitions.toArray = originalToArray;
      }
    });
  });

  describe('getPrePopulatedExercises', () => {
    it('should return only pre-populated exercises', async () => {
      // Mock the database query directly
      const mockPrePopulatedExercises = [
        {
          id: '2',
          name: 'Pre-populated Exercise',
          isCustom: false,
          primaryMuscleGroups: [],
        },
      ];

      // Mock the where and equals methods
      const mockWhere = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockPrePopulatedExercises),
        }),
      });

      // Replace the where method temporarily
      const originalWhere = db.exerciseDefinitions.where;
      db.exerciseDefinitions.where = mockWhere;

      try {
        const result = await getPrePopulatedExercises();

        // Verify the function called the correct methods
        expect(mockWhere).toHaveBeenCalledWith('isCustom');
        expect(result).toEqual(mockPrePopulatedExercises);
      } finally {
        // Restore original method
        db.exerciseDefinitions.where = originalWhere;
      }
    });
  });

  describe('searchExercisesByName', () => {
    it('should return exercises matching the search term', async () => {
      const exercises = [
        { id: '1', name: 'Bench Press', isCustom: true, primaryMuscleGroups: [] },
        { id: '2', name: 'Squat', isCustom: false, primaryMuscleGroups: [] },
        { id: '3', name: 'Incline Bench Press', isCustom: false, primaryMuscleGroups: [] },
      ];

      // Add exercises to the database
      await db.exerciseDefinitions.bulkAdd(exercises);

      const result = await searchExercisesByName('bench');
      expect(result).toHaveLength(2);
      expect(result.map(e => e.name)).toEqual(['Bench Press', 'Incline Bench Press']);
    });

    it('should be case-insensitive', async () => {
      const exercises = [
        { id: '1', name: 'Bench Press', isCustom: true, primaryMuscleGroups: [] },
        { id: '2', name: 'DEADLIFT', isCustom: false, primaryMuscleGroups: [] },
      ];

      // Add exercises to the database
      await db.exerciseDefinitions.bulkAdd(exercises);

      const result = await searchExercisesByName('deadlift');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('DEADLIFT');
    });
  });

  describe('getExerciseById', () => {
    it('should return the exercise with the given id', async () => {
      const exercise = {
        id: 'test-id',
        name: 'Test Exercise',
        isCustom: true,
        primaryMuscleGroups: [],
      };

      // Add exercise to the database
      await db.exerciseDefinitions.add(exercise);

      const result = await getExerciseById('test-id');
      expect(result).toEqual(exercise);
    });

    it('should return undefined for non-existent id', async () => {
      const result = await getExerciseById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('updateExercise', () => {
    it('should update an existing exercise', async () => {
      const exercise = {
        id: 'test-id',
        name: 'Original Name',
        equipment: 'Barbell',
        isCustom: true,
        primaryMuscleGroups: [],
      };

      // Add exercise to the database
      await db.exerciseDefinitions.add(exercise);

      const updatedData = {
        name: 'Updated Name',
        equipment: 'Dumbbell',
        isCustom: true,
        primaryMuscleGroups: [],
      };

      const result = await updateExercise('test-id', updatedData);
      expect(result).toEqual({
        ...updatedData,
        id: 'test-id',
      });

      // Verify it was updated in the database
      const dbExercise = await db.exerciseDefinitions.get('test-id');
      expect(dbExercise?.name).toBe('Updated Name');
      expect(dbExercise?.equipment).toBe('Dumbbell');
    });

    it('should throw an error if the exercise does not exist', async () => {
      const updatedData = {
        name: 'Updated Name',
        isCustom: true,
      };

      await expect(updateExercise('non-existent-id', updatedData)).rejects.toThrow('not found');
    });

    it('should throw an error for duplicate name', async () => {
      // Add two exercises
      await db.exerciseDefinitions.bulkAdd([
        { id: 'id1', name: 'Exercise 1', isCustom: true, primaryMuscleGroups: [] },
        { id: 'id2', name: 'Exercise 2', isCustom: true, primaryMuscleGroups: [] },
      ]);

      // Try to update id2 to have the same name as id1
      const updatedData = {
        name: 'Exercise 1',
        isCustom: true,
      };

      await expect(updateExercise('id2', updatedData)).rejects.toThrow('already exists');
    });
  });

  describe('deleteExercise', () => {
    it('should delete a custom exercise', async () => {
      const exercise = {
        id: 'test-id',
        name: 'Custom Exercise',
        isCustom: true,
        primaryMuscleGroups: [],
      };

      // Add exercise to the database
      await db.exerciseDefinitions.add(exercise);

      const result = await deleteExercise('test-id');
      expect(result).toBe(true);

      // Verify it was deleted from the database
      const dbExercise = await db.exerciseDefinitions.get('test-id');
      expect(dbExercise).toBeUndefined();
    });

    it('should return false if the exercise does not exist', async () => {
      const result = await deleteExercise('non-existent-id');
      expect(result).toBe(false);
    });

    it('should throw an error when trying to delete a pre-populated exercise', async () => {
      const exercise = {
        id: 'test-id',
        name: 'Pre-populated Exercise',
        isCustom: false,
        primaryMuscleGroups: [],
      };

      // Add exercise to the database
      await db.exerciseDefinitions.add(exercise);

      await expect(deleteExercise('test-id')).rejects.toThrow(
        'Cannot delete pre-populated exercises'
      );
    });
  });
});
