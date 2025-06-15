import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExerciseListItem } from '../components/ExerciseListItem';
import { getAllExercises, deleteExercise } from '@/services/data/exerciseService';
import type { ExerciseDefinition } from '@/types/data.types';

/**
 * Exercise Library Page
 * Displays a list of all exercises with search functionality
 * and options to create, edit, and delete exercises
 */
export function ExerciseListPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<ExerciseDefinition[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseDefinition | null>(null);

  // Load all exercises on component mount
  useEffect(() => {
    const loadExercises = async () => {
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

    loadExercises();
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm, exercises]);

  // Navigate to create exercise page
  const handleCreateExercise = () => {
    navigate('/exercises/create');
  };

  // Navigate to edit exercise page
  const handleEditExercise = (exercise: ExerciseDefinition) => {
    if (exercise.id) {
      navigate(`/exercises/edit/${exercise.id}`);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (exercise: ExerciseDefinition) => {
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  };

  // Confirm and delete exercise
  const handleConfirmDelete = async () => {
    if (exerciseToDelete?.id) {
      try {
        await deleteExercise(exerciseToDelete.id);
        // Update the exercises list
        setExercises(prevExercises => prevExercises.filter(e => e.id !== exerciseToDelete.id));
      } catch (error) {
        console.error('Failed to delete exercise:', error);
        // TODO: Show error toast
      }
    }
    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  };

  // Group exercises by custom vs pre-populated
  const customExercises = filteredExercises.filter(e => e.isCustom);
  const prePopulatedExercises = filteredExercises.filter(e => !e.isCustom);

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <Button onClick={handleCreateExercise}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Exercise
        </Button>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          className="pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading exercises...</div>
      ) : (
        <>
          {/* Custom exercises section */}
          {customExercises.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">My Custom Exercises</h2>
              <div className="space-y-2">
                {customExercises.map(exercise => (
                  <ExerciseListItem
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={handleEditExercise}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pre-populated exercises section */}
          {prePopulatedExercises.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Standard Exercises</h2>
              <div className="space-y-2">
                {prePopulatedExercises.map(exercise => (
                  <ExerciseListItem key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {filteredExercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No exercises found. Try a different search term or create a new exercise.
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{exerciseToDelete?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
