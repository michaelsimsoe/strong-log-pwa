import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseForm } from '../components/ExerciseForm';
import { getExerciseById, updateExercise } from '@/services/data/exerciseService';
import type { ExerciseDefinition } from '@/types/data.types';

/**
 * Edit Exercise Page
 * Provides a form for editing existing custom exercises
 */
export function EditExercisePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<ExerciseDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exercise data on component mount
  useEffect(() => {
    const loadExercise = async () => {
      if (!id) {
        setError('Exercise ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const exerciseData = await getExerciseById(id);

        if (!exerciseData) {
          setError('Exercise not found');
        } else if (!exerciseData.isCustom) {
          setError('Cannot edit pre-populated exercises');
        } else {
          setExercise(exerciseData);
        }
      } catch (err) {
        console.error('Failed to load exercise:', err);
        setError('Failed to load exercise');
      } finally {
        setIsLoading(false);
      }
    };

    loadExercise();
  }, [id]);

  const handleSubmit = async (values: Omit<ExerciseDefinition, 'id'>) => {
    if (!id || !exercise) return;

    // eslint-disable-next-line no-useless-catch
    try {
      // Preserve isCustom status
      const exerciseData = {
        ...values,
        isCustom: true,
      };

      await updateExercise(id, exerciseData);

      // Navigate back to exercise list on success
      navigate('/exercises');
    } catch (err) {
      // Error handling is done in the form component
      throw err;
    }
  };

  const handleCancel = () => {
    navigate('/exercises');
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-6 px-4">
        <p>Loading exercise...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="container max-w-2xl mx-auto py-6 px-4">
        <Button variant="ghost" className="mb-4 pl-0" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exercises
        </Button>

        <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
          <h2 className="font-semibold">Error</h2>
          <p>{error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <Button variant="ghost" className="mb-4 pl-0" onClick={handleCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exercises
      </Button>

      <h1 className="text-2xl font-bold mb-6">Edit Exercise</h1>

      <ExerciseForm
        initialValues={exercise}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
}
