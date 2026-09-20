import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useWithdrawAnnouncementMutation } from '../api';
import type { Announcement } from '../schemas';

export interface AnnouncementWithdrawal {
  pending: Announcement | null;
  ask: (announcement: Announcement) => void;
  dismiss: () => void;
  confirm: () => void;
  isWithdrawing: boolean;
  rejection: string | null;
}

export const useAnnouncementWithdrawal = (): AnnouncementWithdrawal => {
  const [pending, setPending] = useState<Announcement | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const withdraw = useWithdrawAnnouncementMutation();

  const dismiss = (): void => {
    setPending(null);
    setRejection(null);
  };

  const confirm = (): void => {
    if (pending === null) {
      return;
    }

    setRejection(null);
    withdraw.mutate(pending.announcementId, {
      onSuccess: dismiss,
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  return {
    pending,
    ask: (announcement: Announcement) => {
      setRejection(null);
      setPending(announcement);
    },
    dismiss,
    confirm,
    isWithdrawing: withdraw.isPending,
    rejection,
  };
};
