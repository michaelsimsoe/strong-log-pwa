import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseForm } from '../components/ExerciseForm';
import { createExercise } from '@/services/data/exerciseService';
import type { ExerciseDefinition } from '@/types/data.types';

/**
 * Create Exercise Page
 * Provides a form for creating new custom exercises
 */
export function CreateExercisePage() {
  const navigate = useNavigate();

  const handleSubmit = async (values: Omit<ExerciseDefinition, 'id'>) => {
    // eslint-disable-next-line no-useless-catch
    try {
      // Ensure isCustom is set to true for user-created exercises
      const exerciseData = {
        ...values,
        isCustom: true,
      };

      await createExercise(exerciseData);

      // Navigate back to exercise list on success
      navigate('/exercises');
    } catch (error) {
      // Error handling is done in the form component
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/exercises');
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <Button variant="ghost" className="mb-4 pl-0" onClick={handleCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exercises
      </Button>

      <h1 className="text-2xl font-bold mb-6">Create New Exercise</h1>

      <ExerciseForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialValues={{
          isCustom: true,
        }}
      />
    </div>
  );
}
