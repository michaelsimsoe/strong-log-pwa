import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseListItem } from '../ExerciseListItem';
import type { ExerciseDefinition } from '@/types/data.types';

describe('ExerciseListItem', () => {
  const mockExercise: ExerciseDefinition = {
    id: '1',
    name: 'Bench Press',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Chest', 'Triceps'],
    notes: 'Keep shoulders back',
    isCustom: false,
  };

  const mockCustomExercise: ExerciseDefinition = {
    id: '2',
    name: 'Custom Exercise',
    equipment: 'Dumbbell',
    primaryMuscleGroups: ['Biceps'],
    notes: 'Test notes',
    isCustom: true,
  };

  it('renders exercise information correctly', () => {
    render(<ExerciseListItem exercise={mockExercise} />);

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Barbell')).toBeInTheDocument();
    expect(screen.getByText('• Chest, Triceps')).toBeInTheDocument();
  });

  it('shows Custom badge for custom exercises', () => {
    render(<ExerciseListItem exercise={mockCustomExercise} />);

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('does not show Custom badge for standard exercises', () => {
    render(<ExerciseListItem exercise={mockExercise} />);

    expect(screen.queryByText('Custom')).not.toBeInTheDocument();
  });

  it('shows View button when onView prop is provided', () => {
    const onViewMock = jest.fn();
    render(<ExerciseListItem exercise={mockExercise} onView={onViewMock} />);

    expect(screen.getByLabelText('View Bench Press')).toBeInTheDocument();
  });

  it('calls onView when View button is clicked', () => {
    const onViewMock = jest.fn();
    render(<ExerciseListItem exercise={mockExercise} onView={onViewMock} />);

    fireEvent.click(screen.getByLabelText('View Bench Press'));
    expect(onViewMock).toHaveBeenCalledWith(mockExercise);
  });

  it('shows Edit and Delete buttons for custom exercises when handlers are provided', () => {
    const onEditMock = jest.fn();
    const onDeleteMock = jest.fn();

    render(
      <ExerciseListItem exercise={mockCustomExercise} onEdit={onEditMock} onDelete={onDeleteMock} />
    );

    expect(screen.getByLabelText('Edit Custom Exercise')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Custom Exercise')).toBeInTheDocument();
  });

  it('does not show Edit and Delete buttons for standard exercises', () => {
    const onEditMock = jest.fn();
    const onDeleteMock = jest.fn();

    render(
      <ExerciseListItem exercise={mockExercise} onEdit={onEditMock} onDelete={onDeleteMock} />
    );

    expect(screen.queryByLabelText('Edit Bench Press')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete Bench Press')).not.toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEditMock = jest.fn();

    render(<ExerciseListItem exercise={mockCustomExercise} onEdit={onEditMock} />);

    fireEvent.click(screen.getByLabelText('Edit Custom Exercise'));
    expect(onEditMock).toHaveBeenCalledWith(mockCustomExercise);
  });

  it('calls onDelete when Delete button is clicked', () => {
    const onDeleteMock = jest.fn();

    render(<ExerciseListItem exercise={mockCustomExercise} onDelete={onDeleteMock} />);

    fireEvent.click(screen.getByLabelText('Delete Custom Exercise'));
    expect(onDeleteMock).toHaveBeenCalledWith(mockCustomExercise);
  });

  it('handles missing optional props gracefully', () => {
    render(<ExerciseListItem exercise={mockExercise} />);

    // Should not throw errors when optional props are missing
    expect(screen.queryByText('View')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
