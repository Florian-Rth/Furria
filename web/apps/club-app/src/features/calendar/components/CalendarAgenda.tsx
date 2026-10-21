import type { KkCalendarHeadUnder } from '@furria/ui';
import { KkCalendarAgenda, KkNote } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { BOARD_LABEL, EARLIER_LABEL, LATER_LABEL, NOTHING_HERE } from '../calendar-agenda-copy';
import { hasLines, lineOrdersOf } from '../calendar-agenda-view';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarSection } from './CalendarSection';

interface CalendarAgendaProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
  under: KkCalendarHeadUnder;
  selectedId: number | null;
}

export const CalendarAgenda: FC<CalendarAgendaProps> = ({ board, scroll, under, selectedId }) => {
  const orders = lineOrdersOf(board.sections);
  const sections = board.sections.map((section) => (
    <CalendarSection
      key={section.key}
      section={section}
      board={board}
      under={under}
      orders={orders}
      selectedId={selectedId}
    />
  ));
  const showsEarlier = board.canEarlier;
  const earlier = showsEarlier ? (
    <KkCalendarAgenda.More
      label={EARLIER_LABEL}
      icon="clock"
      busy={false}
      onSelect={board.loadEarlier}
    />
  ) : null;
  const empty = hasLines(board.sections) ? null : <KkNote icon="info">{NOTHING_HERE}</KkNote>;
  const showsLater = board.canLater;
  const later = showsLater ? (
    <KkCalendarAgenda.More
      label={LATER_LABEL}
      icon="events"
      busy={board.isFetching}
      onSelect={board.loadLater}
    />
  ) : null;

  return (
    <KkCalendarAgenda label={BOARD_LABEL} sx={{ gap: 3, pt: 1 }}>
      {earlier}
      {empty}
      {sections}
      {later}
      <Box ref={scroll.holdSentinel} aria-hidden sx={{ height: 1 }} />
    </KkCalendarAgenda>
  );
};
