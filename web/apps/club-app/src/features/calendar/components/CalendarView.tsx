import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { entriesOnDay, sortRunningFirst } from '@/lib/calendar-days';
import type { CalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarEntry } from '../schemas';
import { CalendarList } from './CalendarList';
import { CalendarMonthGrid } from './CalendarMonthGrid';

interface CalendarViewProps {
  board: CalendarBoard;
  entries: readonly CalendarEntry[];
  authoring: CalendarAuthoring;
  highlightedKey: string | null;
}

export const CalendarView: FC<CalendarViewProps> = ({
  board,
  entries,
  authoring,
  highlightedKey,
}) => {
  const sorted = sortRunningFirst(entries);
  const selectedDay = board.selectedDay;
  const visible = selectedDay === null ? sorted : entriesOnDay(sorted, selectedDay);
  const grid =
    board.view === 'month' ? <CalendarMonthGrid board={board} entries={entries} /> : null;

  return (
    <KkPanelStack>
      {grid}
      <CalendarList
        entries={visible}
        dayFiltered={selectedDay !== null}
        isOwned={authoring.mayOwn}
        mayAuthor={authoring.mayAuthor}
        highlightedKey={highlightedKey}
      />
    </KkPanelStack>
  );
};
