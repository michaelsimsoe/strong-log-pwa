import { Edit, Trash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ExerciseDefinition } from '@/types/data.types';

interface ExerciseListItemProps {
  exercise: ExerciseDefinition;
  onEdit?: (exercise: ExerciseDefinition) => void;
  onDelete?: (exercise: ExerciseDefinition) => void;
  onView?: (exercise: ExerciseDefinition) => void;
}

/**
 * Component for displaying an individual exercise in the exercise list
 */
export function ExerciseListItem({ exercise, onEdit, onDelete, onView }: ExerciseListItemProps) {
  const isCustom = exercise.isCustom;

  return (
    <Card className="mb-2 hover:bg-accent/10 transition-colors">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-lg">{exercise.name}</h3>
            {isCustom && (
              <Badge variant="outline" className="bg-primary/10 text-xs">
                Custom
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-2">
            {exercise.equipment && <span className="inline-block">{exercise.equipment}</span>}

            {exercise.primaryMuscleGroups && exercise.primaryMuscleGroups.length > 0 && (
              <span className="inline-block">• {exercise.primaryMuscleGroups.join(', ')}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 justify-end">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(exercise)}
              aria-label={`View ${exercise.name}`}
              className="hidden sm:flex"
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          )}

          {/* Mobile-only view button with just icon */}
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(exercise)}
              aria-label={`View ${exercise.name}`}
              className="sm:hidden px-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {isCustom && onEdit && (
            <Button
              variant="ghost"
              className="bg-[#683BF3] text-white rounded-md hover:bg-[#5930d0] transition-colors hidden sm:flex"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onEdit(exercise);
              }}
              aria-label={`Edit ${exercise.name}`}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}

          {/* Mobile-only edit button with just icon */}
          {isCustom && onEdit && (
            <Button
              variant="ghost"
              className="bg-[#683BF3] text-white rounded-md hover:bg-[#5930d0] transition-colors sm:hidden px-2"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onEdit(exercise);
              }}
              aria-label={`Edit ${exercise.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {isCustom && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onDelete(exercise);
              }}
              aria-label={`Delete ${exercise.name}`}
              className="text-destructive hidden sm:flex"
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}

          {/* Mobile-only delete button with just icon */}
          {isCustom && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onDelete(exercise);
              }}
              aria-label={`Delete ${exercise.name}`}
              className="text-destructive sm:hidden px-2"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
