import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { AccountLockAct } from '../access-actions';
import { useAccountLockMutation } from '../api';
import type { AccessSubject } from '../types';

interface AccountLockInput {
  subject: AccessSubject;
  act: AccountLockAct;
  onLocked: () => void;
}

export interface AccountLockControl {
  isOpen: boolean;
  isSaving: boolean;
  rejection: string | null;
  open: () => void;
  close: () => void;
  submit: () => void;
}

export const useAccountLock = ({
  subject,
  act,
  onLocked,
}: AccountLockInput): AccountLockControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useAccountLockMutation(subject, act, onLocked);

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(undefined, {
      onSuccess: close,
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  return { isOpen, isSaving: mutation.isPending, rejection, open, close, submit };
};
