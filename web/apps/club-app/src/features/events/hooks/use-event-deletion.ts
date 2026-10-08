import { useState } from 'react';
import { EVENTS_PATH } from '@/features/session';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useDeleteEventMutation } from '../api';
import type { EventDetails } from '../schemas';

export interface EventDeletionControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEventDeletion = (event: EventDetails): EventDeletionControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useDeleteEventMutation(event);
  const goBackTo = useGoBackTo();

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
      onSuccess: () => {
        setIsOpen(false);
        void goBackTo({ to: EVENTS_PATH });
      },
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
