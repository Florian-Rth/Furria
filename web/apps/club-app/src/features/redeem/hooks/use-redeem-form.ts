import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseControllerReturn, UseFormReturn } from 'react-hook-form';
import { useController, useForm, useWatch } from 'react-hook-form';
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
  contactEmailFollows: UseControllerReturn<RedeemForm, 'updateContactEmail'>;
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
    defaultValues: { loginEmail: defaultLoginEmail, password: '', updateContactEmail: true },
    mode: 'onTouched',
  });
  const typedLoginEmail = useWatch({ control: form.control, name: 'loginEmail' });
  const contactEmailFollows = useController({ control: form.control, name: 'updateContactEmail' });

  const handleFormSubmit = form.handleSubmit((values) => {
    onRedeem(values);
  });

  return {
    form,
    contactEmailFollows,
    needsConfirmation: needsEmailConfirmation(typedLoginEmail, suggestedLoginEmail),
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
