'use client';

import * as React from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

// These need to be defined here for the useFormField hook
type FormFieldContextValue<TName extends string = string> = {
  name: TName;
};

type FormItemContextValue = {
  id: string;
};

// Create the contexts
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

// Export the useFormField hook
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// Export the contexts for use in the form component
export { FormFieldContext, FormItemContext };
