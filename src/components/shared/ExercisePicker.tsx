/**
 * ExercisePicker Component
 *
 * A modal dialog component for selecting exercises to add to a workout.
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  AlertDialog as Dialog,
  AlertDialogContent as DialogContent,
  AlertDialogHeader as DialogHeader,
  AlertDialogTitle as DialogTitle,
  AlertDialogFooter as DialogFooter,
} from '../ui/alert-dialog';
import { type ExerciseDefinition } from '../../types/data.types';
import { getAllExercises, searchExercisesByName } from '../../services/data/exerciseService';

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
}

export function ExercisePicker({ isOpen, onClose, onSelectExercise }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<ExerciseDefinition[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load exercises when the component mounts or the dialog opens
  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  // Load all exercises from the database
  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const allExercises = await getAllExercises();
      setExercises(allExercises);
      setFilteredExercises(allExercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      // If search is cleared, show all exercises
      setFilteredExercises(exercises);
    } else {
      // Otherwise, search for exercises by name
      try {
        const results = await searchExercisesByName(term);
        setFilteredExercises(results);
      } catch (error) {
        console.error('Failed to search exercises:', error);
      }
    }
  };

  // Handle exercise selection
  const handleSelectExercise = (exercise: ExerciseDefinition) => {
    onSelectExercise(exercise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Exercise list */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? 'No exercises found matching your search.' : 'No exercises available.'}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredExercises.map(exercise => (
                <li key={exercise.id} className="py-2">
                  <button
                    type="button"
                    onClick={() => handleSelectExercise(exercise)}
                    className="w-full text-left px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <div className="font-medium">{exercise.name}</div>
                    {exercise.primaryMuscleGroups && exercise.primaryMuscleGroups.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {exercise.primaryMuscleGroups.join(', ')}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
