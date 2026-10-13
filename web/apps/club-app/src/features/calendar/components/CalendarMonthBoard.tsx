import type { KkMonthBoardBarData } from '@furria/ui';
import { KkMonthBoard, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import { toMonthLabel, WEEKDAY_HEADERS } from '@/lib/calendar-days';
import type { CalendarBoardWeek } from '../calendar-board';
import { NEXT_MONTH_LABEL, PREVIOUS_MONTH_LABEL, TODAY_LABEL } from '../calendar-labels';
import { toMonthCursorParam } from '../calendar-query';
import type { CalendarBoard } from '../hooks/use-calendar-board';

interface CalendarMonthBoardProps {
  board: CalendarBoard;
  weeks: readonly CalendarBoardWeek[];
  bars: readonly KkMonthBoardBarData[];
}

export const CalendarMonthBoard: FC<CalendarMonthBoardProps> = ({ board, weeks, bars }) => {
  const title = toMonthLabel(board.monthCursor);
  const pageKey = toMonthCursorParam(board.monthCursor);
  const onToday = board.showsToday ? board.showToday : undefined;
  const weekRows = weeks.map((week) => (
    <KkMonthBoard.Week
      key={week.key}
      days={week.days}
      bars={bars}
      open={week.open}
      onSelectDay={board.selectDay}
    />
  ));

  return (
    <KkPanel variant="block" sx={{ minWidth: 0 }}>
      <KkMonthBoard label={title}>
        <KkMonthBoard.Nav
          title={title}
          previousLabel={PREVIOUS_MONTH_LABEL}
          nextLabel={NEXT_MONTH_LABEL}
          onPrevious={board.showPreviousMonth}
          onNext={board.showNextMonth}
          todayLabel={TODAY_LABEL}
          onToday={onToday}
        />
        <KkMonthBoard.Weekdays weekdays={WEEKDAY_HEADERS} />
        <KkMonthBoard.Page pageKey={pageKey} travel={board.travel}>
          {weekRows}
        </KkMonthBoard.Page>
      </KkMonthBoard>
    </KkPanel>
  );
};
