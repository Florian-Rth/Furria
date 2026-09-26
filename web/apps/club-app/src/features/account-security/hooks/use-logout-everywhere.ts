import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useLogoutEverywhereMutation } from '../api';

export interface LogoutEverywhereControl {
  isOpen: boolean;
  isBusy: boolean;
  rejection: string | null;
  open: () => void;
  close: () => void;
  confirm: () => void;
}

export const useLogoutEverywhere = (): LogoutEverywhereControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useLogoutEverywhereMutation();

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const confirm = (): void => {
    setRejection(null);
    mutation.mutate(undefined, {
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  return { isOpen, isBusy: mutation.isPending, rejection, open, close, confirm };
};
