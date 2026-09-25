import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { RedeemForm } from '../schemas';
import { RedeemFormSchema } from '../schemas';

interface RedeemFormInput {
  onRedeem: (password: string) => void;
}

interface RedeemFormState {
  form: UseFormReturn<RedeemForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useRedeemForm = ({ onRedeem }: RedeemFormInput): RedeemFormState => {
  const form = useForm<RedeemForm>({
    resolver: zodResolver(RedeemFormSchema),
    defaultValues: { password: '' },
    mode: 'onTouched',
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    onRedeem(values.password);
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
