import { KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { CalendarEntry } from '../schemas';
import { CalendarEntryRow } from './CalendarEntryRow';

interface CalendarListProps {
  entries: readonly CalendarEntry[];
  isOwned: (entry: CalendarEntry) => boolean;
  onEdit: (calendarEntryId: number) => void;
  onDelete: (calendarEntryId: number) => void;
}

export const CalendarList: FC<CalendarListProps> = ({ entries, isOwned, onEdit, onDelete }) => {
  const rows = entries.map((entry) => (
    <CalendarEntryRow
      key={entry.calendarEntryId}
      entry={entry}
      owned={isOwned(entry)}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ));

  return <KkPanel variant="list">{rows}</KkPanel>;
};
