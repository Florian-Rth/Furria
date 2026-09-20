import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { entriesOnDay, sortRunningFirst } from '@/lib/calendar-days';
import { findCalendarEntry } from '../calendar-authoring';
import type { CalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarEntryDialogs } from '../hooks/use-calendar-entry-dialogs';
import type { CalendarEntry } from '../schemas';
import { CalendarEmpty } from './CalendarEmpty';
import { CalendarEntryFormDialog } from './CalendarEntryFormDialog';
import { CalendarList } from './CalendarList';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { DeleteCalendarEntryDialog } from './DeleteCalendarEntryDialog';

interface CalendarViewProps {
  board: CalendarBoard;
  entries: readonly CalendarEntry[];
  authoring: CalendarAuthoring;
}

export const CalendarView: FC<CalendarViewProps> = ({ board, entries, authoring }) => {
  const dialogs = useCalendarEntryDialogs();
  const sorted = sortRunningFirst(entries);
  const selectedDay = board.selectedDay;
  const visible = selectedDay === null ? sorted : entriesOnDay(sorted, selectedDay);
  const target = findCalendarEntry(entries, dialogs.calendarEntryId);
  const grid =
    board.view === 'month' ? <CalendarMonthGrid board={board} entries={entries} /> : null;
  const list =
    visible.length === 0 ? (
      <CalendarEmpty dayFiltered={selectedDay !== null} />
    ) : (
      <CalendarList
        entries={visible}
        isOwned={authoring.mayOwn}
        onEdit={dialogs.openEdit}
        onDelete={dialogs.openDelete}
      />
    );

  return (
    <>
      <KkPanelStack>
        {grid}
        {list}
      </KkPanelStack>
      <CalendarEntryFormDialog
        entry={target}
        ownerOptions={authoring.ownerOptions}
        clubGroups={authoring.clubGroups}
        venues={authoring.venues}
        open={dialogs.kind === 'edit'}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <DeleteCalendarEntryDialog
        entry={target}
        open={dialogs.kind === 'delete'}
        onClose={dialogs.close}
      />
    </>
  );
};
