import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useDeleteCalendarEntryMutation } from '../api';
import type { CalendarEntry } from '../schemas';

interface CalendarEntryRemovalInput {
  entry: CalendarEntry | null;
  open: boolean;
  onDone: () => void;
}

export interface CalendarEntryRemovalControl {
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useCalendarEntryRemoval = ({
  entry,
  open,
  onDone,
}: CalendarEntryRemovalInput): CalendarEntryRemovalControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useDeleteCalendarEntryMutation();

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setRejection(null);
    }
  }

  const submit = (): void => {
    if (entry === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { calendarEntryId: entry.calendarEntryId, title: entry.title },
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
