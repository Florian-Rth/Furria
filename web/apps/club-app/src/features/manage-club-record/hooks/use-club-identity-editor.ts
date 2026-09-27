import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateClubIdentityMutation } from '../api';
import { toClubIdentity, toClubIdentityForm } from '../club-record-labels';
import type { ClubIdentityForm, ClubRecord } from '../schemas';
import { ClubIdentityFormSchema } from '../schemas';
import { useClubRecordLanding } from './use-club-record-landing';

export interface ClubIdentityEditorControl {
  form: UseFormReturn<ClubIdentityForm>;
  errors: FieldErrors<ClubIdentityForm>;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useClubIdentityEditor = (record: ClubRecord): ClubIdentityEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateClubIdentityMutation();
  const landOn = useClubRecordLanding();

  const form = useForm({
    resolver: zodResolver(ClubIdentityFormSchema),
    defaultValues: toClubIdentityForm(record),
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(toClubIdentity(values), {
      onSuccess: () => {
        landOn('identity');
      },
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  });

  return {
    form,
    errors,
    isDirty,
    canSubmit: isValid,
    isSaving: mutation.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
