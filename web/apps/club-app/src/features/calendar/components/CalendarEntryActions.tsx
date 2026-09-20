import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { CalendarEntry } from '../schemas';
import { CalendarAttendanceRow } from './CalendarAttendanceRow';
import { CalendarEntryDeeds } from './CalendarEntryDeeds';

const ROW_SX = { alignItems: 'center', gap: 0.75, flexWrap: 'wrap' } as const;
const STACK_SX = {
  gap: 0.75,
  minWidth: 0,
  alignItems: { xs: 'flex-start', desktop: 'flex-end' },
} as const;

interface CalendarEntryActionsProps {
  entry: CalendarEntry;
  owned: boolean;
  onEdit: (calendarEntryId: number) => void;
  onDelete: (calendarEntryId: number) => void;
}

export const CalendarEntryActions: FC<CalendarEntryActionsProps> = ({
  entry,
  owned,
  onEdit,
  onDelete,
}) => {
  const attendance = entry.asksForResponse ? <CalendarAttendanceRow entry={entry} /> : null;
  const deeds = owned ? (
    <Stack direction="row" sx={ROW_SX}>
      <CalendarEntryDeeds entry={entry} onEdit={onEdit} onDelete={onDelete} />
    </Stack>
  ) : null;

  return (
    <Stack sx={STACK_SX}>
      {attendance}
      {deeds}
    </Stack>
  );
};
