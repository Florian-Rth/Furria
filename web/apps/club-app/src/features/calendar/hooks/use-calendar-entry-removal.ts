import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useDeleteCalendarEntryMutation } from '../api';
import type { CalendarEntry } from '../schemas';

export interface CalendarEntryRemovalControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useCalendarEntryRemoval = (
  entry: CalendarEntry | null,
): CalendarEntryRemovalControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useDeleteCalendarEntryMutation();
  const navigate = useNavigate();

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    if (entry === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { calendarEntryId: entry.calendarEntryId, title: entry.title },
      {
        onSuccess: () => {
          setIsOpen(false);
          void navigate({ to: '/calendar', search: (previous) => previous });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
