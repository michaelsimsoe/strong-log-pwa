import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PlusCircle, Search, Filter, X } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ExerciseListItem } from '../components/ExerciseListItem';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
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
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseDefinition | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filter states
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setError(null);
        const exercises = await getAllExercises();
        setExercises(exercises);
        setFilteredExercises(exercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Extract unique muscle groups and equipment from exercises
  const { muscleGroups, equipmentTypes } = useMemo(() => {
    const muscleGroupSet = new Set<string>();
    const equipmentSet = new Set<string>();

    exercises.forEach(exercise => {
      if (exercise.primaryMuscleGroups) {
        exercise.primaryMuscleGroups.forEach(muscle => muscleGroupSet.add(muscle));
      }
      if (exercise.equipment) {
        equipmentSet.add(exercise.equipment);
      }
    });

    return {
      muscleGroups: Array.from(muscleGroupSet).sort(),
      equipmentTypes: Array.from(equipmentSet).sort(),
    };
  }, [exercises]);

  // Apply all filters (search term, muscle groups, equipment, custom only)
  useEffect(() => {
    let filtered = [...exercises];

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply muscle group filter
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(
        exercise =>
          exercise.primaryMuscleGroups &&
          selectedMuscleGroups.some(muscle => exercise.primaryMuscleGroups?.includes(muscle))
      );
    }

    // Apply equipment filter
    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(
        exercise => exercise.equipment && selectedEquipment.includes(exercise.equipment)
      );
    }

    // Apply custom only filter
    if (showCustomOnly) {
      filtered = filtered.filter(exercise => exercise.isCustom);
    }

    setFilteredExercises(filtered);
    setFiltersApplied(
      selectedMuscleGroups.length > 0 || selectedEquipment.length > 0 || showCustomOnly
    );
  }, [searchTerm, exercises, selectedMuscleGroups, selectedEquipment, showCustomOnly]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedMuscleGroups([]);
    setSelectedEquipment([]);
    setShowCustomOnly(false);
  };

  // Navigate to create exercise page
  const handleCreateExercise = () => {
    navigate('/exercises/create');
  };

  // Navigate to edit exercise page
  const handleEditExercise = (exercise: ExerciseDefinition) => {
    // Navigate to edit page for custom exercises
    navigate(`/exercises/edit/${exercise.id}`);
  };

  const handleViewExercise = (exercise: ExerciseDefinition) => {
    setSelectedExercise(exercise);
    setDetailModalOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (exercise: ExerciseDefinition) => {
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  };

  // Delete exercise handler
  const handleDeleteExercise = async (id: string) => {
    try {
      setError(null);
      await deleteExercise(id);
      setExercises(prevExercises => prevExercises.filter(exercise => exercise.id !== id));
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setError('Failed to delete exercise. Please try again.');
    }
  };

  // Confirm and delete exercise
  const handleConfirmDelete = async () => {
    if (exerciseToDelete?.id) {
      await handleDeleteExercise(exerciseToDelete.id);
    }
    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  };

  // Group exercises by custom vs pre-populated
  const customExercises = filteredExercises.filter(e => e.isCustom);
  const prePopulatedExercises = filteredExercises.filter(e => !e.isCustom);

  return (
    <div className="container max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Exercise Library</h1>
        <Button
          className="bg-[#683BF3] text-white rounded-md hover:bg-[#5930d0] transition-colors w-full sm:w-auto"
          onClick={handleCreateExercise}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Exercise!
        </Button>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {filtersApplied && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                >
                  {selectedMuscleGroups.length +
                    selectedEquipment.length +
                    (showCustomOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Exercises</SheetTitle>
              <SheetDescription>
                Filter exercises by muscle group, equipment, and type.
              </SheetDescription>
            </SheetHeader>

            <div className="py-4 h-[calc(100%-10rem)] overflow-y-auto">
              {/* Muscle Group Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Muscle Groups</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {muscleGroups.map(muscle => (
                    <div key={muscle} className="flex items-center space-x-2">
                      <Checkbox
                        id={`muscle-${muscle}`}
                        checked={selectedMuscleGroups.includes(muscle)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedMuscleGroups(prev => [...prev, muscle]);
                          } else {
                            setSelectedMuscleGroups(prev => prev.filter(m => m !== muscle));
                          }
                        }}
                      />
                      <Label htmlFor={`muscle-${muscle}`} className="text-sm">
                        {muscle}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Equipment Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Equipment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {equipmentTypes.map(equipment => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${equipment}`}
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedEquipment(prev => [...prev, equipment]);
                          } else {
                            setSelectedEquipment(prev => prev.filter(e => e !== equipment));
                          }
                        }}
                      />
                      <Label htmlFor={`equipment-${equipment}`} className="text-sm">
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Exercise Type Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Exercise Type</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom-only"
                    checked={showCustomOnly}
                    onCheckedChange={(checked: boolean) => setShowCustomOnly(checked)}
                  />
                  <Label htmlFor="custom-only" className="text-sm">
                    Custom Exercises Only
                  </Label>
                </div>
              </div>
            </div>

            <SheetFooter>
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                <SheetClose asChild>
                  <Button className="flex-1">Apply</Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {filtersApplied && (
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          {selectedMuscleGroups.map(muscle => (
            <Badge key={muscle} variant="secondary" className="flex items-center gap-1">
              {muscle}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedMuscleGroups(prev => prev.filter(m => m !== muscle))}
              />
            </Badge>
          ))}
          {selectedEquipment.map(equipment => (
            <Badge key={equipment} variant="secondary" className="flex items-center gap-1">
              {equipment}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedEquipment(prev => prev.filter(e => e !== equipment))}
              />
            </Badge>
          ))}
          {showCustomOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Custom Only
              <X className="h-3 w-3 cursor-pointer" onClick={() => setShowCustomOnly(false)} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Loading exercises...</p>
        </div>
      ) : (
        <>
          {/* Custom exercises section */}
          {customExercises.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">My Custom Exercises</h2>
              <div className="space-y-2">
                {customExercises.map(exercise => (
                  <div key={exercise.id} role="listitem" aria-label={`Exercise ${exercise.name}`}>
                    <ExerciseListItem
                      exercise={exercise}
                      onEdit={handleEditExercise}
                      onDelete={handleDeleteClick}
                      onView={() => handleViewExercise(exercise)}
                    />
                  </div>
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
                  <div key={exercise.id} role="listitem" aria-label={`Exercise ${exercise.name}`}>
                    <ExerciseListItem
                      exercise={exercise}
                      onView={() => handleViewExercise(exercise)}
                    />
                  </div>
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

      {/* Exercise detail modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={selectedExercise?.isCustom ? handleEditExercise : undefined}
      />
    </div>
  );
}
