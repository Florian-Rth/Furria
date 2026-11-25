import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, CALENDAR_SECTION, CALENDAR_TITLE } from '@/features/session/app-sections';
import { useCalendarAdd } from '../hooks/use-calendar-add';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarHelpViewer } from '../hooks/use-calendar-help-viewer';
import { useCalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarBody } from './CalendarBody';
import { CalendarHelp } from './CalendarHelp';

const HEADER = <KkTitleHeader title={CALENDAR_TITLE} />;

export const CalendarPage: FC = () => {
  const board = useCalendarBoard();
  const isWide = useIsWideScreen();
  const scroll = useCalendarScroll(board, isWide ? 'chrome' : 'strip');
  const actions = useCalendarAdd(scroll.activeDay);
  const helpViewer = useCalendarHelpViewer(isWide);
  const help = toScreenHelp(<CalendarHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="list"
      title={CALENDAR_TITLE}
      section={CALENDAR_SECTION}
      actions={actions}
      help={help}
      header={HEADER}
      handover={AREA_HANDOVERS.calendar}
    >
      <CalendarBody board={board} scroll={scroll} isWide={isWide} />
    </KkScreen>
  );
};
