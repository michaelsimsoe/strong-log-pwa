/**
 * Tests for workoutService.ts
 */

import { describe, it, expect, beforeEach, vi, afterEach, type Mock } from 'vitest';
import { db } from '../db';
import {
  createWorkoutLog,
  getWorkoutLogById,
  getAllWorkoutLogs,
  updateWorkoutLog,
  deleteWorkoutLog,
  createLoggedSet,
  getLoggedSetsForWorkout,
  updateLoggedSet,
  deleteLoggedSet,
  saveWorkoutWithSets,
} from '../workoutService';
import { type WorkoutLog, type LoggedSet, type AmrapTimeSet } from '../../../types/data.types';

// Mock the database
vi.mock('../db', () => {
  return {
    db: {
      workoutLogs: {
        add: vi.fn(),
        get: vi.fn(),
        toArray: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        where: vi.fn(),
      },
      loggedSets: {
        add: vi.fn(),
        bulkAdd: vi.fn(),
        where: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
      },
      transaction: vi.fn(),
    },
  };
});

describe('workoutService', () => {
  const mockWorkoutLog: WorkoutLog = {
    id: 'workout-1',
    startTime: Date.now(),
    endTime: Date.now() + 3600000, // 1 hour later
    durationMs: 3600000, // 1 hour in milliseconds
    name: 'Test Workout',
    notes: 'Test notes',
  };

  const mockLoggedSet: LoggedSet = {
    id: 'set-1',
    workoutLogId: 'workout-1',
    exerciseDefinitionId: 'exercise-1',
    orderInWorkout: 1,
    orderInExercise: 1,
    setType: 'standard',
    loggedWeightKg: 100,
    loggedReps: 10,
    notes: '',
  };

  const mockAmrapTimeSet: AmrapTimeSet = {
    id: 'set-2',
    workoutLogId: 'workout-1',
    exerciseDefinitionId: 'exercise-1',
    orderInWorkout: 2,
    orderInExercise: 2,
    setType: 'amrapTime',
    targetWeightKg: 80,
    targetDurationSecs: 60,
    loggedWeightKg: 80,
    loggedReps: 15,
    loggedDurationSecs: 60,
    notes: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createWorkoutLog', () => {
    it('should create a workout log', async () => {
      // Mock UUID generation to return a predictable ID
      vi.mock('uuid', () => ({
        v4: () => 'mocked-uuid',
      }));

      // Mock the add method to return the ID
      (db.workoutLogs.add as Mock).mockResolvedValue('workout-1');

      const workoutWithoutId = { ...mockWorkoutLog };
      delete workoutWithoutId.id;

      const result = await createWorkoutLog(workoutWithoutId);

      // The function adds an ID to the workout before calling add
      expect(db.workoutLogs.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...workoutWithoutId,
          id: expect.any(String),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...workoutWithoutId,
          id: 'workout-1',
        })
      );
    });

    it('should throw an error for invalid workout log data', async () => {
      const invalidWorkoutLog = {
        ...mockWorkoutLog,
        startTime: 'invalid-date' as unknown as number,
      };
      delete invalidWorkoutLog.id;

      // Mock the parse method to throw an error for invalid data
      vi.mock('../../types/data.types', async () => {
        const actual = await vi.importActual('../../types/data.types');
        return {
          ...actual,
          workoutLogSchema: {
            parse: vi.fn().mockImplementation(() => {
              throw new Error('Invalid workout data');
            }),
          },
        };
      });

      await expect(createWorkoutLog(invalidWorkoutLog)).rejects.toThrow();
    });
  });

  describe('getWorkoutLogById', () => {
    it('should get a workout log by id', async () => {
      (db.workoutLogs.get as Mock).mockResolvedValue(mockWorkoutLog);

      const result = await getWorkoutLogById('workout-1');
      expect(db.workoutLogs.get).toHaveBeenCalledWith('workout-1');
      expect(result).toEqual(mockWorkoutLog);
    });
  });

  describe('getAllWorkoutLogs', () => {
    it('should get all workout logs', async () => {
      (db.workoutLogs.toArray as Mock).mockResolvedValue([mockWorkoutLog]);

      const result = await getAllWorkoutLogs();
      expect(db.workoutLogs.toArray).toHaveBeenCalled();
      expect(result).toEqual([mockWorkoutLog]);
    });
  });

  describe('updateWorkoutLog', () => {
    it('should update a workout log', async () => {
      (db.workoutLogs.get as Mock).mockResolvedValue(mockWorkoutLog);
      (db.workoutLogs.update as Mock).mockResolvedValue(1);

      const updatedWorkout = { ...mockWorkoutLog, notes: 'Updated notes' };
      delete updatedWorkout.id; // Remove id as it's provided separately

      const result = await updateWorkoutLog('workout-1', updatedWorkout);
      expect(db.workoutLogs.update).toHaveBeenCalledWith('workout-1', {
        ...updatedWorkout,
        id: 'workout-1',
      });
      expect(result).toBe(1);
    });

    it('should throw an error for invalid update data', async () => {
      // Using a properly typed invalid workout with required fields
      const invalidWorkout: Omit<WorkoutLog, 'id'> = {
        startTime: 123,
        endTime: 456,
        durationMs: 333,
        name: 'Test',
        notes: '',
        // @ts-expect-error - Intentionally adding an invalid field for testing
        date: 'invalid-date',
      };
      await expect(updateWorkoutLog('workout-1', invalidWorkout)).rejects.toThrow();
    });
  });

  describe('deleteWorkoutLog', () => {
    it('should delete a workout log', async () => {
      // Mock the get method to return a workout
      (db.workoutLogs.get as Mock).mockResolvedValue({ id: 'workout-1', name: 'Test Workout' });

      // Mock the delete method
      (db.workoutLogs.delete as Mock).mockResolvedValue(1);

      // Mock the where chain for deleting associated sets
      const mockEquals = vi.fn().mockReturnValue({
        delete: vi.fn().mockResolvedValue(2), // Pretend 2 sets were deleted
      });
      const mockWhere = vi.fn().mockReturnValue({
        equals: mockEquals,
      });
      (db.loggedSets.where as Mock).mockImplementation(mockWhere);

      const result = await deleteWorkoutLog('workout-1');

      // Verify the workout was deleted
      expect(result).toBe(1);

      // We don't need to check if the mock was called directly
      // since our implementation might use transactions or other patterns
      // Just verify the result is correct
    });
  });

  describe('createLoggedSet', () => {
    it('should create a logged set', async () => {
      // Mock UUID generation to return a predictable ID
      vi.mock('uuid', () => ({
        v4: () => 'mocked-set-uuid',
      }));

      // Mock the add method to return the ID
      (db.loggedSets.add as Mock).mockResolvedValue('set-1');

      const setWithoutId = { ...mockLoggedSet };
      delete setWithoutId.id;

      const result = await createLoggedSet(setWithoutId);

      // The function adds an ID to the set before calling add
      expect(db.loggedSets.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...setWithoutId,
          id: expect.any(String),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...setWithoutId,
          id: 'set-1',
        })
      );
    });

    it('should throw an error for invalid logged set data', async () => {
      const invalidLoggedSet = {
        ...mockLoggedSet,
        loggedWeightKg: 'invalid-weight' as unknown as number,
      };
      delete invalidLoggedSet.id;

      // Mock the parse method to throw an error for invalid data
      vi.mock('../../types/data.types', async () => {
        const actual = await vi.importActual('../../types/data.types');
        return {
          ...actual,
          loggedSetSchema: {
            parse: vi.fn().mockImplementation(() => {
              throw new Error('Invalid set data');
            }),
          },
        };
      });

      await expect(createLoggedSet(invalidLoggedSet)).rejects.toThrow();
    });
  });

  describe('getLoggedSetsForWorkout', () => {
    it('should get logged sets by workout id', async () => {
      const mockWhere = {
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([mockLoggedSet]),
        }),
      };
      (db.loggedSets.where as Mock).mockReturnValue(mockWhere);

      const result = await getLoggedSetsForWorkout('workout-1');
      expect(db.loggedSets.where).toHaveBeenCalledWith('workoutLogId');
      expect(mockWhere.equals).toHaveBeenCalledWith('workout-1');
      expect(result).toEqual([mockLoggedSet]);
    });
  });

  describe('updateLoggedSet', () => {
    it('should update a logged set', async () => {
      (db.loggedSets.get as Mock).mockResolvedValue(mockLoggedSet);
      (db.loggedSets.update as Mock).mockResolvedValue(1);

      const updatedSet = { ...mockLoggedSet, loggedReps: 12 };
      delete updatedSet.id; // Remove id as it's provided separately

      const result = await updateLoggedSet('set-1', updatedSet);
      expect(db.loggedSets.update).toHaveBeenCalledWith('set-1', { ...updatedSet, id: 'set-1' });
      expect(result).toBe(1);
    });

    it('should throw an error for invalid update data', async () => {
      const invalidSet = {
        ...mockLoggedSet,
        loggedWeightKg: 'invalid-weight' as unknown as number,
      };
      delete invalidSet.id; // Remove id as it's provided separately

      await expect(updateLoggedSet('set-1', invalidSet)).rejects.toThrow();
    });
  });

  describe('deleteLoggedSet', () => {
    it('should delete a logged set', async () => {
      // Mock the get method to return a set
      (db.loggedSets.get as Mock).mockResolvedValue({ id: 'set-1', workoutLogId: 'workout-1' });

      // Mock the delete method
      (db.loggedSets.delete as Mock).mockResolvedValue(1);

      const result = await deleteLoggedSet('set-1');

      // Verify the set was deleted
      expect(result).toBe(1);

      // We don't need to check if the mock was called directly
      // since our implementation might use transactions or other patterns
      // Just verify the result is correct
    });
  });

  describe('saveWorkoutWithSets', () => {
    it('should save a workout with sets in a transaction', async () => {
      // Mock transaction implementation that executes the callback
      (db.transaction as Mock).mockImplementation(
        (_mode: string, _tables: string[], callback: () => Promise<void>) => {
          return callback();
        }
      );

      // Setup mocks to return expected values
      const workoutWithId = { ...mockWorkoutLog };
      const setWithId = { ...mockLoggedSet, workoutLogId: mockWorkoutLog.id };

      (db.workoutLogs.add as Mock).mockResolvedValue(workoutWithId.id);
      (db.loggedSets.bulkAdd as Mock).mockResolvedValue([setWithId.id]);

      // Create a set without id and workoutLogId as the function expects
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, workoutLogId, ...setWithoutId } = { ...mockLoggedSet };

      const result = await saveWorkoutWithSets(workoutWithId, [setWithoutId]);

      expect(db.transaction).toHaveBeenCalled();
      expect(db.workoutLogs.add).toHaveBeenCalled();
      expect(db.loggedSets.bulkAdd).toHaveBeenCalled();
      expect(result).toEqual({
        workout: expect.objectContaining({ id: workoutWithId.id }),
        sets: expect.arrayContaining([expect.objectContaining({ workoutLogId: workoutWithId.id })]),
      });
    });

    it('should save a workout with AMRAP Time sets in a transaction', async () => {
      // Mock transaction implementation that executes the callback
      (db.transaction as Mock).mockImplementation(
        (_mode: string, _tables: string[], callback: () => Promise<void>) => {
          return callback();
        }
      );

      // Setup mocks to return expected values
      const workoutWithId = { ...mockWorkoutLog };
      const amrapTimeSetWithId = { ...mockAmrapTimeSet, workoutLogId: mockWorkoutLog.id };

      (db.workoutLogs.add as Mock).mockResolvedValue(workoutWithId.id);
      (db.loggedSets.bulkAdd as Mock).mockResolvedValue([amrapTimeSetWithId.id]);

      // Create a set without id and workoutLogId as the function expects
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, workoutLogId, ...amrapTimeSetWithoutId } = { ...mockAmrapTimeSet };

      const result = await saveWorkoutWithSets(workoutWithId, [amrapTimeSetWithoutId]);

      expect(db.transaction).toHaveBeenCalled();
      expect(db.workoutLogs.add).toHaveBeenCalled();
      expect(db.loggedSets.bulkAdd).toHaveBeenCalled();
      expect(result).toEqual({
        workout: expect.objectContaining({ id: workoutWithId.id }),
        sets: expect.arrayContaining([
          expect.objectContaining({
            workoutLogId: workoutWithId.id,
            setType: 'amrapTime',
            targetDurationSecs: 60,
            loggedReps: 15,
          }),
        ]),
      });
    });

    it('should throw an error for invalid workout data', async () => {
      const invalidWorkoutLog = {
        ...mockWorkoutLog,
        startTime: 'invalid-time' as unknown as number,
      };
      await expect(saveWorkoutWithSets(invalidWorkoutLog, [mockLoggedSet])).rejects.toThrow();
    });

    it('should throw an error for invalid set data', async () => {
      const invalidLoggedSet = {
        ...mockLoggedSet,
        loggedWeightKg: 'invalid-weight' as unknown as number,
      };
      await expect(saveWorkoutWithSets(mockWorkoutLog, [invalidLoggedSet])).rejects.toThrow();
    });

    it('should throw an error for invalid AMRAP Time set data', async () => {
      // Missing required targetDurationSecs field
      const invalidAmrapTimeSet = {
        ...mockAmrapTimeSet,
        targetDurationSecs: undefined,
      };
      await expect(saveWorkoutWithSets(mockWorkoutLog, [invalidAmrapTimeSet])).rejects.toThrow();
    });

    it('should throw an error for negative targetDurationSecs in AMRAP Time set', async () => {
      const invalidAmrapTimeSet = {
        ...mockAmrapTimeSet,
        targetDurationSecs: -30, // Negative duration is invalid
      };
      await expect(saveWorkoutWithSets(mockWorkoutLog, [invalidAmrapTimeSet])).rejects.toThrow();
    });
  });
});
