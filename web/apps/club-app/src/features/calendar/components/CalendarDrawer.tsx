import { KkBottomDrawer } from '@furria/ui';
import type { FC } from 'react';
import { CLOSE_LABEL, DETAIL_LABEL } from '../calendar-agenda-copy';
import type { CalendarSelection } from '../hooks/use-calendar-selection';
import { CalendarDetailBody } from './CalendarDetailBody';

interface CalendarDrawerProps {
  selection: CalendarSelection;
  onClose: () => void;
}

export const CalendarDrawer: FC<CalendarDrawerProps> = ({ selection, onClose }) => {
  const { entry } = selection;
  const body =
    entry === null ? null : <CalendarDetailBody key={entry.calendarEntryId} entry={entry} />;
  const open = selection.open && entry !== null;

  return (
    <KkBottomDrawer open={open} label={DETAIL_LABEL} closeLabel={CLOSE_LABEL} onClose={onClose}>
      {body}
    </KkBottomDrawer>
  );
};
