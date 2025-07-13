import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExerciseListPage } from '../ExerciseListPage';
import type { ReactNode } from 'react';
import type { ExerciseDefinition } from '@/types/data.types';

// Import vi from vitest for mocking (replacing jest)
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create a mock exerciseService
const exerciseService = {
  getAllExercises: vi.fn(),
  deleteExercise: vi.fn(),
};

// Define common prop types for components
type ChildrenProps = {
  children: ReactNode;
};

type DialogProps = {
  children: ReactNode;
  open?: boolean;
};

type CheckboxProps = {
  id: string;
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type ActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

type ExerciseModalProps = {
  exercise: ExerciseDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (exercise: ExerciseDefinition) => void;
};

// Mock the react-router useNavigate hook
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock the exerciseService
vi.mock('@/services/exerciseService', () => ({
  getAllExercises: vi.fn(),
  deleteExercise: vi.fn(),
}));

// Mock the UI components
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: ChildrenProps) => <div data-testid="sheet">{children}</div>,
  SheetTrigger: ({ children }: ChildrenProps) => (
    <button data-testid="sheet-trigger">{children}</button>
  ),
  SheetContent: ({ children }: ChildrenProps) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: ChildrenProps) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: ChildrenProps) => <div data-testid="sheet-title">{children}</div>,
  SheetFooter: ({ children }: ChildrenProps) => <div data-testid="sheet-footer">{children}</div>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id, checked, onCheckedChange }: CheckboxProps) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={e => onCheckedChange(e.target.checked)}
      data-testid={id}
    />
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: DialogProps) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: ChildrenProps) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: ChildrenProps) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: ChildrenProps) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: ChildrenProps) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: ChildrenProps) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: DialogProps) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogTrigger: ({ children }: ChildrenProps) => (
    <button data-testid="alert-dialog-trigger">{children}</button>
  ),
  AlertDialogContent: ({ children }: ChildrenProps) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: ChildrenProps) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogFooter: ({ children }: ChildrenProps) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogTitle: ({ children }: ChildrenProps) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: ChildrenProps) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogAction: ({ children, onClick }: ActionButtonProps) => (
    <button data-testid="alert-dialog-action" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: ChildrenProps) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
}));

// Mock the ExerciseDetailModal component
vi.mock('../../components/ExerciseDetailModal', () => ({
  ExerciseDetailModal: ({ exercise, isOpen, onClose, onEdit }: ExerciseModalProps) =>
    isOpen ? (
      <div data-testid="exercise-detail-modal">
        <div>Exercise: {exercise?.name}</div>
        <button onClick={() => onClose()}>Close</button>
        {onEdit && exercise && <button onClick={() => onEdit(exercise)}>Edit</button>}
      </div>
    ) : null,
}));

// Mock the ExerciseListItem component
vi.mock('../../components/ExerciseListItem', () => ({
  ExerciseListItem: ({
    exercise,
    onEdit,
    onDelete,
    onView,
  }: {
    exercise: ExerciseDefinition;
    onEdit?: (exercise: ExerciseDefinition) => void;
    onDelete?: (exercise: ExerciseDefinition) => void;
    onView?: (exercise: ExerciseDefinition) => void;
  }) => (
    <div data-testid={`exercise-item-${exercise.id}`}>
      <div>{exercise.name}</div>
      {onView && <button onClick={() => onView(exercise)}>View</button>}
      {onEdit && <button onClick={() => onEdit(exercise)}>Edit</button>}
      {onDelete && <button onClick={() => onDelete(exercise)}>Delete</button>}
    </div>
  ),
}));

describe('ExerciseListPage', () => {
  const mockExercises = [
    {
      id: '1',
      name: 'Bench Press',
      equipment: 'Barbell',
      primaryMuscleGroups: ['Chest', 'Triceps'],
      isCustom: false,
    },
    {
      id: '2',
      name: 'Squat',
      equipment: 'Barbell',
      primaryMuscleGroups: ['Quadriceps', 'Glutes'],
      isCustom: false,
    },
    {
      id: '3',
      name: 'Custom Exercise',
      equipment: 'Dumbbell',
      primaryMuscleGroups: ['Biceps'],
      isCustom: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (exerciseService.getAllExercises as ReturnType<typeof vi.fn>).mockResolvedValue(mockExercises);
  });

  it('renders loading state initially', () => {
    render(<ExerciseListPage />);
    expect(screen.getByText('Loading exercises...')).toBeInTheDocument();
  });

  it('displays exercises after loading', async () => {
    render(<ExerciseListPage />);

    // Wait for exercises to load
    await waitFor(() => {
      expect(screen.getByText('Exercise Library')).toBeInTheDocument();
    });

    expect(exerciseService.getAllExercises).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Custom Exercise')).toBeInTheDocument();
  });

  it('shows error message when loading fails', async () => {
    (exerciseService.getAllExercises as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Failed to load')
    );

    render(<ExerciseListPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText('Failed to load exercises. Please try again later.')
    ).toBeInTheDocument();
  });

  it('filters exercises by search term', async () => {
    render(<ExerciseListPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(searchInput, { target: { value: 'Bench' } });

    expect(screen.getByTestId('exercise-item-1')).toBeInTheDocument(); // Bench Press
    expect(screen.queryByTestId('exercise-item-2')).not.toBeInTheDocument(); // Squat
    expect(screen.queryByTestId('exercise-item-3')).not.toBeInTheDocument(); // Custom Exercise
  });

  it('opens filter sheet when filter button is clicked', async () => {
    render(<ExerciseListPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('sheet-trigger'));
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
  });

  it('opens exercise detail modal when view is clicked', async () => {
    render(<ExerciseListPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });

    // Find the View button in the first exercise item and click it
    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);

    expect(screen.getByTestId('exercise-detail-modal')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog when delete is clicked', async () => {
    render(<ExerciseListPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });

    // Find the Delete button in the custom exercise item and click it
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
  });

  it('deletes exercise when confirmation is confirmed', async () => {
    (exerciseService.deleteExercise as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<ExerciseListPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading exercises...')).not.toBeInTheDocument();
    });

    // Find the Delete button in the custom exercise item and click it
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    fireEvent.click(screen.getByTestId('alert-dialog-action'));

    expect(exerciseService.deleteExercise).toHaveBeenCalled();
  });
});
