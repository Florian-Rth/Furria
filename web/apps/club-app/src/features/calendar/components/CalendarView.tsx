import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { sortRunningFirst } from '@/lib/calendar-days';
import type { CalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarEntry } from '../schemas';
import { CalendarEntrySheet } from './CalendarEntrySheet';
import { CalendarList } from './CalendarList';
import { CalendarMonth } from './CalendarMonth';

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
  const sheet = <CalendarEntrySheet entries={entries} />;

  if (board.view === 'list') {
    const sorted = sortRunningFirst(entries);

    return (
      <KkPanelStack>
        <CalendarList
          entries={sorted}
          isOwned={authoring.mayOwn}
          linkOf={authoring.linkOf}
          mayAuthor={authoring.mayAuthor}
          highlightedKey={highlightedKey}
        />
        {sheet}
      </KkPanelStack>
    );
  }

  return (
    <>
      <CalendarMonth
        board={board}
        entries={entries}
        authoring={authoring}
        highlightedKey={highlightedKey}
      />
      {sheet}
    </>
  );
};
