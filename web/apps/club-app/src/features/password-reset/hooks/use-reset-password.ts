import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { PASSWORD_RESET_FLAG } from '@/features/login';
import { LOGIN_PATH } from '@/lib/return-to';
import { useResetPasswordMutation } from '../api';
import { toResetFailureKind } from '../reset-failure';
import type { ResetErrorMessages } from '../reset-messages';
import { toResetErrorMessages } from '../reset-messages';
import type { ResetPasswordForm } from '../schemas';
import { ResetPasswordFormSchema } from '../schemas';

interface ResetPasswordControl {
  isDead: boolean;
  form: UseFormReturn<ResetPasswordForm>;
  isResetting: boolean;
  errors: ResetErrorMessages;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  clearRefusal: () => void;
}

export const useResetPassword = (reset: string | null): ResetPasswordControl => {
  const mutation = useResetPasswordMutation();
  const navigate = useNavigate();
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { password: '' },
    mode: 'onTouched',
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    if (reset === null) {
      return;
    }

    mutation.mutate(
      { reset, password: values.password },
      {
        onSuccess: () => {
          void navigate({
            to: LOGIN_PATH,
            search: { passwordReset: PASSWORD_RESET_FLAG },
            replace: true,
          });
        },
      },
    );
  });

  return {
    isDead: reset === null || toResetFailureKind(mutation.error) === 'dead',
    form,
    isResetting: mutation.isPending || mutation.isSuccess,
    errors: toResetErrorMessages(mutation.error),
    submit: (event) => {
      void handleFormSubmit(event);
    },
    clearRefusal: () => {
      mutation.reset();
    },
  };
};
