import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { useUpdateClubIdentityMutation } from '../api';
import { toClubIdentity, toClubIdentityForm, toSectionLanding } from '../club-record-labels';
import type { ClubIdentityForm, ClubRecord } from '../schemas';
import { ClubIdentityFormSchema } from '../schemas';

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
  const mutation = useUpdateClubIdentityMutation();

  const write = useWriteForm({
    schema: ClubIdentityFormSchema,
    defaults: toClubIdentityForm(record),
    mutate: (values) => mutation.mutateAsync(toClubIdentity(values)),
    landing: () => toSectionLanding('identity'),
  });

  return { ...write, errors: write.form.formState.errors };
};
