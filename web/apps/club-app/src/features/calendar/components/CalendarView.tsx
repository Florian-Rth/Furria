import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { entriesOnDay, sortRunningFirst } from '@/lib/calendar-days';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarEntry } from '../schemas';
import { CalendarEmpty } from './CalendarEmpty';
import { CalendarList } from './CalendarList';
import { CalendarMonthGrid } from './CalendarMonthGrid';

interface CalendarViewProps {
  board: CalendarBoard;
  entries: readonly CalendarEntry[];
}

export const CalendarView: FC<CalendarViewProps> = ({ board, entries }) => {
  const sorted = sortRunningFirst(entries);
  const selectedDay = board.selectedDay;
  const visible = selectedDay === null ? sorted : entriesOnDay(sorted, selectedDay);
  const grid =
    board.view === 'month' ? <CalendarMonthGrid board={board} entries={entries} /> : null;
  const list =
    visible.length === 0 ? (
      <CalendarEmpty dayFiltered={selectedDay !== null} />
    ) : (
      <CalendarList entries={visible} />
    );

  return (
    <KkPanelStack>
      {grid}
      {list}
    </KkPanelStack>
  );
};
