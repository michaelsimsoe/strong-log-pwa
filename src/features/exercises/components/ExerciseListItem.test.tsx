import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseListItem } from './ExerciseListItem';
import type { ExerciseDefinition } from '@/types/data.types';

describe('ExerciseListItem', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders custom exercise correctly with edit and delete buttons', () => {
    const customExercise: ExerciseDefinition = {
      id: 'test-id',
      name: 'Custom Exercise',
      equipment: 'Barbell',
      primaryMuscleGroups: ['Chest', 'Triceps'],
      isCustom: true,
    };

    render(
      <ExerciseListItem exercise={customExercise} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Check exercise details are displayed
    expect(screen.getByText('Custom Exercise')).toBeInTheDocument();
    expect(screen.getByText('Barbell')).toBeInTheDocument();
    expect(screen.getByText('• Chest, Triceps')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();

    // Check edit and delete buttons are present
    expect(screen.getByLabelText('Edit Custom Exercise')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Custom Exercise')).toBeInTheDocument();
  });

  it('renders pre-populated exercise without edit and delete buttons', () => {
    const prePopulatedExercise: ExerciseDefinition = {
      id: 'test-id',
      name: 'Pre-populated Exercise',
      equipment: 'Machine',
      primaryMuscleGroups: ['Back'],
      isCustom: false,
    };

    render(
      <ExerciseListItem
        exercise={prePopulatedExercise}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check exercise details are displayed
    expect(screen.getByText('Pre-populated Exercise')).toBeInTheDocument();
    expect(screen.getByText('Machine')).toBeInTheDocument();
    expect(screen.getByText('• Back')).toBeInTheDocument();

    // Check that 'Custom' badge is not present
    expect(screen.queryByText('Custom')).not.toBeInTheDocument();

    // Check edit and delete buttons are not present
    expect(screen.queryByLabelText(/Edit/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Delete/)).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const customExercise: ExerciseDefinition = {
      id: 'test-id',
      name: 'Custom Exercise',
      isCustom: true,
    };

    render(
      <ExerciseListItem exercise={customExercise} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getByLabelText('Edit Custom Exercise');
    await userEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(customExercise);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const customExercise: ExerciseDefinition = {
      id: 'test-id',
      name: 'Custom Exercise',
      isCustom: true,
    };

    render(
      <ExerciseListItem exercise={customExercise} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByLabelText('Delete Custom Exercise');
    await userEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(customExercise);
    // We don't need to check if onEdit was called as it's not relevant to this test
  });

  it('renders without equipment and muscle groups when not provided', () => {
    const minimalExercise: ExerciseDefinition = {
      id: 'test-id',
      name: 'Minimal Exercise',
      isCustom: true,
    };

    render(
      <ExerciseListItem exercise={minimalExercise} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Minimal Exercise')).toBeInTheDocument();
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });
});
