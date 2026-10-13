import type { FC } from 'react';
import { useCalendarEntryPeek } from '../hooks/use-calendar-entry-sheet';
import type { CalendarEntry } from '../schemas';
import { CalendarEntrySheetBody } from './CalendarEntrySheetBody';

interface CalendarEntrySheetProps {
  entries: readonly CalendarEntry[];
}

export const CalendarEntrySheet: FC<CalendarEntrySheetProps> = ({ entries }) => {
  const entry = useCalendarEntryPeek(entries);

  if (entry === null) {
    return null;
  }

  return <CalendarEntrySheetBody key={entry.calendarEntryId} entry={entry} />;
};
