import { useKkNotice } from '@furria/ui';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import {
  PASSWORD_SAVED_MESSAGE,
  SECURITY_LANDINGS,
  SECURITY_PATH,
} from '../account-security-labels';
import { usePasswordChangeMutation } from '../api';
import type { PasswordForm } from '../schemas';
import { PasswordFormSchema } from '../schemas';

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
  const mutation = usePasswordChangeMutation();
  const raiseNotice = useKkNotice();

  const write = useWriteForm({
    schema: PasswordFormSchema,
    defaults: { currentPassword: '', newPassword: '' },
    mutate: (values) => mutation.mutateAsync(values),
    landing: () => ({ to: SECURITY_PATH, mark: SECURITY_LANDINGS.password }),
    onLanded: () => {
      raiseNotice({ tone: 'success', message: PASSWORD_SAVED_MESSAGE });
    },
  });

  return { ...write, errors: write.form.formState.errors };
};
