import { zodResolver } from '@hookform/resolvers/zod';
import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toPasskeyErrorMessage } from '@/lib/passkey/passkey-messages';
import { usePasskeySupport } from '@/lib/passkey/use-passkey-support';
import { toFieldRefusals } from '../field-refusals';
import type { ReauthenticationForm } from '../schemas';
import { REAUTHENTICATION_FIELD_NAMES, ReauthenticationFormSchema } from '../schemas';
import type { ReauthenticationProof } from '../types';

export interface ReauthenticationControl {
  form: UseFormReturn<ReauthenticationForm>;
  passwordError: string | undefined;
  isOpen: boolean;
  isBusy: boolean;
  rejection: string | null;
  offersPasskey: boolean;
  open: () => void;
  close: () => void;
  confirm: () => void;
  confirmWithPasskey: () => void;
}

export const useReauthentication = <TResult>(
  hasPasskeys: boolean,
  mutation: UseMutationResult<TResult, Error, ReauthenticationProof>,
  onProven?: (result: TResult) => void,
): ReauthenticationControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const isPasskeySupported = usePasskeySupport();

  const form = useForm<ReauthenticationForm>({
    resolver: zodResolver(ReauthenticationFormSchema),
    defaultValues: { password: '' },
    mode: 'onTouched',
  });

  const showFailure = (error: Error): void => {
    const failures = toFieldRefusals(error, REAUTHENTICATION_FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    setRejection(failures.footer);
  };

  const showPasskeyFailure = (error: Error): void => {
    setRejection(toPasskeyErrorMessage(error));
  };

  const finish = (result: TResult): void => {
    setIsOpen(false);
    onProven?.(result);
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
    mutation.mutate(
      { kind: 'password', password: values.password },
      { onSuccess: finish, onError: showFailure },
    );
  });

  const confirmWithPasskey = (): void => {
    setRejection(null);
    form.clearErrors();
    mutation.mutate({ kind: 'passkey' }, { onSuccess: finish, onError: showPasskeyFailure });
  };

  return {
    form,
    passwordError: form.formState.errors.password?.message,
    isOpen,
    isBusy: mutation.isPending,
    rejection,
    offersPasskey: hasPasskeys && isPasskeySupported,
    open,
    close,
    confirm: () => {
      void handleConfirm();
    },
    confirmWithPasskey,
  };
};
