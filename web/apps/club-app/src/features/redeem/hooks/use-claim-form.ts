import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { ClaimForm } from '../schemas';
import { ClaimFormSchema } from '../schemas';

interface ClaimFormInput {
  onClaim: (claimPassword: string) => void;
}

interface ClaimFormState {
  form: UseFormReturn<ClaimForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useClaimForm = ({ onClaim }: ClaimFormInput): ClaimFormState => {
  const form = useForm<ClaimForm>({
    resolver: zodResolver(ClaimFormSchema),
    defaultValues: { claimPassword: '' },
    mode: 'onTouched',
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    onClaim(values.claimPassword);
  });

  return {
    form,
    submit: (event) => {
      void handleFormSubmit(event);
    },
  };
};
