import type { KkQuietScreenAction } from '@furria/ui';
import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, CALENDAR_SECTION, CALENDAR_TITLE } from '@/features/session';
import { useLanding } from '@/features/write';
import { CALENDAR_LEAD, LIST_VIEW_LABEL, MONTH_VIEW_LABEL } from '../calendar-labels';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarScopeTools } from '../hooks/use-calendar-scope-tools';
import { CalendarBody } from './CalendarBody';
import { CalendarScopeBar } from './CalendarScopeBar';

export const CalendarPage: FC = () => {
  const board = useCalendarBoard();
  const { highlightedKey } = useLanding();
  const scopeTools = useCalendarScopeTools(board);

  const monthAction: KkQuietScreenAction = {
    id: 'calendar-month-view',
    label: MONTH_VIEW_LABEL,
    icon: 'calendar',
    onSelect: board.showMonth,
  };

  const listAction: KkQuietScreenAction = {
    id: 'calendar-list-view',
    label: LIST_VIEW_LABEL,
    icon: 'events',
    onSelect: board.showList,
  };

  const viewAction = board.view === 'list' ? monthAction : listAction;

  const tools = (
    <CalendarScopeBar
      tools={scopeTools}
      scopeId={board.scopeId}
      onScopeChange={board.selectScope}
    />
  );

  return (
    <KkScreen
      kind="list"
      title={CALENDAR_TITLE}
      section={CALENDAR_SECTION}
      actions={[viewAction]}
      tools={tools}
      header={<KkTitleHeader title={CALENDAR_TITLE} lead={CALENDAR_LEAD} />}
      handover={AREA_HANDOVERS.calendar}
    >
      <CalendarBody board={board} highlightedKey={highlightedKey} />
    </KkScreen>
  );
};
