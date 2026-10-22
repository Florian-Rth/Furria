import { KkDensePanel } from '@furria/ui/KkDensePanel';
import { KkSheet } from '@furria/ui/KkSheet';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useCalendarSheetDays } from '../hooks/use-calendar-sheet-days';
import type { StartBoard } from '../hooks/use-start-view';
import { START_CALENDAR_SHEET } from '../start-sheets';
import { CalendarSheetDay } from './CalendarSheetDay';
import { CalendarSheetLine } from './CalendarSheetLine';

const SHEET_TITLE = 'Kalender';
const CLOSE_LABEL = 'Schließen';
const LINE_INSET_PULL = { mx: -1.5 } as const;

interface CalendarSheetProps {
  board: StartBoard;
  focusedDay: string | null;
}

export const CalendarSheet: FC<CalendarSheetProps> = ({ board, focusedDay }) => {
  const { days, toggle, collapse, action } = useCalendarSheetDays(board, focusedDay);

  const groups = days.map((day) => {
    const lines = day.rows.map((row) => (
      <CalendarSheetLine
        key={row.entry.calendarEntryId}
        entry={row.entry}
        previousStartsAt={row.previousStartsAt}
        now={board.now}
        dimmed={row.dimmed}
        expanded={row.expanded}
        onToggle={toggle}
        onCollapse={collapse}
        onTouch={board.touch}
        chosenDay={day.focused}
        dayHead={row.dayHead}
      />
    ));

    return (
      <CalendarSheetDay key={day.isoDay} focused={day.focused}>
        <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
      </CalendarSheetDay>
    );
  });

  return (
    <KkSheet id={START_CALENDAR_SHEET} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <Box sx={LINE_INSET_PULL}>{groups}</Box>
      </KkSheet.Body>
      <KkSheet.Actions primary={action} />
    </KkSheet>
  );
};
