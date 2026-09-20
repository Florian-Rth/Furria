import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useRemoveSessionRecordMutation } from '../api';
import type { SessionRecordSummary } from '../schemas';

interface SessionRemovalInput {
  record: SessionRecordSummary | null;
  open: boolean;
  onDone: () => void;
}

export interface SessionRemovalControl {
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useSessionRemoval = ({
  record,
  open,
  onDone,
}: SessionRemovalInput): SessionRemovalControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useRemoveSessionRecordMutation();

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setRejection(null);
    }
  }

  const submit = (): void => {
    if (record === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { sessionId: record.sessionId, startYear: record.startYear },
      {
        onSuccess: onDone,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { rejection, isSaving: mutation.isPending, submit };
};
