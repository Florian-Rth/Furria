import { KkDensePanel, KkSheet } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useCalendarSheet } from '../hooks/use-calendar-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { START_CALENDAR_SHEET } from '../start-sheets';
import { CalendarLine } from './CalendarLine';

const SHEET_TITLE = 'Kalender';
const CLOSE_LABEL = 'Schließen';
const LINE_INSET_PULL = { mx: -1.5 } as const;

interface CalendarSheetProps {
  board: StartBoard;
}

export const CalendarSheet: FC<CalendarSheetProps> = ({ board }) => {
  const { rows, toggle, collapse, action } = useCalendarSheet(board);

  const lines = rows.map((row) => (
    <CalendarLine
      key={row.entry.calendarEntryId}
      entry={row.entry}
      previousStartsAt={row.previousStartsAt}
      now={board.now}
      dimmed={row.dimmed}
      expanded={row.expanded}
      onToggle={toggle}
      onCollapse={collapse}
      onTouch={board.touch}
    />
  ));

  return (
    <KkSheet id={START_CALENDAR_SHEET} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <Box sx={LINE_INSET_PULL}>
          <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
        </Box>
      </KkSheet.Body>
      <KkSheet.Actions primary={action} />
    </KkSheet>
  );
};
