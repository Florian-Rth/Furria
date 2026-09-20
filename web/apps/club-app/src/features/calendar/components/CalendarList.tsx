import { KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { CalendarEntry } from '../schemas';
import { CalendarEntryRow } from './CalendarEntryRow';

interface CalendarListProps {
  entries: readonly CalendarEntry[];
}

export const CalendarList: FC<CalendarListProps> = ({ entries }) => {
  const rows = entries.map((entry) => (
    <CalendarEntryRow key={entry.calendarEntryId} entry={entry} />
  ));

  return <KkPanel variant="list">{rows}</KkPanel>;
};
