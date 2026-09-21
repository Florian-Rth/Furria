import { KkButton, KkEyebrow, KkHeading, KkIcon, KkMeta, KkPanel } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  toIsoDayLabel,
  toMonthGridWeeks,
  toMonthLabel,
  WEEKDAY_HEADERS,
} from '@/lib/calendar-days';
import { ALL_DAYS_LABEL, NEXT_MONTH_LABEL, PREVIOUS_MONTH_LABEL } from '../calendar-labels';
import { toCalendarMarks } from '../calendar-tones';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarEntry } from '../schemas';
import { CalendarMonthDay } from './CalendarMonthDay';

const CELL_SX = { flexGrow: 1, flexBasis: 0, minWidth: 0 } as const;
const HEADER_CELL_SX = { ...CELL_SX, textAlign: 'center' } as const;
const ROW_SX = { gap: 0.5, minWidth: 0 } as const;

interface CalendarMonthGridProps {
  board: CalendarBoard;
  entries: readonly CalendarEntry[];
}

export const CalendarMonthGrid: FC<CalendarMonthGridProps> = ({ board, entries }) => {
  const marks = toCalendarMarks(entries);
  const weeks = toMonthGridWeeks(board.monthCursor, board.today, marks, board.selectedDay);

  const headers = WEEKDAY_HEADERS.map((label) => (
    <Box key={label} sx={HEADER_CELL_SX}>
      <KkEyebrow tone="muted" size="small">
        {label}
      </KkEyebrow>
    </Box>
  ));

  const weekRows = weeks.map((week) => {
    const days = week.days.map((day) => (
      <CalendarMonthDay key={day.isoDay} day={day} onSelect={board.selectDay} sx={CELL_SX} />
    ));

    return (
      <Stack key={week.key} direction="row" sx={ROW_SX}>
        {days}
      </Stack>
    );
  });

  const selection =
    board.selectedDay === null ? null : (
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
      >
        <KkMeta>{toIsoDayLabel(board.selectedDay)}</KkMeta>
        <KkButton variant="text" size="small" onClick={board.clearDay}>
          {ALL_DAYS_LABEL}
        </KkButton>
      </Stack>
    );

  return (
    <KkPanel variant="block" sx={{ gap: 1, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <KkButton
          variant="text"
          size="small"
          ariaLabel={PREVIOUS_MONTH_LABEL}
          onClick={board.showPreviousMonth}
        >
          <KkIcon name="back" size="small" />
        </KkButton>
        <KkHeading level={5}>{toMonthLabel(board.monthCursor)}</KkHeading>
        <KkButton
          variant="text"
          size="small"
          ariaLabel={NEXT_MONTH_LABEL}
          onClick={board.showNextMonth}
        >
          <KkIcon name="chevron" size="small" />
        </KkButton>
      </Stack>
      <Stack direction="row" sx={ROW_SX}>
        {headers}
      </Stack>
      {weekRows}
      {selection}
    </KkPanel>
  );
};
