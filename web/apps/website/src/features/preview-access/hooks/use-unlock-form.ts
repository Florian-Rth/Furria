import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useUnlockPreviewMutation } from '../api';
import type { UnlockForm } from '../schemas';
import { UnlockFormSchema } from '../schemas';
import { toSubmitErrorMessage } from '../unlock-failure';
import { usePreviewAccess } from './use-preview-access';

interface UnlockFormState {
  form: UseFormReturn<UnlockForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const useUnlockForm = (): UnlockFormState => {
  const { grantAccess } = usePreviewAccess();
  const mutation = useUnlockPreviewMutation();

  const form = useForm<UnlockForm>({
    resolver: zodResolver(UnlockFormSchema),
    defaultValues: { password: '' },
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.password, {
      onSuccess: () => {
        grantAccess();
      },
    });
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
    isSubmitting: mutation.isPending,
    submitError: toSubmitErrorMessage(mutation.error),
  };
};
