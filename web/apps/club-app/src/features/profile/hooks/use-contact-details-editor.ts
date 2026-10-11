import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { PROFILE_PATH } from '@/features/session';
import { useWriteForm } from '@/features/write';
import type { MePerson } from '@/lib/api/schemas';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { useUpdateContactDetailsMutation } from '../api';
import { CONTACT_DETAILS_LANDING, toContactDetailsForm } from '../profile-labels';
import type { ContactDetailsForm } from '../schemas';
import { ContactDetailsFormSchema } from '../schemas';

export interface ContactDetailsEditorControl {
  form: UseFormReturn<ContactDetailsForm>;
  errors: FieldErrors<ContactDetailsForm>;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useContactDetailsEditor = (person: MePerson): ContactDetailsEditorControl => {
  const mutation = useUpdateContactDetailsMutation();
  const goBackTo = useGoBackTo();

  const write = useWriteForm({
    schema: ContactDetailsFormSchema,
    defaults: toContactDetailsForm(person),
    mutate: (values) => mutation.mutateAsync(values),
    landing: () => ({ to: PROFILE_PATH, mark: CONTACT_DETAILS_LANDING }),
  });

  const closeUnchanged = (): void => {
    void goBackTo({ to: PROFILE_PATH });
  };

  return {
    ...write,
    errors: write.form.formState.errors,
    submit: write.isDirty ? write.submit : closeUnchanged,
  };
};
