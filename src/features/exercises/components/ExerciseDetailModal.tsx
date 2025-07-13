import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ExerciseDefinition } from '@/types/data.types';

interface ExerciseDetailModalProps {
  exercise: ExerciseDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (exercise: ExerciseDefinition) => void;
}

export function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  onEdit,
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{exercise.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {exercise.isCustom && <Badge variant="secondary">Custom</Badge>}
            {exercise.equipment && <Badge variant="outline">{exercise.equipment}</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Primary Muscle Groups</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.primaryMuscleGroups?.map(muscle => (
              <Badge key={muscle} variant="secondary">
                {muscle}
              </Badge>
            ))}
          </div>

          {exercise.notes && (
            <>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{exercise.notes}</p>
            </>
          )}

          {exercise.typicalAdvancedSetType && (
            <>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Typical Advanced Set Type</h3>
              <p className="text-sm text-gray-700">{exercise.typicalAdvancedSetType}</p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(exercise)}>
              Edit
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
