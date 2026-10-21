import type { KkSheetAction } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import { CALENDAR_PATH } from '@/features/session';
import { byStartsAt, toCalendarRows } from '../start-board';
import { entriesOf } from '../start-sheets';
import type { CalendarLinesView } from './use-calendar-lines';
import { useCalendarLines } from './use-calendar-lines';
import type { StartBoard } from './use-start-view';

export interface CalendarSheetView extends CalendarLinesView {
  action: KkSheetAction | undefined;
}

const CALENDAR_LABEL = 'Zum Kalender';

export const useCalendarSheet = (board: StartBoard): CalendarSheetView => {
  const lines = useCalendarLines(
    toCalendarRows(byStartsAt(entriesOf(board.start)), board.dimmedKeys),
  );

  return {
    ...lines,
    action: board.canReadClub
      ? { label: CALENDAR_LABEL, component: Link, to: CALENDAR_PATH }
      : undefined,
  };
};
