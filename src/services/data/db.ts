/**
 * StrongLog V1.0 Database Setup
 *
 * This file initializes the IndexedDB database using Dexie.js and defines the schema
 * for all data entities in the application.
 */

import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  UserSettings,
  ExerciseDefinition,
  WorkoutLog,
  LoggedSet,
  WorkoutTemplate,
  WorkoutTemplateExerciseInstance,
  ProgramDefinition,
  ActiveProgramInstance,
  ProgressionRule,
  UserGoal,
  UserBodyweightEntry,
  AppliedProgressionLogEntry,
} from '../../types/data.types';
import { getExerciseSeedData } from '../../config/seedData/exercises';

/**
 * StrongLogDatabase class extends Dexie to provide typed access to our database tables
 */
export class StrongLogDatabase extends Dexie {
  // Table definitions with TypeScript interfaces
  userSettings!: Table<UserSettings, number>;
  exerciseDefinitions!: Table<ExerciseDefinition, string>;
  workoutLogs!: Table<WorkoutLog, string>;
  loggedSets!: Table<LoggedSet, string>;
  workoutTemplates!: Table<WorkoutTemplate, string>;
  workoutTemplateExerciseInstances!: Table<WorkoutTemplateExerciseInstance, string>;
  programDefinitions!: Table<ProgramDefinition, string>;
  activeProgramInstances!: Table<ActiveProgramInstance, string>;
  progressionRules!: Table<ProgressionRule, string>;
  userGoals!: Table<UserGoal, string>;
  userBodyweightLog!: Table<UserBodyweightEntry, string>;
  appliedProgressionLog!: Table<AppliedProgressionLogEntry, string>;

  constructor() {
    super('StrongLogDB');

    // Define database schema for version 1
    this.version(1).stores({
      userSettings: '++id, preferredWeightUnit, theme',
      exerciseDefinitions: '++id, &name, *primaryMuscleGroups, isCustom',
      workoutLogs:
        '++id, startTime, programInstanceId, programDefinitionId, workoutTemplateId, [startTime+programInstanceId]',
      loggedSets:
        '++id, workoutLogId, exerciseDefinitionId, [workoutLogId+exerciseDefinitionId+orderInWorkout], [workoutLogId+orderInWorkout+orderInExercise], setType, groupKey, [exerciseDefinitionId+setType]',
      workoutTemplates: '++id, &name',
      workoutTemplateExerciseInstances:
        '++id, workoutTemplateId, exerciseDefinitionId, orderInTemplate, [workoutTemplateId+orderInTemplate]',
      programDefinitions: '++id, &name',
      activeProgramInstances: '++id, programDefinitionId, status, [programDefinitionId+status]',
      progressionRules: '++id, &name, isActive',
      userGoals: '++id, name, type, status, targetDate, [type+status], targetExerciseDefinitionId',
      userBodyweightLog: '++id, date',
      appliedProgressionLog: '++id, date, ruleId, exerciseDefinitionId, programInstanceId',
    });

    // Future versions for schema migrations would go here:
    // this.version(2).stores({...}).upgrade(tx => {...});
  }
}

// Create and export a singleton instance of the database
export const db = new StrongLogDatabase();

/**
 * Initialize the database and handle any startup tasks
 * @returns Promise that resolves when the database is ready
 */
export async function initDatabase(): Promise<void> {
  try {
    // Open the database
    await db.open();
    console.info('StrongLogDB initialized successfully');

    // Check if we need to create default user settings
    const settingsCount = await db.userSettings.count();
    if (settingsCount === 0) {
      await createDefaultUserSettings();
    }

    // Check if we need to seed exercise definitions
    await seedExerciseDefinitions();
  } catch (error) {
    console.error('Failed to initialize StrongLogDB:', error);
    throw error;
  }
}

/**
 * Create default user settings if none exist
 */
async function createDefaultUserSettings(): Promise<void> {
  try {
    await db.userSettings.add({
      preferredWeightUnit: 'kg',
      theme: 'system',
      defaultRestTimerSecs: 90,
    });
    console.info('Default user settings created');
  } catch (error) {
    console.error('Failed to create default user settings:', error);
    throw error;
  }
}

/**
 * Seed exercise definitions if the table is empty
 */
async function seedExerciseDefinitions(): Promise<void> {
  try {
    // Check if exercise definitions already exist
    const exerciseCount = await db.exerciseDefinitions.count();

    if (exerciseCount === 0) {
      // Get seed data
      const seedExercises = getExerciseSeedData();

      // Add all seed exercises to the database
      await db.exerciseDefinitions.bulkAdd(seedExercises);
      console.info(`Seeded ${seedExercises.length} exercise definitions`);
    }
  } catch (error) {
    console.error('Failed to seed exercise definitions:', error);
    throw error;
  }
}
