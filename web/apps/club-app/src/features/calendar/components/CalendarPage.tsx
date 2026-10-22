import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { FC } from 'react';
import { AREA_HANDOVERS, CALENDAR_SECTION, CALENDAR_TITLE } from '@/features/session/app-sections';
import { CALENDAR_LEAD } from '../calendar-labels';
import { useCalendarAdd } from '../hooks/use-calendar-add';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarBody } from './CalendarBody';

const HEADER = <KkTitleHeader title={CALENDAR_TITLE} lead={CALENDAR_LEAD} />;

export const CalendarPage: FC = () => {
  const board = useCalendarBoard();
  const isWide = useIsWideScreen();
  const scroll = useCalendarScroll(board, isWide ? 'chrome' : 'strip');
  const actions = useCalendarAdd(scroll.activeDay);

  return (
    <KkScreen
      kind="list"
      title={CALENDAR_TITLE}
      section={CALENDAR_SECTION}
      actions={actions}
      header={HEADER}
      handover={AREA_HANDOVERS.calendar}
    >
      <CalendarBody board={board} scroll={scroll} isWide={isWide} />
    </KkScreen>
  );
};
