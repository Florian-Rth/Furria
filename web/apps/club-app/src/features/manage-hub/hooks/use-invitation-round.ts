import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useInvitationRoundMutation, useInvitationRoundPreviewQuery } from '../api';
import type { InvitationRoundKind } from '../invitation-round-labels';

export interface InvitationRoundControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  isSending: boolean;
  rejection: string | null;
}

export const useInvitationRound = (kind: InvitationRoundKind): InvitationRoundControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const preview = useInvitationRoundPreviewQuery();
  const mutation = useInvitationRoundMutation(kind);

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
    void preview.refetch();
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

  return { isOpen, open, close, submit, isSending: mutation.isPending, rejection };
};
