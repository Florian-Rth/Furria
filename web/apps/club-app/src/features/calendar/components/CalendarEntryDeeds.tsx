import { KkButton } from '@furria/ui';
import type { FC } from 'react';
import { DELETE_ENTRY_LABEL, EDIT_ENTRY_LABEL } from '../calendar-labels';
import type { CalendarEntry } from '../schemas';

interface CalendarEntryDeedsProps {
  entry: CalendarEntry;
  onEdit: (calendarEntryId: number) => void;
  onDelete: (calendarEntryId: number) => void;
}

export const CalendarEntryDeeds: FC<CalendarEntryDeedsProps> = ({ entry, onEdit, onDelete }) => {
  const edit = (): void => {
    onEdit(entry.calendarEntryId);
  };

  const remove = (): void => {
    onDelete(entry.calendarEntryId);
  };

  return (
    <>
      <KkButton size="small" variant="outlined" onClick={edit}>
        {EDIT_ENTRY_LABEL}
      </KkButton>
      <KkButton size="small" variant="text" tone="danger" onClick={remove}>
        {DELETE_ENTRY_LABEL}
      </KkButton>
    </>
  );
};
