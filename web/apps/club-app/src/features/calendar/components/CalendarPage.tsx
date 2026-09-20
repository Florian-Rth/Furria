import type { KkQuietScreenAction } from '@furria/ui';
import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN } from '@/features/session';
import { useCalendarQuery } from '../api';
import {
  CALENDAR_TITLE,
  LIST_VIEW_LABEL,
  MONTH_VIEW_LABEL,
  toCalendarLead,
  toScopeOptions,
} from '../calendar-labels';
import { useCalendarBoard } from '../hooks/use-calendar-board';
import { CalendarBody } from './CalendarBody';
import { CalendarToolbar } from './CalendarToolbar';

const TOOLBAR_CHIPS = 3;

export const CalendarPage: FC = () => {
  const board = useCalendarBoard();
  const scopeSource = useCalendarQuery(board.scopeSourceQuery);
  const listed = useCalendarQuery(board.query);
  const lead = listed.data === undefined ? undefined : toCalendarLead(listed.data.entries.length);

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

  const actions: readonly [KkQuietScreenAction] =
    board.view === 'list' ? [monthAction] : [listAction];

  const tools =
    scopeSource.data === undefined ? (
      <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />
    ) : (
      <CalendarToolbar
        scopeId={board.scopeId}
        options={toScopeOptions(scopeSource.data.entries)}
        onScopeChange={board.selectScope}
      />
    );

  return (
    <KkScreen
      kind="list"
      title={CALENDAR_TITLE}
      origin={CLUB_ORIGIN}
      actions={actions}
      tools={tools}
      header={<KkTitleHeader title={CALENDAR_TITLE} lead={lead} />}
    >
      <CalendarBody board={board} />
    </KkScreen>
  );
};
