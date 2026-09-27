import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateClubContactMutation } from '../api';
import { toClubContact, toClubContactForm } from '../club-record-labels';
import type { ClubContactForm, ClubRecord } from '../schemas';
import { ClubContactFormSchema } from '../schemas';
import { useClubRecordLanding } from './use-club-record-landing';

export interface ClubContactEditorControl {
  form: UseFormReturn<ClubContactForm>;
  errors: FieldErrors<ClubContactForm>;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useClubContactEditor = (record: ClubRecord): ClubContactEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateClubContactMutation();
  const landOn = useClubRecordLanding();

  const form = useForm({
    resolver: zodResolver(ClubContactFormSchema),
    defaultValues: toClubContactForm(record),
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(toClubContact(values), {
      onSuccess: () => {
        landOn('contact');
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
