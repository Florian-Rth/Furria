import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { ConfirmationForm } from '../schemas';
import { ConfirmationFormSchema, toConfirmationDigits } from '../schemas';

interface ConfirmationFormInput {
  onConfirm: (code: string) => void;
}

interface ConfirmationFormState {
  form: UseFormReturn<ConfirmationForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useConfirmationForm = ({
  onConfirm,
}: ConfirmationFormInput): ConfirmationFormState => {
  const form = useForm<ConfirmationForm>({
    resolver: zodResolver(ConfirmationFormSchema),
    defaultValues: { code: '' },
    mode: 'onTouched',
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    onConfirm(toConfirmationDigits(values.code));
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
