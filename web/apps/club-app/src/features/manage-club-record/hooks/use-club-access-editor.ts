import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateClubAccessMutation } from '../api';
import { toClubAccessForm } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { ClubAccessFormSchema } from '../schemas';
import { useClubRecordLanding } from './use-club-record-landing';

export interface ClubAccessEditorControl {
  ageOfConsent: string;
  setAgeOfConsent: (value: string) => void;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useClubAccessEditor = (record: ClubRecord): ClubAccessEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateClubAccessMutation();
  const landOn = useClubRecordLanding();

  const form = useForm({
    resolver: zodResolver(ClubAccessFormSchema),
    defaultValues: toClubAccessForm(record),
  });
  const ageOfConsent = useController({ control: form.control, name: 'ageOfConsent' });

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(Number(values.ageOfConsent), {
      onSuccess: () => {
        landOn('access');
      },
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  });

  return {
    ageOfConsent: ageOfConsent.field.value,
    setAgeOfConsent: ageOfConsent.field.onChange,
    isDirty: form.formState.isDirty,
    isSaving: mutation.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
