import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEventCancelledMutation } from '../api';
import type { EventDetails } from '../schemas';

export interface EventCancellationControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEventCancellation = (event: EventDetails): EventCancellationControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useEventCancelledMutation(event);

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(
      { isCancelled: event.cancelledAt === null },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
