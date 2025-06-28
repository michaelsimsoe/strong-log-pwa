/**
 * Tests for ExercisePicker component
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExercisePicker } from '../ExercisePicker';
import { getAllExercises, searchExercisesByName } from '../../../services/data/exerciseService';

// Mock the exerciseService
vi.mock('../../../services/data/exerciseService', () => ({
  getAllExercises: vi.fn(),
  searchExercisesByName: vi.fn(),
}));

describe('ExercisePicker', () => {
  // Mock functions
  const onClose = vi.fn();
  const onSelectExercise = vi.fn();

  // Mock data
  const mockExercises = [
    {
      id: 'exercise-1',
      name: 'Bench Press',
      primaryMuscleGroups: ['Chest'],
      secondaryMuscleGroups: ['Triceps'],
      instructions: 'Lie on bench and press',
      category: 'Strength',
    },
    {
      id: 'exercise-2',
      name: 'Squat',
      primaryMuscleGroups: ['Quadriceps'],
      secondaryMuscleGroups: ['Hamstrings', 'Glutes'],
      instructions: 'Stand with barbell and squat',
      category: 'Strength',
    },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    (getAllExercises as Mock).mockResolvedValue(mockExercises);
    (searchExercisesByName as Mock).mockResolvedValue([mockExercises[0]]);
  });

  it('loads exercises when opened', async () => {
    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    expect(getAllExercises).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });
  });

  it('does not load exercises when closed', () => {
    render(<ExercisePicker isOpen={false} onClose={onClose} onSelectExercise={onSelectExercise} />);

    expect(getAllExercises).not.toHaveBeenCalled();
  });

  it('filters exercises when searching', async () => {
    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(searchInput, { target: { value: 'bench' } });

    // Should call search function
    expect(searchExercisesByName).toHaveBeenCalledWith('bench');

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Squat')).not.toBeInTheDocument();
    });
  });

  it('calls onSelectExercise when an exercise is clicked', async () => {
    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    // Wait for exercises to load
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    // Click on an exercise
    fireEvent.click(screen.getByText('Bench Press'));

    // Should call onSelectExercise with the selected exercise
    expect(onSelectExercise).toHaveBeenCalledWith(mockExercises[0]);

    // Should close the dialog
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', async () => {
    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelectExercise).not.toHaveBeenCalled();
  });

  it('displays muscle groups for exercises', async () => {
    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    // Wait for exercises to load
    await waitFor(() => {
      expect(screen.getByText('Chest')).toBeInTheDocument();
      expect(screen.getByText('Quadriceps')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching exercises', async () => {
    // Delay the promise resolution
    (getAllExercises as Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockExercises), 100);
      });
    });

    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    // Should show loading state
    expect(screen.getByText('Loading exercises...')).toBeInTheDocument();

    // Wait for exercises to load
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no exercises are found', async () => {
    // Mock empty search results
    (searchExercisesByName as Mock).mockResolvedValue([]);

    render(<ExercisePicker isOpen={true} onClose={onClose} onSelectExercise={onSelectExercise} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('No exercises found matching your search.')).toBeInTheDocument();
    });
  });
});
