import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useInvitationRoundMutation, useInvitationRoundPreviewQuery } from '../api';
import type { InvitationRoundKind } from '../invitation-round-labels';

const STALE_COUNTS_MESSAGE =
  'Die Zahlen konnten nicht aktualisiert werden und sind eventuell nicht mehr aktuell.';

export interface InvitationRoundControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  isSending: boolean;
  isRefreshing: boolean;
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
    void mutation.mutateAsync().then(close, (error: Error) => {
      setRejection(toWriteErrorMessage(error));
    });
  };

  const staleNotice = preview.isRefetchError ? STALE_COUNTS_MESSAGE : null;

  return {
    isOpen,
    open,
    close,
    submit,
    isSending: mutation.isPending,
    isRefreshing: preview.isFetching,
    rejection: rejection ?? staleNotice,
  };
};
