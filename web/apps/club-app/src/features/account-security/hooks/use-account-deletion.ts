import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useAccountDeletionMutation } from '../api';
import { toFieldRefusals } from '../field-refusals';
import type { AccountDeletionForm } from '../schemas';
import { ACCOUNT_DELETION_FIELD_NAMES, AccountDeletionFormSchema } from '../schemas';

export interface AccountDeletionControl {
  form: UseFormReturn<AccountDeletionForm>;
  passwordError: string | undefined;
  isOpen: boolean;
  isBusy: boolean;
  rejection: string | null;
  open: () => void;
  close: () => void;
  confirm: () => void;
}

export const useAccountDeletion = (): AccountDeletionControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useAccountDeletionMutation();

  const form = useForm<AccountDeletionForm>({
    resolver: zodResolver(AccountDeletionFormSchema),
    defaultValues: { password: '' },
    mode: 'onTouched',
  });

  const showFailure = (error: Error): void => {
    const failures = toFieldRefusals(error, ACCOUNT_DELETION_FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    setRejection(failures.footer);
  };

  const open = (): void => {
    setRejection(null);
    form.reset();
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const handleConfirm = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(values.password, { onError: showFailure });
  });

  return {
    form,
    passwordError: form.formState.errors.password?.message,
    isOpen,
    isBusy: mutation.isPending,
    rejection,
    open,
    close,
    confirm: () => {
      void handleConfirm();
    },
  };
};
