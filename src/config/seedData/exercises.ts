/**
 * Pre-populated exercise definitions for seeding the database
 */
import { v4 as uuidv4 } from 'uuid';
import type { ExerciseDefinition } from '../../types/data.types';

/**
 * Comprehensive list of common exercises for initial database seeding
 * Each exercise has a unique ID, name, and isCustom=false
 * Optional fields include equipment and primaryMuscleGroups
 */
export const seedExercises: ExerciseDefinition[] = [
  // Chest Exercises
  {
    id: uuidv4(),
    name: 'Bench Press',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Incline Bench Press',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Decline Bench Press',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Lower Chest', 'Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Dumbbell Bench Press',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Incline Dumbbell Press',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Decline Dumbbell Press',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Lower Chest', 'Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Chest Fly',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Chest'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Cable Fly',
    equipment: 'Cable',
    primaryMuscleGroups: ['Chest'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Pec Deck',
    equipment: 'Machine',
    primaryMuscleGroups: ['Chest'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Push-Up',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    isCustom: false,
  },

  // Back Exercises
  {
    id: uuidv4(),
    name: 'Deadlift',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Back', 'Hamstrings', 'Glutes'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Pull-Up',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Back', 'Biceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Lat Pulldown',
    equipment: 'Cable',
    primaryMuscleGroups: ['Back', 'Biceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Bent Over Row',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Back', 'Biceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'T-Bar Row',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Back'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Seated Cable Row',
    equipment: 'Cable',
    primaryMuscleGroups: ['Back'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Single-Arm Dumbbell Row',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Back', 'Biceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Face Pull',
    equipment: 'Cable',
    primaryMuscleGroups: ['Rear Deltoids', 'Upper Back'],
    isCustom: false,
  },

  // Leg Exercises
  {
    id: uuidv4(),
    name: 'Squat',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Front Squat',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Quadriceps', 'Core'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Leg Press',
    equipment: 'Machine',
    primaryMuscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Romanian Deadlift',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Leg Extension',
    equipment: 'Machine',
    primaryMuscleGroups: ['Quadriceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Leg Curl',
    equipment: 'Machine',
    primaryMuscleGroups: ['Hamstrings'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Calf Raise',
    equipment: 'Machine',
    primaryMuscleGroups: ['Calves'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Lunge',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Bulgarian Split Squat',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    isCustom: false,
  },

  // Shoulder Exercises
  {
    id: uuidv4(),
    name: 'Overhead Press',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Shoulders', 'Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Dumbbell Shoulder Press',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Shoulders', 'Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Lateral Raise',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Shoulders'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Front Raise',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Front Deltoids'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Rear Delt Fly',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Rear Deltoids'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Upright Row',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Shoulders', 'Traps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Shrugs',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Traps'],
    isCustom: false,
  },

  // Arm Exercises
  {
    id: uuidv4(),
    name: 'Bicep Curl',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Biceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Hammer Curl',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Biceps', 'Forearms'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Preacher Curl',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Biceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Tricep Pushdown',
    equipment: 'Cable',
    primaryMuscleGroups: ['Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Skull Crusher',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Triceps'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Dip',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Triceps', 'Chest', 'Shoulders'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Tricep Extension',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Triceps'],
    isCustom: false,
  },

  // Core Exercises
  {
    id: uuidv4(),
    name: 'Crunch',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Abs'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Plank',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Core'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Russian Twist',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Obliques'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Leg Raise',
    equipment: 'Bodyweight',
    primaryMuscleGroups: ['Lower Abs'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Cable Crunch',
    equipment: 'Cable',
    primaryMuscleGroups: ['Abs'],
    isCustom: false,
  },

  // Olympic Lifts
  {
    id: uuidv4(),
    name: 'Clean and Jerk',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Full Body'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Snatch',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Full Body'],
    isCustom: false,
  },
  {
    id: uuidv4(),
    name: 'Power Clean',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Back', 'Shoulders', 'Legs'],
    isCustom: false,
  },
];

/**
 * Get the seed data for exercises
 * @returns Array of pre-populated exercise definitions
 */
export function getExerciseSeedData(): ExerciseDefinition[] {
  return seedExercises;
}
