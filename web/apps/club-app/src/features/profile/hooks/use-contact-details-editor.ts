import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { PROFILE_PATH } from '@/features/session';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import type { MePerson } from '@/lib/api/schemas';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateContactDetailsMutation } from '../api';
import { CONTACT_DETAILS_LANDING, toContactDetailsForm } from '../profile-labels';
import type { ContactDetailsForm } from '../schemas';
import { CONTACT_DETAILS_FIELD_NAMES, ContactDetailsFormSchema } from '../schemas';

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
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateContactDetailsMutation();
  const goBackTo = useGoBackTo();

  const form = useForm<ContactDetailsForm>({
    resolver: zodResolver(ContactDetailsFormSchema),
    defaultValues: toContactDetailsForm(person),
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, CONTACT_DETAILS_FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    setRejection(
      failures.footer ?? (failures.fields.length === 0 ? toWriteErrorMessage(error) : null),
    );
  };

  const landOnProfile = (): void => {
    void goBackTo({
      to: PROFILE_PATH,
      search: (previous) => ({
        ...previous,
        changed: toLandingKey(CONTACT_DETAILS_LANDING.kind, CONTACT_DETAILS_LANDING.id),
      }),
      ignoreBlocker: true,
    });
  };

  const closeUnchanged = (): void => {
    void goBackTo({ to: PROFILE_PATH });
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (!isDirty) {
      closeUnchanged();
      return;
    }

    mutation.mutate(values, { onSuccess: landOnProfile, onError: showFailure });
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
