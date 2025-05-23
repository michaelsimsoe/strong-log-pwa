# StrongLog V1.0 Data Models

**Version:** 0.1
**Date:** 2025-05-22
**Author:** 3 Arkitekten (AI)

This document outlines the data models for the StrongLog V1.0 application, primarily focusing on the structures stored in the client-side IndexedDB database, managed via Dexie.js.

## 1. Core Application Entities / Domain Objects & Dexie.js Schemas

This section defines the main entities the application works with, their TypeScript interfaces, and how they are mapped to Dexie.js table schemas, including indexes. The `++id` notation in Dexie.js schemas indicates an auto-incrementing primary key. Other properties listed are table fields. An asterisk `*` before a field name denotes a multi-entry index, and `&` denotes a unique index. Compound indexes are defined as `[field1+field2]`.

---

### 1.1 UserSettings

* **Description:** Stores user-specific preferences and settings for the application. Only a single record of this type will exist for a user.
* **TypeScript Interface Definition:**

    ```typescript
    export interface UserSettings {
      id?: number; // Primary key, typically 1 for the single settings object
      preferredWeightUnit: 'kg' | 'lbs';
      theme: 'light' | 'dark' | 'system';
      defaultRestTimerSecs: number; // Default rest duration in seconds
      // Future settings can be added here
    }
    ```

* **Dexie.js Table Schema (`db.version(1).stores({...})`):**

    ```javascript
    userSettings: '++id, preferredWeightUnit, theme', // id will always be 1
    ```

* **Validation Rules:** `preferredWeightUnit` must be 'kg' or 'lbs'. `theme` must be 'light', 'dark', or 'system'. `defaultRestTimerSecs` must be a positive integer.

---

### 1.2 ExerciseDefinition

* **Description:** Represents a definition of an exercise, either pre-populated or user-created.
* **TypeScript Interface Definition:**

    ```typescript
    export interface ExerciseDefinition {
      id?: string; // UUID, primary key (e.g., generated client-side)
      name: string; // User-facing name of the exercise
      equipment?: string; // E.g., "Barbell", "Dumbbell", "Machine", "Bodyweight"
      primaryMuscleGroups?: string[]; // Tags for muscle groups, e.g., ["Chest", "Triceps"]
      notes?: string; // User's notes about this exercise definition
      isCustom: boolean; // True if user-created, false if pre-populated
      typicalAdvancedSetType?: string; // Optional note for common advanced set type (e.g., "AMRAP")
      // Future properties: videoUrl, instructions, etc.
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    exerciseDefinitions: '++id, &name, *primaryMuscleGroups, isCustom',
    ```

* **Validation Rules:** `name` must be unique and non-empty. `primaryMuscleGroups` should be an array of strings.

---

### 1.3 WorkoutLog

* **Description:** Represents a single completed workout session.
* **TypeScript Interface Definition:**

    ```typescript
    export interface WorkoutLog {
      id?: string; // UUID, primary key
      programInstanceId?: string; // Optional: Foreign key to ActiveProgramInstance if part of a program
      programDefinitionId?: string; // Optional: Foreign key to ProgramDefinition
      workoutTemplateId?: string; // Optional: Foreign key if based on a template
      name?: string; // Optional name for the workout session (e.g., "Morning Push A")
      startTime: number; // Unix timestamp (ms) for when the workout started
      endTime: number; // Unix timestamp (ms) for when the workout ended
      durationMs: number; // Calculated duration: endTime - startTime
      notes?: string; // Overall notes for the workout session
      // Location data, mood, etc. could be future additions
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    workoutLogs: '++id, startTime, programInstanceId, programDefinitionId, workoutTemplateId', // Index startTime for chronological sorting
    ```

* **Validation Rules:** `startTime` and `endTime` are required. `endTime` >= `startTime`.

---

### 1.4 LoggedSet

* **Description:** Represents a single set performed by the user as part of a `WorkoutLog`. This entity needs to be flexible to accommodate various set types.
* **TypeScript Interface Definition:**

    ```typescript
    export type SetType = 'standard' | 'amrapReps' | 'amrapTime' | 'repsForTime' | 'pyramid' | 'dropSet';

    export interface BaseSet {
      id?: string; // UUID, primary key
      workoutLogId: string; // Foreign key to WorkoutLog
      exerciseDefinitionId: string; // Foreign key to ExerciseDefinition
      orderInWorkout: number; // Order of this exercise block in the workout
      orderInExercise: number; // Order of this set within the exercise block
      setType: SetType;
      notes?: string; // Notes specific to this set (e.g., RPE)
      restTimeSecs?: number; // Rest time taken *after* this set (if logged)
    }

    export interface StandardSet extends BaseSet {
      setType: 'standard';
      targetWeightKg?: number; // Planned weight
      targetReps?: number;   // Planned reps
      loggedWeightKg: number;
      loggedReps: number;
    }

    export interface AmrapRepsSet extends BaseSet {
      setType: 'amrapReps';
      targetWeightKg?: number; // Planned weight
      loggedWeightKg: number;
      loggedReps: number; // Achieved reps
    }

    export interface AmrapTimeSet extends BaseSet {
      setType: 'amrapTime';
      targetWeightKg?: number; // Planned weight
      targetDurationSecs: number; // Planned duration
      loggedWeightKg: number;
      loggedReps: number; // Achieved reps within duration
      loggedDurationSecs?: number; // Actual duration if different (e.g., stopped early)
    }

    export interface RepsForTimeSet extends BaseSet {
      setType: 'repsForTime';
      targetWeightKg?: number; // Planned weight
      targetReps: number;     // Planned reps
      loggedWeightKg: number;
      loggedReps?: number; // Actual reps if different
      loggedTimeTakenSecs: number; // Time taken to complete targetReps
    }

    // For Pyramid and Drop Sets, each individual part is a LoggedSet.
    // They are grouped by a shared 'exerciseBlockId' or by `orderInWorkout` and `exerciseDefinitionId`,
    // with `orderInExercise` distinguishing the sub-sets.
    // A 'pyramidLevel' or 'dropLevel' could be added to BaseSet if explicit linking is needed beyond order.

    // Let's define a common structure for sub-sets of complex types
    export interface ComplexSetPart { // Not a direct LoggedSet type, but part of Pyramid/Drop
        targetWeightKg?: number;
        targetReps?: number;
        loggedWeightKg: number;
        loggedReps: number;
    }

    export interface PyramidSet extends BaseSet { // Represents the entire pyramid block for an exercise
        setType: 'pyramid';
        // Individual pyramid parts are logged as separate StandardSet entries linked via workoutLogId, exerciseDefinitionId, and orderInWorkout,
        // distinguished by increasing orderInExercise.
        // Alternatively, store sub-set details here if not logging them as individual full sets:
        // subSets: ComplexSetPart[]; 
        // For V1.0, PRD implies individual logging of sub-sets, so 'pyramid' itself might be a tag on the exercise instance in the workout log,
        // and the sets are just multiple 'standard' sets. Epic 2.4 AC3: "each sub-set of the pyramid is presented sequentially for the user to confirm/log actual weight and reps."
        // This suggests each pyramid sub-set IS a LoggedSet. So, a LoggedSet might have a parentPyramidId or parentDropId if we want to group them explicitly.
        // For simplicity now, let's assume 'pyramid' and 'dropSet' setTypes apply to individual logged sets that are part of such a structure.
        // The grouping is implicit by workoutLogId, exerciseDefinitionId, orderInWorkout, and sequential orderInExercise.
        // A 'pyramidGroupKey' or 'dropGroupKey' (e.g. a UUID) could be added to BaseSet to explicitly link them.
        groupKey?: string; // UUID to link parts of a pyramid or drop set
        level?: number; // e.g., 1st part of pyramid, 2nd drop, etc.
        targetWeightKg?: number;
        targetReps?: number;
        loggedWeightKg: number;
        loggedReps: number;
    }

    export interface DropSet extends BaseSet { // Similar to PyramidSet for storage
        setType: 'dropSet';
        groupKey?: string; // UUID to link parts of a pyramid or drop set
        level?: number; 
        targetWeightKg?: number; // Initial target
        targetReps?: number;   // Initial target
        loggedWeightKg: number;
        loggedReps: number;
    }

    export type LoggedSet = StandardSet | AmrapRepsSet | AmrapTimeSet | RepsForTimeSet | PyramidSet | DropSet;
    ```

* **Dexie.js Table Schema (`loggedSets`):**

    ```javascript
    // Need to store all common fields and type-specific fields.
    // Dexie doesn't support discriminated unions directly in schema in a simple way for indexing type-specific fields easily.
    // A common approach is to have nullable fields for all variations or store specific data in a 'details:object' field.
    // For querying, it's often better to have common queryable fields directly indexed.
    loggedSets: '++id, workoutLogId, exerciseDefinitionId, [workoutLogId+exerciseDefinitionId+orderInWorkout], [workoutLogId+orderInWorkout+orderInExercise], setType, groupKey', 
    // Indexing 'workoutLogId' is crucial for retrieving all sets for a workout.
    // Indexing 'exerciseDefinitionId' helps find all sets for a specific exercise for analytics.
    // Compound index for efficient querying of sets within an exercise block of a workout.
    // groupKey to fetch all parts of a pyramid/drop set.
    ```

* **Validation Rules:** `workoutLogId` and `exerciseDefinitionId` are required. Fields like `loggedWeightKg`, `loggedReps` must be positive. Specific fields required based on `setType`.

---

### 1.5 WorkoutTemplate

* **Description:** A reusable template defining the structure of a workout (exercises, target sets/reps).
* **TypeScript Interface Definition:**

    ```typescript
    export interface WorkoutTemplate {
      id?: string; // UUID, primary key
      name: string;
      description?: string;
      notes?: string; // General notes for the template
      // Exercises are defined in WorkoutTemplateExerciseInstance
    }

    export interface WorkoutTemplateExerciseInstance { // Links ExerciseDefinition to WorkoutTemplate
      id?: string; // UUID
      workoutTemplateId: string; // Foreign key to WorkoutTemplate
      exerciseDefinitionId: string; // Foreign key to ExerciseDefinition
      orderInTemplate: number; // Order of the exercise in this template
      targetSets?: number;
      targetReps?: string; // e.g., "5" or "8-12" or "AMRAP" (string to allow flexibility)
      targetWeightNotes?: string; // e.g., "% of 1RM", "RPE 8" - textual notes for weight. Actual weight calculated by FRY/FRX.
      restTimeSecs?: number;
      // Defines structure for standard sets, AMRAPs, Pyramids, Drop Sets
      // For complex sets like Pyramids/Drops, this might define the pattern,
      // or they could be multiple instances.
      // For V1.0, let's assume this instance can define the setType for all its sets.
      // Or, it could be an array of target set definitions.
      targetSetDefinitions: TargetSetDefinition[];
    }
    
    export interface TargetSetDefinition { // Structure for a single target set within an exercise instance
        order: number;
        setType: SetType; // from LoggedSet types
        targetReps?: string | number; // e.g., 5, "5-8", "AMRAP"
        targetWeightNotes?: string; // e.g., "Last working weight", "RPE 7"
        targetDurationSecs?: number; // for amrapTime, repsForTime
        // For pyramid/drop sets, this would define one level/part.
    }
    ```

* **Dexie.js Table Schemas:**

    ```javascript
    workoutTemplates: '++id, &name',
    workoutTemplateExerciseInstances: '++id, workoutTemplateId, exerciseDefinitionId, orderInTemplate, [workoutTemplateId+orderInTemplate]',
    ```

* **Validation Rules:** `name` for template must be unique. `workoutTemplateId` and `exerciseDefinitionId` in instances are required.

---

### 1.6 ProgramDefinition

* **Description:** Defines a structured training program, composed of a sequence of workouts (often using WorkoutTemplates), a target frequency, and linked progression rules.
* **TypeScript Interface Definition:**

    ```typescript
    export interface ProgramDefinition {
      id?: string; // UUID, primary key
      name: string;
      description?: string;
      targetFrequency: { // e.g., 3 times a week
        type: 'perWeek' | 'everyXDays';
        value: number;
      };
      // Sequence of workouts in this program
      workoutSequence: ProgramWorkoutDefinitionEntry[];
      // Global rules for this program
      linkedProgressionRuleIds?: { ruleId: string; scope: 'program' | 'workoutInProgram' | 'exerciseInProgram'; scopeIdentifier?: string; }[];
    }

    export interface ProgramWorkoutDefinitionEntry { // Defines one workout 'day' or step in the program sequence
      orderInProgram: number; // e.g., Day 1, Day 2
      dayTag?: string; // Optional tag like "A", "B", "Upper", "Lower"
      workoutTemplateId?: string; // FK to WorkoutTemplate if using a template for this day
      // OR ad-hoc definition of exercises for this program day, similar to WorkoutTemplateExerciseInstance structure:
      adHocExercises?: WorkoutTemplateExerciseInstance[]; // If not using a template, define exercises directly here
      notes?: string; // Notes for this specific day in the program
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    programDefinitions: '++id, &name',
    // workoutSequence and linkedProgressionRuleIds will be stored as arrays of objects within the ProgramDefinition record.
    // This is suitable for Dexie as it stores objects. Querying based on elements within these arrays would require
    // more complex filtering in code or careful denormalization if direct indexing is needed on sequence/rule details often.
    // For V1.0, direct querying on these nested arrays might not be a primary requirement.
    ```

* **Validation Rules:** `name` must be unique. `targetFrequency.value` > 0. `workoutSequence` must not be empty.

---

### 1.7 ActiveProgramInstance

* **Description:** Tracks a user's current state and progress through an activated `ProgramDefinition`.
* **TypeScript Interface Definition:**

    ```typescript
    export interface ActiveProgramInstance {
      id?: string; // UUID, primary key
      programDefinitionId: string; // Foreign key to ProgramDefinition
      userId: string; // Would be key if we had multi-user local DB; for single user, can be implicit or a const.
      startDate: number; // Timestamp when the program was activated
      status: 'active' | 'paused' | 'completed';
      currentWorkoutOrderInProgram: number; // Index of the next workout to perform from ProgramDefinition.workoutSequence
      lastWorkoutLogId?: string; // FK to the last WorkoutLog performed as part of this program instance
      lastCompletedWorkoutDate?: number; // Timestamp
      // Stores specific progression adjustments for upcoming workouts in this instance,
      // determined by FRX and consumed by FRY. Key could be 'workoutOrderInProgram.exerciseDefinitionId'.
      progressionAdjustments?: Record<string, { targetWeightKg?: number; targetReps?: string | number; notes?: string }>;
      carriedOverExercises?: WorkoutTemplateExerciseInstance[]; // Exercises carried over from a partially completed previous workout
      // History of workouts completed within this instance
      completedWorkoutHistory?: { workoutLogId: string; orderInProgram: number; completedDate: number; }[];
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    activeProgramInstances: '++id, programDefinitionId, status, [programDefinitionId+status]',
    ```

* **Validation Rules:** `programDefinitionId` is required. `status` is one of the defined enums.

---

### 1.8 ProgressionRule

* **Description:** A user-defined rule for the Progression Rules Engine (FRX).
* **TypeScript Interface Definition:**

    ```typescript
    export interface ProgressionRule {
      id?: string; // UUID, primary key
      name: string;
      isActive: boolean;
      // json-rules-engine compatible structure
      conditions: any; // JSON object for conditions (e.g., { all: [ { fact: ..., operator: ..., value: ...} ]})
      event: { // 'event' is how json-rules-engine defines actions
        type: string; // e.g., "applyProgression" or specific action type
        params: {
          actionType: 'increaseWeight' | 'decreaseWeight' | 'increaseReps' | 'decreaseReps' | 'hold' | 'suggestDeload' | 'suggestSetRepSchemeChange';
          // Parameters specific to actionType, e.g.:
          exerciseName?: string; // For targeting specific exercises
          amountKg?: number;
          amountLbs?: number;
          amountPercent?: number;
          repsToAdd?: number;
          suggestionText?: string; // For deload/set-rep scheme change suggestions
          // ... other params
        };
      };
      // Scope/association can be complex. For V1.0, linking rules to programs is in ProgramDefinition.
      // If rules can be global or exercise-specific outside of programs, add fields here.
      // For now, assume rules are generally available and ProgramDefinition links to them.
      // Or, a rule could target specific exercises via its params or conditions.
      description?: string; // User's description of the rule
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    progressionRules: '++id, &name, isActive',
    ```

* **Validation Rules:** `name` must be unique. `conditions` and `event` must be valid JSON structures compatible with `json-rules-engine`. Zod will be crucial here.

---

### 1.9 UserGoal

* **Description:** A user-defined training goal.
* **TypeScript Interface Definition:**

    ```typescript
    export type GoalType = 'liftTarget' | 'programCompletion' | 'bodyweightTarget';
    export type GoalStatus = 'active' | 'achieved' | 'archived';

    export interface UserGoal {
      id?: string; // UUID, primary key
      name: string;
      type: GoalType;
      status: GoalStatus;
      targetDate?: number; // Optional Unix timestamp
      creationDate: number; // Unix timestamp
      achievedDate?: number; // Optional Unix timestamp

      // Type-specific target values
      // For liftTarget
      targetExerciseDefinitionId?: string; // FK to ExerciseDefinition
      targetWeightKg?: number;
      targetReps?: number; // e.g., 1 for 1RM, 5 for 5RM

      // For programCompletion
      targetProgramDefinitionId?: string; // FK to ProgramDefinition

      // For bodyweightTarget
      targetBodyweightKg?: number;

      // Current progress - could be stored or calculated dynamically
      currentValue?: number; // e.g., current e1RM, current % program completion, current bodyweight
      progressNotes?: string;
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    userGoals: '++id, name, type, status, targetDate, [type+status]',
    ```

* **Validation Rules:** `name` and `type` are required. Target values depend on `type`.

---

### 1.10 UserBodyweightLog

* **Description:** Stores user's bodyweight entries over time, used for bodyweight goals.
* **TypeScript Interface Definition:**

    ```typescript
    export interface UserBodyweightEntry {
      id?: string; // UUID, primary key
      date: number; // Unix timestamp (ms) of the entry
      weightKg: number;
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    userBodyweightLog: '++id, date', // Index date for chronological sorting and easy lookup of latest
    ```

* **Validation Rules:** `date` and `weightKg` required, `weightKg` > 0.

---

### 1.11 AppliedProgressionLog (Optional - for history)

* **Description:** A log of when specific progression rules were triggered and what actions were applied or suggested. This helps users understand how their plan is evolving.
* **TypeScript Interface Definition:**

    ```typescript
    export interface AppliedProgressionLogEntry {
      id?: string; // UUID
      date: number; // Timestamp when the progression was applied/suggested
      ruleId: string; // FK to ProgressionRule
      ruleName: string; // Denormalized for easier display
      workoutLogId?: string; // FK to WorkoutLog that triggered this progression (if applicable)
      programInstanceId?: string; // FK if progression applied in context of a program
      exerciseDefinitionId?: string; // FK to relevant ExerciseDefinition
      changeDescription: string; // Human-readable summary, e.g., "+2.5kg to Squat", "Suggested Deload for Bench Press"
      actionTaken: any; // Could store the actual action params from the rule
      userOverride?: boolean; // If user later overrode this specific applied progression
    }
    ```

* **Dexie.js Table Schema:**

    ```javascript
    appliedProgressionLog: '++id, date, ruleId, exerciseDefinitionId, programInstanceId',
    ```

---

## 2. API Payload Schemas (Optional Sync - High Level for V1.0)

Since backend technology choices are deferred and we are focusing on a client-first approach, API payloads for the optional sync will largely mirror the structure of the client-side Dexie.js entities. The REST API will have endpoints for each major entity type.

* **General Principles:**
  * Payloads will be JSON.
  * Client will send new/updated records to the server.
  * Client will fetch records changed on the server since its last sync.
  * "Last write wins" based on timestamp is the V1.0 conflict resolution strategy. Timestamps (e.g., `updatedAt`, `createdAt` for each record, managed locally and synced) will be crucial.
  * Each synced entity should have a unique client-generated ID (UUID) and a server-generated ID once synced, plus `createdAt` and `updatedAt` timestamps (both client-set and server-authoritative).

* **Example: `WorkoutLog` Sync Payload (Conceptual)**

    ```typescript
    // Client sends to Server (POST or PUT /api/v1/workoutlogs)
    export interface WorkoutLogSyncPayload extends WorkoutLog {
      localId: string; // Client-generated UUID (is the 'id' in local Dexie table)
      syncedAt?: number; // Timestamp of last successful sync for this record
      isDeleted?: boolean; // For soft deletes
      clientUpdatedAt: number; // Timestamp of last modification on client
    }

    // Server might respond with:
    export interface WorkoutLogSyncResponse extends WorkoutLogSyncPayload {
      serverId: string; // Server-assigned ID
      serverUpdatedAt: number; // Server timestamp for the record
    }
    ```

    Similar payload structures would apply to `LoggedSet`, `ExerciseDefinition`, `ProgramDefinition`, `ActiveProgramInstance`, `ProgressionRule`, `UserGoal`, `UserSettings`, etc. We will need to add `clientUpdatedAt` and `isDeleted` fields to most local Dexie.js entities if they are to be synced.

---

## 3. Database Schemas (Dexie.js Summary)

Here's a summary of all Dexie.js table definitions for `StrongLogDB`. This would be used in `src/services/data/db.ts` when initializing Dexie.

```typescript
// In db.ts
import Dexie, { Table } from 'dexie';
// ... import all interfaces defined above

export class StrongLogDatabase extends Dexie {
  userSettings!: Table<UserSettings, number>;
  exerciseDefinitions!: Table<ExerciseDefinition, string>;
  workoutLogs!: Table<WorkoutLog, string>;
  loggedSets!: Table<LoggedSet, string>; // Union type for LoggedSet
  workoutTemplates!: Table<WorkoutTemplate, string>;
  workoutTemplateExerciseInstances!: Table<WorkoutTemplateExerciseInstance, string>;
  programDefinitions!: Table<ProgramDefinition, string>;
  activeProgramInstances!: Table<ActiveProgramInstance, string>;
  progressionRules!: Table<ProgressionRule, string>;
  userGoals!: Table<UserGoal, string>;
  userBodyweightLog!: Table<UserBodyweightEntry, string>;
  appliedProgressionLog!: Table<AppliedProgressionLogEntry, string>; // Optional history log

  constructor() {
    super('StrongLogDB');
    this.version(1).stores({
      userSettings: '++id, preferredWeightUnit, theme',
      exerciseDefinitions: '++id, &name, *primaryMuscleGroups, isCustom',
      workoutLogs: '++id, startTime, programInstanceId, programDefinitionId, workoutTemplateId, [startTime+programInstanceId]', // Added compound index
      loggedSets: '++id, workoutLogId, exerciseDefinitionId, [workoutLogId+exerciseDefinitionId+orderInWorkout], [workoutLogId+orderInWorkout+orderInExercise], setType, groupKey, [exerciseDefinitionId+setType]', // Added compound index
      workoutTemplates: '++id, &name',
      workoutTemplateExerciseInstances: '++id, workoutTemplateId, exerciseDefinitionId, orderInTemplate, [workoutTemplateId+orderInTemplate]',
      programDefinitions: '++id, &name',
      activeProgramInstances: '++id, programDefinitionId, status, [programDefinitionId+status]',
      progressionRules: '++id, &name, isActive',
      userGoals: '++id, name, type, status, targetDate, [type+status], targetExerciseDefinitionId', // Added index
      userBodyweightLog: '++id, date',
      appliedProgressionLog: '++id, date, ruleId, exerciseDefinitionId, programInstanceId',
    });

    // Future versions for schema migrations would go here:
    // this.version(2).stores({...}).upgrade(...);
  }
}

export const db = new StrongLogDatabase();
```

*(Note: For `LoggedSet`, as it's a union type, all possible fields would need to be defined in the Dexie schema with `?` if not present in all types, or a `details: object` field could be used. For simplicity and queryability of common fields like `weightKg`, `reps`, it's often better to have them at the top level, nullable. The `groupKey` was added to `LoggedSet` schema for pyramid/drop sets.)*
*(Added a few more potentially useful indexes in the Dexie summary).*

## 4. State File Schemas

Not directly applicable for primary data storage, as IndexedDB via Dexie.js is the sole source of truth for persistent application data. Transient UI state managed by Zustand might be persisted to `localStorage` by its middleware if configured, but that's not considered part of the core data model schema here.

## Change Log

| Change        | Date         | Version | Description                                                                         | Author            |
|---------------|--------------|---------|-------------------------------------------------------------------------------------|-------------------|
| Initial draft | 2025-05-22   | 0.1     | Initial draft defining core entities, TypeScript interfaces, and Dexie.js schemas. | 3 Arkitekten (AI) |
