import { KkCalendarDesk } from '@furria/ui/KkCalendarDesk';
import type { FC } from 'react';
import { DETAIL_LABEL } from '../calendar-agenda-copy';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarPager } from '../hooks/use-calendar-pager';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { useCalendarSelection } from '../hooks/use-calendar-selection';
import { CalendarAgenda } from './CalendarAgenda';
import { CalendarDeskHours } from './CalendarDeskHours';
import { CalendarMonth } from './CalendarMonth';
import { CalendarPane } from './CalendarPane';

interface CalendarDeskProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
}

export const CalendarDesk: FC<CalendarDeskProps> = ({ board, scroll }) => {
  const pager = useCalendarPager(board, scroll, 'month');
  const selection = useCalendarSelection(board, true);
  const selectedId = selection.entry?.calendarEntryId ?? null;

  return (
    <KkCalendarDesk>
      <KkCalendarDesk.Rail>
        <CalendarMonth pager={pager} />
      </KkCalendarDesk.Rail>
      <KkCalendarDesk.Main sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CalendarDeskHours board={board} scroll={scroll} />
        <CalendarAgenda board={board} scroll={scroll} under="chrome" selectedId={selectedId} />
      </KkCalendarDesk.Main>
      <KkCalendarDesk.Pane label={DETAIL_LABEL}>
        <CalendarPane selection={selection} />
      </KkCalendarDesk.Pane>
    </KkCalendarDesk>
  );
};
