import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useWithdrawAnnouncementMutation } from '../api';
import type { Announcement } from '../schemas';

export interface AnnouncementWithdrawal {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  isWithdrawing: boolean;
  rejection: string | null;
}

export const useAnnouncementWithdrawal = (
  announcement: Announcement | null,
): AnnouncementWithdrawal => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const withdraw = useWithdrawAnnouncementMutation();
  const navigate = useNavigate();

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    if (announcement === null) {
      return;
    }

    setRejection(null);
    withdraw.mutate(announcement.announcementId, {
      onSuccess: () => {
        setIsOpen(false);
        void navigate({ to: '/announcements' });
      },
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  return { isOpen, open, close, submit, isWithdrawing: withdraw.isPending, rejection };
};
