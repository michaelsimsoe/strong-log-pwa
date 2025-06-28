/**
 * Tests for ExerciseLogCard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseLogCard } from '../ExerciseLogCard';
import { type ActiveExercise, type ActiveSet } from '../../hooks/useActiveWorkout';

describe('ExerciseLogCard', () => {
  // Mock functions
  const onAddSet = vi.fn();
  const onUpdateSet = vi.fn();
  const onRemoveSet = vi.fn();
  const onRemoveExercise = vi.fn();
  const onAddNote = vi.fn();

  // Mock data
  const mockSet: ActiveSet = {
    id: 'set-1',
    orderInExercise: 0,
    setType: 'standard',
    loggedWeightKg: 100,
    loggedReps: 10,
    completed: false,
    notes: '',
  };

  const mockExercise: ActiveExercise = {
    exerciseDefinitionId: 'exercise-1',
    exerciseDefinition: {
      id: 'exercise-1',
      name: 'Bench Press',
      primaryMuscleGroups: ['Chest'],
      isCustom: false,
    },
    orderInWorkout: 0,
    sets: [mockSet],
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exercise name correctly', () => {
    render(
      <ExerciseLogCard
        exercise={mockExercise}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('renders set input rows for each set', () => {
    render(
      <ExerciseLogCard
        exercise={mockExercise}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    // Check for set number
    expect(screen.getByText('Set 1')).toBeInTheDocument();

    // Check for weight and reps inputs
    // Note: SetInputRow is tested separately, so we're just checking if it's rendered
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
  });

  it('shows empty state when no sets are present', () => {
    const exerciseWithNoSets = {
      ...mockExercise,
      sets: [],
    };

    render(
      <ExerciseLogCard
        exercise={exerciseWithNoSets}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    expect(
      screen.getByText('No sets added yet. Click "Add Set" to start logging.')
    ).toBeInTheDocument();
  });

  it('calls onAddSet when Add Set button is clicked', () => {
    render(
      <ExerciseLogCard
        exercise={mockExercise}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    fireEvent.click(screen.getByText('Add Set'));
    expect(onAddSet).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation when remove exercise button is clicked', () => {
    render(
      <ExerciseLogCard
        exercise={mockExercise}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    // Click the remove exercise button (trash icon)
    fireEvent.click(screen.getByLabelText('Remove exercise'));

    // Check if confirmation dialog is shown
    expect(screen.getByText('Remove this exercise from your workout?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onRemoveExercise when confirmation is confirmed', () => {
    render(
      <ExerciseLogCard
        exercise={mockExercise}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    // Click the remove exercise button
    fireEvent.click(screen.getByLabelText('Remove exercise'));

    // Confirm deletion
    fireEvent.click(screen.getByText('Remove'));

    expect(onRemoveExercise).toHaveBeenCalledTimes(1);
  });

  it('cancels delete confirmation when Cancel button is clicked', () => {
    render(
      <ExerciseLogCard
        exercise={mockExercise}
        onAddSet={onAddSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
        onAddNote={onAddNote}
      />
    );

    // Click the remove exercise button
    fireEvent.click(screen.getByLabelText('Remove exercise'));

    // Cancel deletion
    fireEvent.click(screen.getByText('Cancel'));

    // Confirmation should be closed
    expect(screen.queryByText('Remove this exercise from your workout?')).not.toBeInTheDocument();
    expect(onRemoveExercise).not.toHaveBeenCalled();
  });
});
