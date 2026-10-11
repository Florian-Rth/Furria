import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { useUpdateClubContactMutation } from '../api';
import { toClubContact, toClubContactForm, toSectionLanding } from '../club-record-labels';
import type { ClubContactForm, ClubRecord } from '../schemas';
import { ClubContactFormSchema } from '../schemas';

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
  const mutation = useUpdateClubContactMutation();

  const write = useWriteForm({
    schema: ClubContactFormSchema,
    defaults: toClubContactForm(record),
    mutate: (values) => mutation.mutateAsync(toClubContact(values)),
    landing: () => toSectionLanding('contact'),
  });

  return { ...write, errors: write.form.formState.errors };
};
