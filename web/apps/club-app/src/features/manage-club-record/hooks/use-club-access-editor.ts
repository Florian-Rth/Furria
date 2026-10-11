import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { useUpdateClubAccessMutation } from '../api';
import { toClubAccessForm, toSectionLanding } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { ClubAccessFormSchema } from '../schemas';

export interface ClubAccessEditorControl {
  ageOfConsent: string;
  setAgeOfConsent: (value: string) => void;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useClubAccessEditor = (record: ClubRecord): ClubAccessEditorControl => {
  const mutation = useUpdateClubAccessMutation();

  const write = useWriteForm({
    schema: ClubAccessFormSchema,
    defaults: toClubAccessForm(record),
    mutate: (values) => mutation.mutateAsync(Number(values.ageOfConsent)),
    landing: () => toSectionLanding('access'),
  });
  const ageOfConsent = useController({ control: write.form.control, name: 'ageOfConsent' });

  return {
    ageOfConsent: ageOfConsent.field.value,
    setAgeOfConsent: ageOfConsent.field.onChange,
    isDirty: write.isDirty,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
