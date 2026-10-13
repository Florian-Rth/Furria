import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { entriesOnBoardDay, toBoardBars, toBoardWeeks } from '../calendar-board';
import { DAY_MARK_LABELS } from '../calendar-labels';
import type { CalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarEntry } from '../schemas';
import { CalendarDayAgenda } from './CalendarDayAgenda';
import { CalendarMonthBoard } from './CalendarMonthBoard';

const BOARD_SIZE = { xs: 12, lg: 8 } as const;
const AGENDA_SIZE = { xs: 12, lg: 4 } as const;

interface CalendarMonthProps {
  board: CalendarBoard;
  entries: readonly CalendarEntry[];
  authoring: CalendarAuthoring;
  highlightedKey: string | null;
}

export const CalendarMonth: FC<CalendarMonthProps> = ({
  board,
  entries,
  authoring,
  highlightedKey,
}) => {
  const weeks = toBoardWeeks(
    board.monthCursor,
    board.today,
    board.selectedDay,
    entries,
    DAY_MARK_LABELS,
  );
  const bars = toBoardBars(entries);
  const dayEntries = entriesOnBoardDay(entries, board.selectedDay);
  const onAdd = authoring.mayAuthor ? board.addOnSelectedDay : undefined;

  return (
    <Grid container spacing={3}>
      <Grid size={BOARD_SIZE} sx={{ minWidth: 0 }}>
        <CalendarMonthBoard board={board} weeks={weeks} bars={bars} />
      </Grid>
      <Grid size={AGENDA_SIZE} sx={{ minWidth: 0 }}>
        <CalendarDayAgenda
          isoDay={board.selectedDay}
          entries={dayEntries}
          authoring={authoring}
          highlightedKey={highlightedKey}
          onAdd={onAdd}
        />
      </Grid>
    </Grid>
  );
};
