import { useState } from 'react';
import { useCalendarEntryQuery } from '../api';
import type { CalendarEntry } from '../schemas';
import type { CalendarBoard } from './use-calendar-board';

export interface CalendarSelection {
  open: boolean;
  entry: CalendarEntry | null;
  missing: boolean;
}

export const useCalendarSelection = (board: CalendarBoard, isWide: boolean): CalendarSelection => {
  const id = board.selectedId ?? (isWide ? board.leadId : null);
  const listed =
    id === null ? null : (board.entries.find((entry) => entry.calendarEntryId === id) ?? null);
  const fetched = useCalendarEntryQuery(listed === null ? id : null);
  const entry = listed ?? fetched.data?.entry ?? null;
  const [held, setHeld] = useState<CalendarEntry | null>(entry);

  if (entry !== null && entry !== held) {
    setHeld(entry);
  }

  return {
    open: id !== null,
    entry: entry ?? held,
    missing: id !== null && listed === null && fetched.isError,
  };
};
