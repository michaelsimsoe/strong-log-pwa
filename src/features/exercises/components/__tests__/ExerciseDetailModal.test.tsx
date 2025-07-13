import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseDetailModal } from '../ExerciseDetailModal';
import type { ExerciseDefinition } from '@/types/data.types';
import type { ReactNode } from 'react';
import { vi, describe, it, expect } from 'vitest';

type DialogProps = {
  children: ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

type DialogChildProps = {
  children: ReactNode;
};

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  [key: string]: unknown;
};

type BadgeProps = {
  children: ReactNode;
  [key: string]: unknown;
};

// Mock the Dialog component since it uses Radix UI primitives
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: DialogProps) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: DialogChildProps) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: DialogChildProps) => (
    <div data-testid="dialog-description">{children}</div>
  ),
}));

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: ButtonProps) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock the Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: BadgeProps) => <span {...props}>{children}</span>,
}));

describe('ExerciseDetailModal', () => {
  const mockExercise: ExerciseDefinition = {
    id: '1',
    name: 'Bench Press',
    equipment: 'Barbell',
    primaryMuscleGroups: ['Chest', 'Triceps'],
    notes: 'Keep shoulders back',
    isCustom: true,
    typicalAdvancedSetType: 'Drop Set',
  };

  it('renders nothing when exercise is null', () => {
    render(
      <ExerciseDetailModal exercise={null} isOpen={true} onClose={() => {}} onEdit={() => {}} />
    );

    // Since we're not using container, we can just check that the dialog is not present
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders exercise details when open', () => {
    render(
      <ExerciseDetailModal
        exercise={mockExercise}
        isOpen={true}
        onClose={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Bench Press');
    expect(screen.getByText('Barbell')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
    expect(screen.getByText('Triceps')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Keep shoulders back')).toBeInTheDocument();
    expect(screen.getByText('Typical Advanced Set Type')).toBeInTheDocument();
    expect(screen.getByText('Drop Set')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ExerciseDetailModal
        exercise={mockExercise}
        isOpen={false}
        onClose={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();

    render(
      <ExerciseDetailModal
        exercise={mockExercise}
        isOpen={true}
        onClose={onCloseMock}
        onEdit={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEditMock = vi.fn();

    render(
      <ExerciseDetailModal
        exercise={mockExercise}
        isOpen={true}
        onClose={() => {}}
        onEdit={onEditMock}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(onEditMock).toHaveBeenCalledWith(mockExercise);
  });

  it('conditionally renders sections based on available data', () => {
    const exerciseWithoutNotes: ExerciseDefinition = {
      ...mockExercise,
      notes: undefined,
      typicalAdvancedSetType: undefined,
    };

    render(
      <ExerciseDetailModal
        exercise={exerciseWithoutNotes}
        isOpen={true}
        onClose={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    expect(screen.queryByText('Typical Advanced Set Type')).not.toBeInTheDocument();
  });
});
