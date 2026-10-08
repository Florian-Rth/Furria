import { useState } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useTicketRequestHandledMutation } from '../api';
import type { TicketRequest } from '../schemas';

export interface TicketRequestHandlingControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useTicketRequestHandling = (request: TicketRequest): TicketRequestHandlingControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useTicketRequestHandledMutation(request);

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
        if (isNotFoundError(error)) {
          close();
          return;
        }
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
