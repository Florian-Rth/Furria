import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { DETAIL_EMPTY, DETAIL_MISSING } from '../calendar-agenda-copy';
import type { CalendarSelection } from '../hooks/use-calendar-selection';
import { CalendarDetailBody } from './CalendarDetailBody';

interface CalendarPaneProps {
  selection: CalendarSelection;
}

export const CalendarPane: FC<CalendarPaneProps> = ({ selection }) => {
  if (selection.entry === null) {
    const note = selection.missing ? DETAIL_MISSING : DETAIL_EMPTY;

    return <KkNote sx={{ m: 2 }}>{note}</KkNote>;
  }

  return <CalendarDetailBody key={selection.entry.calendarEntryId} entry={selection.entry} />;
};
