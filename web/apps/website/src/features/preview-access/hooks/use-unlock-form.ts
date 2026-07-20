import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { RequestBlockedError } from '@/lib/api/errors';
import { useUnlockPreviewMutation, WrongPasswordError } from '../api';
import type { UnlockForm } from '../schemas';
import { UnlockFormSchema } from '../schemas';
import { usePreviewAccess } from './use-preview-access';

interface UnlockFormState {
  form: UseFormReturn<UnlockForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const toSubmitErrorMessage = (error: Error | null): string | null => {
  if (error === null) {
    return null;
  }

  if (error instanceof WrongPasswordError) {
    return 'Falsches Passwort. Bitte versuch es noch einmal.';
  }

  if (error instanceof RequestBlockedError) {
    return 'Die Anfrage hat den Server nicht erreicht. Falls du einen Werbeblocker oder Schutz-Add-on nutzt, erlaube diese Seite und versuch es erneut.';
  }

  return 'Das hat leider nicht geklappt. Bitte versuch es später noch einmal.';
};

export const useUnlockForm = (onGranted: () => void): UnlockFormState => {
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
        onGranted();
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
