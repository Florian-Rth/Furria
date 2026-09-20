import { useState } from 'react';

export type CalendarEntryDialogKind = 'edit' | 'delete';

interface CalendarEntryDialogTarget {
  kind: CalendarEntryDialogKind;
  calendarEntryId: number;
}

export interface CalendarEntryDialogs {
  kind: CalendarEntryDialogKind | null;
  calendarEntryId: number | null;
  openEdit: (calendarEntryId: number) => void;
  openDelete: (calendarEntryId: number) => void;
  close: () => void;
}

export const useCalendarEntryDialogs = (): CalendarEntryDialogs => {
  const [target, setTarget] = useState<CalendarEntryDialogTarget | null>(null);

  const openWith =
    (kind: CalendarEntryDialogKind) =>
    (calendarEntryId: number): void => {
      setTarget({ kind, calendarEntryId });
    };

  return {
    kind: target?.kind ?? null,
    calendarEntryId: target?.calendarEntryId ?? null,
    openEdit: openWith('edit'),
    openDelete: openWith('delete'),
    close: () => {
      setTarget(null);
    },
  };
};
