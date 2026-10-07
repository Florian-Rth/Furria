import { useState } from 'react';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useRemoveSessionRecordMutation } from '../api';
import type { SessionRecordSummary } from '../schemas';

export interface SessionRemovalControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useSessionRemoval = (record: SessionRecordSummary | null): SessionRemovalControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useRemoveSessionRecordMutation();
  const goBackTo = useGoBackTo();

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    if (record === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { sessionId: record.sessionId, startYear: record.startYear },
      {
        onSuccess: () => {
          setIsOpen(false);
          void goBackTo({ to: '/manage/sessions', ignoreBlocker: true });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
