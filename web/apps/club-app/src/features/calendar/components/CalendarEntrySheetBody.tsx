import type { FC } from 'react';
import { EntrySheetBody } from '@/features/entry-sheet';
import { useCalendarEntrySheet } from '../hooks/use-calendar-entry-sheet';
import type { CalendarEntry } from '../schemas';

interface CalendarEntrySheetBodyProps {
  entry: CalendarEntry;
}

export const CalendarEntrySheetBody: FC<CalendarEntrySheetBodyProps> = ({ entry }) => {
  const sheet = useCalendarEntrySheet(entry);

  return <EntrySheetBody sheet={sheet} />;
};
