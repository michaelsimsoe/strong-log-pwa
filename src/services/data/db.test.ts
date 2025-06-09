/**
 * Unit tests for the database setup
 */

import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { db, initDatabase } from './db';

// Mock console methods
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('StrongLogDatabase', () => {
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

  it('should create the database with all required tables', () => {
    // Check that all tables are defined
    expect(db.userSettings).toBeDefined();
    expect(db.exerciseDefinitions).toBeDefined();
    expect(db.workoutLogs).toBeDefined();
    expect(db.loggedSets).toBeDefined();
    expect(db.workoutTemplates).toBeDefined();
    expect(db.workoutTemplateExerciseInstances).toBeDefined();
    expect(db.programDefinitions).toBeDefined();
    expect(db.activeProgramInstances).toBeDefined();
    expect(db.progressionRules).toBeDefined();
    expect(db.userGoals).toBeDefined();
    expect(db.userBodyweightLog).toBeDefined();
    expect(db.appliedProgressionLog).toBeDefined();
  });

  it('should initialize the database and create default user settings', async () => {
    // Call the initialization function
    await initDatabase();

    // Check that default user settings were created
    const settings = await db.userSettings.get(1);
    expect(settings).toBeDefined();
    expect(settings?.preferredWeightUnit).toBe('kg');
    expect(settings?.theme).toBe('system');
    expect(settings?.defaultRestTimerSecs).toBe(90);
  });

  it('should not create default settings if they already exist', async () => {
    // Create custom settings first
    const id = await db.userSettings.add({
      preferredWeightUnit: 'lbs',
      theme: 'dark',
      defaultRestTimerSecs: 120,
    });

    // Call the initialization function
    await initDatabase();

    // Check that the existing settings were not overwritten
    const settings = await db.userSettings.get(id);
    expect(settings).toBeDefined();
    expect(settings?.preferredWeightUnit).toBe('lbs');
    expect(settings?.theme).toBe('dark');
    expect(settings?.defaultRestTimerSecs).toBe(120);
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock db.open to throw an error
    const openSpy = vi.spyOn(db, 'open');
    openSpy.mockRejectedValueOnce(new Error('Test error'));

    // Expect initDatabase to throw
    await expect(initDatabase()).rejects.toThrow('Test error');

    // Restore the original implementation
    openSpy.mockRestore();
  });
});
