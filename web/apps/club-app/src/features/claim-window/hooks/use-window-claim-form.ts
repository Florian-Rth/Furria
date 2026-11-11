import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { birthDateOf } from '../birth-date';
import type { WindowClaim } from '../requests';
import type { WindowClaimForm } from '../schemas';
import { WindowClaimFormSchema } from '../schemas';

interface WindowClaimFormState {
  form: UseFormReturn<WindowClaimForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

const EMPTY_FORM: WindowClaimForm = { firstName: '', lastName: '', day: '', month: '', year: '' };

export const useWindowClaimForm = (onClaim: (claim: WindowClaim) => void): WindowClaimFormState => {
  const form = useForm<WindowClaimForm>({
    resolver: zodResolver(WindowClaimFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    const birthDate = birthDateOf(values.day, values.month, values.year);

    if (birthDate !== null) {
      onClaim({ firstName: values.firstName, lastName: values.lastName, birthDate });
    }
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
