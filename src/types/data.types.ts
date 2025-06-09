/**
 * StrongLog V1.0 Data Models
 *
 * This file defines TypeScript interfaces and Zod schemas for the application's data models.
 * These models are used for client-side storage in IndexedDB via Dexie.js.
 */

import { z } from 'zod';

// ==================== UserSettings ====================

export const userSettingsSchema = z.object({
  id: z.number().optional(), // Primary key, typically 1 for the single settings object
  preferredWeightUnit: z.enum(['kg', 'lbs']),
  theme: z.enum(['light', 'dark', 'system']),
  defaultRestTimerSecs: z.number().positive(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

// ==================== ExerciseDefinition ====================

export const exerciseDefinitionSchema = z.object({
  id: z.string().optional(), // UUID, primary key
  name: z.string().min(1), // User-facing name of the exercise
  equipment: z.string().optional(), // E.g., "Barbell", "Dumbbell", "Machine", "Bodyweight"
  primaryMuscleGroups: z.array(z.string()).optional(), // Tags for muscle groups, e.g., ["Chest", "Triceps"]
  notes: z.string().optional(), // User's notes about this exercise definition
  isCustom: z.boolean(), // True if user-created, false if pre-populated
  typicalAdvancedSetType: z.string().optional(), // Optional note for common advanced set type (e.g., "AMRAP")
});

export type ExerciseDefinition = z.infer<typeof exerciseDefinitionSchema>;

// ==================== WorkoutLog ====================

export const workoutLogSchema = z
  .object({
    id: z.string().optional(), // UUID, primary key
    programInstanceId: z.string().optional(), // Optional: Foreign key to ActiveProgramInstance if part of a program
    programDefinitionId: z.string().optional(), // Optional: Foreign key to ProgramDefinition
    workoutTemplateId: z.string().optional(), // Optional: Foreign key if based on a template
    name: z.string().optional(), // Optional name for the workout session (e.g., "Morning Push A")
    startTime: z.number(), // Unix timestamp (ms) for when the workout started
    endTime: z.number(), // Unix timestamp (ms) for when the workout ended
    durationMs: z.number(), // Calculated duration: endTime - startTime
    notes: z.string().optional(), // Overall notes for the workout session
  })
  .refine(data => data.endTime >= data.startTime, {
    message: 'End time must be greater than or equal to start time',
    path: ['endTime'],
  });

export type WorkoutLog = z.infer<typeof workoutLogSchema>;

// ==================== LoggedSet ====================

export const setTypeEnum = z.enum([
  'standard',
  'amrapReps',
  'amrapTime',
  'repsForTime',
  'pyramid',
  'dropSet',
]);

export type SetType = z.infer<typeof setTypeEnum>;

// Base set schema with common properties
const baseSetSchema = z.object({
  id: z.string().optional(), // UUID, primary key
  workoutLogId: z.string(), // Foreign key to WorkoutLog
  exerciseDefinitionId: z.string(), // Foreign key to ExerciseDefinition
  orderInWorkout: z.number().int().nonnegative(), // Order of this exercise block in the workout
  orderInExercise: z.number().int().nonnegative(), // Order of this set within the exercise block
  setType: setTypeEnum,
  notes: z.string().optional(), // Notes specific to this set (e.g., RPE)
  restTimeSecs: z.number().int().nonnegative().optional(), // Rest time taken *after* this set (if logged)
  groupKey: z.string().optional(), // UUID to link parts of a pyramid or drop set
  level: z.number().int().positive().optional(), // e.g., 1st part of pyramid, 2nd drop, etc.
});

// Standard set schema
export const standardSetSchema = baseSetSchema.extend({
  setType: z.literal('standard'),
  targetWeightKg: z.number().nonnegative().optional(), // Planned weight
  targetReps: z.number().int().nonnegative().optional(), // Planned reps
  loggedWeightKg: z.number().nonnegative(), // Actual weight
  loggedReps: z.number().int().nonnegative(), // Actual reps
});

export type StandardSet = z.infer<typeof standardSetSchema>;

// AMRAP Reps set schema
export const amrapRepsSetSchema = baseSetSchema.extend({
  setType: z.literal('amrapReps'),
  targetWeightKg: z.number().nonnegative().optional(), // Planned weight
  loggedWeightKg: z.number().nonnegative(), // Actual weight
  loggedReps: z.number().int().nonnegative(), // Achieved reps
});

export type AmrapRepsSet = z.infer<typeof amrapRepsSetSchema>;

// AMRAP Time set schema
export const amrapTimeSetSchema = baseSetSchema.extend({
  setType: z.literal('amrapTime'),
  targetWeightKg: z.number().nonnegative().optional(), // Planned weight
  targetDurationSecs: z.number().int().positive(), // Planned duration
  loggedWeightKg: z.number().nonnegative(), // Actual weight
  loggedReps: z.number().int().nonnegative(), // Achieved reps within duration
  loggedDurationSecs: z.number().int().positive().optional(), // Actual duration if different
});

export type AmrapTimeSet = z.infer<typeof amrapTimeSetSchema>;

// Reps For Time set schema
export const repsForTimeSetSchema = baseSetSchema.extend({
  setType: z.literal('repsForTime'),
  targetWeightKg: z.number().nonnegative().optional(), // Planned weight
  targetReps: z.number().int().positive(), // Planned reps
  loggedWeightKg: z.number().nonnegative(), // Actual weight
  loggedReps: z.number().int().positive().optional(), // Actual reps if different
  loggedTimeTakenSecs: z.number().int().positive(), // Time taken to complete targetReps
});

export type RepsForTimeSet = z.infer<typeof repsForTimeSetSchema>;

// Pyramid set schema
export const pyramidSetSchema = baseSetSchema.extend({
  setType: z.literal('pyramid'),
  targetWeightKg: z.number().nonnegative().optional(), // Planned weight
  targetReps: z.number().int().nonnegative().optional(), // Planned reps
  loggedWeightKg: z.number().nonnegative(), // Actual weight
  loggedReps: z.number().int().nonnegative(), // Actual reps
});

export type PyramidSet = z.infer<typeof pyramidSetSchema>;

// Drop set schema
export const dropSetSchema = baseSetSchema.extend({
  setType: z.literal('dropSet'),
  targetWeightKg: z.number().nonnegative().optional(), // Planned weight
  targetReps: z.number().int().nonnegative().optional(), // Planned reps
  loggedWeightKg: z.number().nonnegative(), // Actual weight
  loggedReps: z.number().int().nonnegative(), // Actual reps
});

export type DropSet = z.infer<typeof dropSetSchema>;

// Union type for all set types
export const loggedSetSchema = z.discriminatedUnion('setType', [
  standardSetSchema,
  amrapRepsSetSchema,
  amrapTimeSetSchema,
  repsForTimeSetSchema,
  pyramidSetSchema,
  dropSetSchema,
]);

export type LoggedSet = z.infer<typeof loggedSetSchema>;

// ==================== WorkoutTemplate ====================

export const targetSetDefinitionSchema = z.object({
  order: z.number().int().nonnegative(),
  setType: setTypeEnum,
  targetReps: z.union([z.string(), z.number().int().nonnegative()]).optional(), // e.g., 5, "5-8", "AMRAP"
  targetWeightNotes: z.string().optional(), // e.g., "Last working weight", "RPE 7"
  targetDurationSecs: z.number().int().positive().optional(), // for amrapTime, repsForTime
});

export type TargetSetDefinition = z.infer<typeof targetSetDefinitionSchema>;

export const workoutTemplateExerciseInstanceSchema = z.object({
  id: z.string().optional(), // UUID
  workoutTemplateId: z.string(), // Foreign key to WorkoutTemplate
  exerciseDefinitionId: z.string(), // Foreign key to ExerciseDefinition
  orderInTemplate: z.number().int().nonnegative(), // Order of the exercise in this template
  targetSets: z.number().int().positive().optional(),
  targetReps: z.string().optional(), // e.g., "5" or "8-12" or "AMRAP" (string to allow flexibility)
  targetWeightNotes: z.string().optional(), // e.g., "% of 1RM", "RPE 8" - textual notes for weight
  restTimeSecs: z.number().int().nonnegative().optional(),
  targetSetDefinitions: z.array(targetSetDefinitionSchema),
});

export type WorkoutTemplateExerciseInstance = z.infer<typeof workoutTemplateExerciseInstanceSchema>;

export const workoutTemplateSchema = z.object({
  id: z.string().optional(), // UUID, primary key
  name: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(), // General notes for the template
});

export type WorkoutTemplate = z.infer<typeof workoutTemplateSchema>;

// ==================== ProgramDefinition ====================

export const programWorkoutDefinitionEntrySchema = z.object({
  orderInProgram: z.number().int().nonnegative(), // e.g., Day 1, Day 2
  dayTag: z.string().optional(), // Optional tag like "A", "B", "Upper", "Lower"
  workoutTemplateId: z.string().optional(), // FK to WorkoutTemplate if using a template for this day
  adHocExercises: z.array(workoutTemplateExerciseInstanceSchema).optional(), // If not using a template
  notes: z.string().optional(), // Notes for this specific day in the program
});

export type ProgramWorkoutDefinitionEntry = z.infer<typeof programWorkoutDefinitionEntrySchema>;

export const targetFrequencySchema = z.object({
  type: z.enum(['perWeek', 'everyXDays']),
  value: z.number().positive(),
});

export const linkedProgressionRuleSchema = z.object({
  ruleId: z.string(),
  scope: z.enum(['program', 'workoutInProgram', 'exerciseInProgram']),
  scopeIdentifier: z.string().optional(),
});

export const programDefinitionSchema = z.object({
  id: z.string().optional(), // UUID, primary key
  name: z.string().min(1),
  description: z.string().optional(),
  targetFrequency: targetFrequencySchema,
  workoutSequence: z.array(programWorkoutDefinitionEntrySchema).min(1),
  linkedProgressionRuleIds: z.array(linkedProgressionRuleSchema).optional(),
});

export type ProgramDefinition = z.infer<typeof programDefinitionSchema>;

// ==================== ActiveProgramInstance ====================

export const progressionAdjustmentSchema = z.object({
  targetWeightKg: z.number().nonnegative().optional(),
  targetReps: z.union([z.string(), z.number().int().nonnegative()]).optional(),
  notes: z.string().optional(),
});

export const completedWorkoutHistoryEntrySchema = z.object({
  workoutLogId: z.string(),
  orderInProgram: z.number().int().nonnegative(),
  completedDate: z.number(), // Timestamp
});

export const activeProgramInstanceSchema = z.object({
  id: z.string().optional(), // UUID, primary key
  programDefinitionId: z.string(), // Foreign key to ProgramDefinition
  userId: z.string(), // Would be key if we had multi-user local DB; for single user, can be implicit or a const
  startDate: z.number(), // Timestamp when the program was activated
  status: z.enum(['active', 'paused', 'completed']),
  currentWorkoutOrderInProgram: z.number().int().nonnegative(), // Index of the next workout to perform
  lastWorkoutLogId: z.string().optional(), // FK to the last WorkoutLog performed as part of this program
  lastCompletedWorkoutDate: z.number().optional(), // Timestamp
  progressionAdjustments: z.record(z.string(), progressionAdjustmentSchema).optional(),
  carriedOverExercises: z.array(workoutTemplateExerciseInstanceSchema).optional(),
  completedWorkoutHistory: z.array(completedWorkoutHistoryEntrySchema).optional(),
});

export type ActiveProgramInstance = z.infer<typeof activeProgramInstanceSchema>;

// ==================== ProgressionRule ====================

export const progressionRuleSchema = z.object({
  id: z.string().optional(), // UUID, primary key
  name: z.string().min(1),
  isActive: z.boolean(),
  conditions: z.any(), // JSON object for conditions
  event: z.object({
    type: z.string(),
    params: z.object({
      actionType: z.enum([
        'increaseWeight',
        'decreaseWeight',
        'increaseReps',
        'decreaseReps',
        'hold',
        'suggestDeload',
        'suggestSetRepSchemeChange',
      ]),
      exerciseName: z.string().optional(),
      amountKg: z.number().optional(),
      amountLbs: z.number().optional(),
      amountPercent: z.number().optional(),
      repsToAdd: z.number().int().optional(),
      suggestionText: z.string().optional(),
    }),
  }),
  description: z.string().optional(), // User's description of the rule
});

export type ProgressionRule = z.infer<typeof progressionRuleSchema>;

// ==================== UserGoal ====================

export const goalTypeEnum = z.enum(['liftTarget', 'programCompletion', 'bodyweightTarget']);
export type GoalType = z.infer<typeof goalTypeEnum>;

export const goalStatusEnum = z.enum(['active', 'achieved', 'archived']);
export type GoalStatus = z.infer<typeof goalStatusEnum>;

export const userGoalSchema = z
  .object({
    id: z.string().optional(), // UUID, primary key
    name: z.string().min(1),
    type: goalTypeEnum,
    status: goalStatusEnum,
    targetDate: z.number().optional(), // Optional Unix timestamp
    creationDate: z.number(), // Unix timestamp
    achievedDate: z.number().optional(), // Optional Unix timestamp

    // Type-specific target values
    // For liftTarget
    targetExerciseDefinitionId: z.string().optional(), // FK to ExerciseDefinition
    targetWeightKg: z.number().nonnegative().optional(),
    targetReps: z.number().int().positive().optional(), // e.g., 1 for 1RM, 5 for 5RM

    // For programCompletion
    targetProgramDefinitionId: z.string().optional(), // FK to ProgramDefinition

    // For bodyweightTarget
    targetBodyweightKg: z.number().positive().optional(),

    // Current progress - could be stored or calculated dynamically
    currentValue: z.number().optional(), // e.g., current e1RM, current % program completion, current bodyweight
    progressNotes: z.string().optional(),
  })
  .refine(
    data => {
      if (data.type === 'liftTarget') {
        return data.targetExerciseDefinitionId !== undefined && data.targetWeightKg !== undefined;
      } else if (data.type === 'programCompletion') {
        return data.targetProgramDefinitionId !== undefined;
      } else if (data.type === 'bodyweightTarget') {
        return data.targetBodyweightKg !== undefined;
      }
      return false;
    },
    {
      message: 'Missing required fields for the specified goal type',
      path: ['type'],
    }
  );

export type UserGoal = z.infer<typeof userGoalSchema>;

// ==================== UserBodyweightLog ====================

export const userBodyweightEntrySchema = z.object({
  id: z.string().optional(), // UUID, primary key
  date: z.number(), // Unix timestamp (ms) of the entry
  weightKg: z.number().positive(),
});

export type UserBodyweightEntry = z.infer<typeof userBodyweightEntrySchema>;

// ==================== AppliedProgressionLog ====================

export const appliedProgressionLogEntrySchema = z.object({
  id: z.string().optional(), // UUID
  date: z.number(), // Timestamp when the progression was applied/suggested
  ruleId: z.string(), // FK to ProgressionRule
  ruleName: z.string(), // Denormalized for easier display
  workoutLogId: z.string().optional(), // FK to WorkoutLog that triggered this progression (if applicable)
  programInstanceId: z.string().optional(), // FK if progression applied in context of a program
  exerciseDefinitionId: z.string().optional(), // FK to relevant ExerciseDefinition
  changeDescription: z.string(), // Human-readable summary, e.g., "+2.5kg to Squat"
  actionTaken: z.any(), // Could store the actual action params from the rule
  userOverride: z.boolean().optional(), // If user later overrode this specific applied progression
});

export type AppliedProgressionLogEntry = z.infer<typeof appliedProgressionLogEntrySchema>;
