import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { needsEmailConfirmation } from '../redeem-stage';
import type { RedeemForm } from '../schemas';
import { RedeemFormSchema } from '../schemas';

interface RedeemFormInput {
  defaultLoginEmail: string;
  suggestedLoginEmail: string | null;
  onRedeem: (values: RedeemForm) => void;
}

interface RedeemFormState {
  form: UseFormReturn<RedeemForm>;
  needsConfirmation: boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useRedeemForm = ({
  defaultLoginEmail,
  suggestedLoginEmail,
  onRedeem,
}: RedeemFormInput): RedeemFormState => {
  const form = useForm<RedeemForm>({
    resolver: zodResolver(RedeemFormSchema),
    defaultValues: { loginEmail: defaultLoginEmail, password: '' },
    mode: 'onTouched',
  });
  const typedLoginEmail = useWatch({ control: form.control, name: 'loginEmail' });

  const handleFormSubmit = form.handleSubmit((values) => {
    onRedeem(values);
  });

  return {
    form,
    needsConfirmation: needsEmailConfirmation(typedLoginEmail, suggestedLoginEmail),
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
