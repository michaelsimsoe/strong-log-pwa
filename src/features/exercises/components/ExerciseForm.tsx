import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { exerciseDefinitionSchema, type ExerciseDefinition } from '@/types/data.types';

// Common equipment options for the select dropdown
const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Kettlebell',
  'Resistance Band',
  'Smith Machine',
  'Other',
];

// Form schema for exercise creation/editing
const exerciseFormSchema = exerciseDefinitionSchema.omit({ id: true }).extend({
  // Override primaryMuscleGroups to make it optional string input for simplicity
  primaryMuscleGroups: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(group => group.trim()) : undefined)),
  // Add preferredWeightUnit field for user convenience
  preferredWeightUnit: z.enum(['kg', 'lbs']).optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseDefinition>;
  onSubmit: (values: ExerciseFormValues) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

/**
 * Form component for creating or editing exercise definitions
 */
export function ExerciseForm({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
}: ExerciseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert primaryMuscleGroups array to comma-separated string for the form
  const defaultValues: Partial<ExerciseFormValues> = {
    name: initialValues?.name || '',
    equipment: initialValues?.equipment || '',
    primaryMuscleGroups: initialValues?.primaryMuscleGroups?.join(', ') || '',
    notes: initialValues?.notes || '',
    isCustom: initialValues?.isCustom !== undefined ? initialValues.isCustom : true,
    preferredWeightUnit: initialValues?.typicalAdvancedSetType as 'kg' | 'lbs' | undefined,
  };

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: ExerciseFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
      // If there's an error with the name field (e.g., duplicate name)
      if (error instanceof Error && error.message.includes('name')) {
        form.setError('name', {
          type: 'manual',
          message: error.message,
        });
      } else {
        // Handle other errors
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cable Flys" {...field} />
              </FormControl>
              <FormDescription>Enter a unique name for this exercise</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map(equipment => (
                    <SelectItem key={equipment} value={equipment}>
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the primary equipment used for this exercise</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryMuscleGroups"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Muscle Groups</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chest, Triceps (comma separated)" {...field} />
              </FormControl>
              <FormDescription>
                Enter muscle groups targeted by this exercise, separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredWeightUnit"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Default Units</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="kg" />
                    </FormControl>
                    <FormLabel className="font-normal">kg</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lbs" />
                    </FormControl>
                    <FormLabel className="font-normal">lbs</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>Select the default weight unit for this exercise</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Any additional notes about this exercise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Exercise' : 'Create Exercise'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
