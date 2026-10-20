import { KkCalendarStrip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  HOURS_HIDE,
  HOURS_LABEL,
  HOURS_SHOW,
  NEXT_WEEK,
  PREVIOUS_WEEK,
  TODAY,
} from '../calendar-agenda-copy';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarPager } from '../hooks/use-calendar-pager';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { useCalendarToggle } from '../hooks/use-calendar-toggle';
import { CalendarHours } from './CalendarHours';

interface CalendarDeskHoursProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
}

export const CalendarDeskHours: FC<CalendarDeskHoursProps> = ({ board, scroll }) => {
  const pager = useCalendarPager(board, scroll, 'week');
  const shown = useCalendarToggle(true);
  const onToday = pager.showsToday ? pager.today : undefined;
  const toggleLabel = shown.open ? HOURS_HIDE : HOURS_SHOW;
  const lanes = shown.open ? (
    <CalendarHours board={board} page={pager} scroll={scroll} framed onPickDay={scroll.goToDay} />
  ) : null;
  const face = shown.open ? 'open' : 'closed';

  return (
    <Stack component="section" aria-label={HOURS_LABEL} sx={{ gap: 0.5, minWidth: 0 }}>
      <KkCalendarStrip.Bar>
        <KkCalendarStrip.Title
          title={pager.title}
          caption={pager.caption}
          todayLabel={TODAY}
          onToday={onToday}
        />
        <KkCalendarStrip.Tools>
          <KkCalendarStrip.Travel
            previousLabel={PREVIOUS_WEEK}
            nextLabel={NEXT_WEEK}
            onPrevious={pager.previous}
            onNext={pager.next}
          />
          <KkCalendarStrip.Expand
            label={toggleLabel}
            expanded={shown.open}
            onToggle={shown.toggle}
          />
        </KkCalendarStrip.Tools>
      </KkCalendarStrip.Bar>
      <KkCalendarStrip.Body face={face}>{lanes}</KkCalendarStrip.Body>
    </Stack>
  );
};
