import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useSignInMutation } from '../api';
import { toLoginErrorMessage } from '../login-messages';
import type { LoginForm } from '../schemas';
import { LoginFormSchema } from '../schemas';

interface LoginFormState {
  form: UseFormReturn<LoginForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const useLoginForm = (): LoginFormState => {
  const mutation = useSignInMutation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
    isSubmitting: mutation.isPending,
    submitError: toLoginErrorMessage(mutation.error),
  };
};
