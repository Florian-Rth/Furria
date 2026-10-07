import { useKkNotice } from '@furria/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { useGoBackTo } from '@/lib/use-go-back-to';
import {
  PASSWORD_SAVED_MESSAGE,
  SECURITY_LANDINGS,
  SECURITY_PATH,
} from '../account-security-labels';
import { usePasswordChangeMutation } from '../api';
import { toFieldRefusals } from '../field-refusals';
import type { PasswordForm } from '../schemas';
import { PASSWORD_FIELD_NAMES, PasswordFormSchema } from '../schemas';

export interface PasswordEditorControl {
  form: UseFormReturn<PasswordForm>;
  errors: FieldErrors<PasswordForm>;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const usePasswordEditor = (): PasswordEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = usePasswordChangeMutation();
  const goBackTo = useGoBackTo();
  const raiseNotice = useKkNotice();

  const form = useForm<PasswordForm>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;

  const showFailure = (error: Error): void => {
    const failures = toFieldRefusals(error, PASSWORD_FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    setRejection(failures.footer);
  };

  const landOnSecurity = (): void => {
    raiseNotice({ tone: 'success', message: PASSWORD_SAVED_MESSAGE });
    void goBackTo({
      to: SECURITY_PATH,
      search: (previous) => ({
        ...previous,
        changed: toLandingKey(SECURITY_LANDINGS.password.kind, SECURITY_LANDINGS.password.id),
      }),
      ignoreBlocker: true,
    });
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(values, { onSuccess: landOnSecurity, onError: showFailure });
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
