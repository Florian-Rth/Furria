import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { MailRequestForm } from '../schemas';
import { MailRequestFormSchema } from '../schemas';

interface MailRequestFormState {
  form: UseFormReturn<MailRequestForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useMailRequestForm = (onRequest: (email: string) => void): MailRequestFormState => {
  const form = useForm<MailRequestForm>({
    resolver: zodResolver(MailRequestFormSchema),
    defaultValues: { email: '' },
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    onRequest(values.email);
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
