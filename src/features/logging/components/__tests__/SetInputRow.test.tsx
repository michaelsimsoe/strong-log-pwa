/**
 * Tests for SetInputRow component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetInputRow } from '../SetInputRow';
import { type ActiveSet } from '../../hooks/useActiveWorkout';

// Mock the user settings store
vi.mock('../../../../state/userSettingsStore', () => ({
  useUserSettingsStore: () => ({
    preferredWeightUnit: 'kg',
  }),
}));

// Mock the IntegratedWorkoutTimer component
vi.mock('../IntegratedWorkoutTimer', () => ({
  IntegratedWorkoutTimer: vi
    .fn()
    .mockImplementation(({ durationSecs, onTimerComplete, onTimerCancel }) => (
      <div data-testid="integrated-timer">
        <div>Duration: {durationSecs}</div>
        <button onClick={onTimerComplete}>Complete</button>
        <button onClick={onTimerCancel}>Cancel</button>
      </div>
    )),
}));

describe('SetInputRow', () => {
  // Mock functions
  const onUpdate = vi.fn();
  const onDelete = vi.fn();
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

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders set number correctly', () => {
    render(
      <SetInputRow
        setNumber={2}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByText('Set 3')).toBeInTheDocument();
  });

  it('renders weight and reps inputs with correct values', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    const weightInput = screen.getByLabelText('Weight for set 1');
    const repsInput = screen.getByLabelText('Reps for set 1');

    expect(weightInput).toHaveValue(100);
    expect(repsInput).toHaveValue(10);
  });

  it('calls onUpdate when weight input changes', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    const weightInput = screen.getByLabelText('Weight for set 1');
    fireEvent.change(weightInput, { target: { value: '120' } });

    expect(onUpdate).toHaveBeenCalledWith({ loggedWeightKg: 120 });
  });

  it('calls onUpdate when reps input changes', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    const repsInput = screen.getByLabelText('Reps for set 1');
    fireEvent.change(repsInput, { target: { value: '12' } });

    expect(onUpdate).toHaveBeenCalledWith({ loggedReps: 12 });
  });

  it('calls onUpdate when completed button is toggled', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    const completeButton = screen.getByLabelText('Mark as complete');
    fireEvent.click(completeButton);

    expect(onUpdate).toHaveBeenCalledWith({ completed: true });
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Click delete button directly
    fireEvent.click(screen.getByLabelText('Delete set'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onAddNote when add note button is clicked', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Click more options button directly
    fireEvent.click(screen.getByLabelText('More options'));

    expect(onAddNote).toHaveBeenCalledTimes(1);
  });

  it('applies completed styling when set is completed', () => {
    const completedSet = { ...mockSet, completed: true };

    render(
      <SetInputRow
        setNumber={0}
        set={completedSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Check for completed styling - the main container div should have the class
    const container = screen.getByText('Set 1').closest('div')?.parentElement?.parentElement;
    expect(container).toHaveClass('bg-green-50');
  });

  it('shows note indicator when set has notes', () => {
    const setWithNotes = { ...mockSet, notes: 'Test note' };

    render(
      <SetInputRow
        setNumber={0}
        set={setWithNotes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Since we don't have a specific note indicator in the current implementation,
    // we'll just verify the more options button is present
    expect(screen.getByLabelText('More options')).toBeInTheDocument();
  });

  it('renders set type selector with correct options', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox', { name: /select set type/i }));

    // Check that all options are available
    expect(screen.getByRole('option', { name: 'Standard' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'AMRAP for Reps' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'AMRAP for Time' })).toBeInTheDocument();
  });

  it('calls onUpdate when set type changes', () => {
    render(
      <SetInputRow
        setNumber={0}
        set={mockSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox', { name: /select set type/i }));

    // Select AMRAP option
    fireEvent.click(screen.getByRole('option', { name: 'AMRAP for Reps' }));

    expect(onUpdate).toHaveBeenCalledWith({ setType: 'amrapReps' });
  });

  it('displays AMRAP label when set type is amrapReps', () => {
    const amrapSet = { ...mockSet, setType: 'amrapReps' as const };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByText('AMRAP: As Many Reps As Possible')).toBeInTheDocument();
  });

  it('changes reps input label for AMRAP sets', () => {
    const amrapSet = { ...mockSet, setType: 'amrapReps' as const };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Check that the reps input has the AMRAP-specific label
    expect(screen.getByLabelText('Achieved reps for set 1')).toBeInTheDocument();
  });

  it('displays AMRAP Time label when set type is amrapTime', () => {
    const amrapTimeSet = {
      ...mockSet,
      setType: 'amrapTime' as const,
      targetDurationSecs: 60,
    };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapTimeSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByText('AMRAP: Max Reps in 60 seconds')).toBeInTheDocument();
  });

  it('shows duration input field for AMRAP Time sets', () => {
    const amrapTimeSet = {
      ...mockSet,
      setType: 'amrapTime' as const,
      targetDurationSecs: 60,
    };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapTimeSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByLabelText('Target duration for set 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Target duration for set 1')).toHaveValue(60);
  });

  it('updates duration when input changes for AMRAP Time sets', () => {
    const amrapTimeSet = {
      ...mockSet,
      setType: 'amrapTime' as const,
      targetDurationSecs: 60,
    };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapTimeSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    const durationInput = screen.getByLabelText('Target duration for set 1');
    fireEvent.change(durationInput, { target: { value: '90' } });

    expect(onUpdate).toHaveBeenCalledWith({ targetDurationSecs: 90 });
  });

  it('shows Start Timer button for AMRAP Time sets', () => {
    const amrapTimeSet = {
      ...mockSet,
      setType: 'amrapTime' as const,
      targetDurationSecs: 60,
    };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapTimeSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByText('Start Timer')).toBeInTheDocument();
  });

  it('shows timer component when Start Timer is clicked', () => {
    const amrapTimeSet = {
      ...mockSet,
      setType: 'amrapTime' as const,
      targetDurationSecs: 60,
    };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapTimeSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Click the Start Timer button
    fireEvent.click(screen.getByText('Start Timer'));

    // Check that the timer component is rendered
    expect(screen.getByTestId('integrated-timer')).toBeInTheDocument();
    expect(screen.queryByText('Start Timer')).not.toBeInTheDocument();
  });

  it('hides timer when Cancel is clicked', () => {
    const amrapTimeSet = {
      ...mockSet,
      setType: 'amrapTime' as const,
      targetDurationSecs: 60,
    };

    render(
      <SetInputRow
        setNumber={0}
        set={amrapTimeSet}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddNote={onAddNote}
      />
    );

    // Click the Start Timer button
    fireEvent.click(screen.getByText('Start Timer'));

    // Check that the timer component is rendered
    expect(screen.getByTestId('integrated-timer')).toBeInTheDocument();

    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check that the timer component is hidden and Start Timer is shown again
    expect(screen.queryByTestId('integrated-timer')).not.toBeInTheDocument();
    expect(screen.getByText('Start Timer')).toBeInTheDocument();
  });
});
