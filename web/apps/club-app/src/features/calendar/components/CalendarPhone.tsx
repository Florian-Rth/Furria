import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { useCalendarSelection } from '../hooks/use-calendar-selection';
import { CalendarAgenda } from './CalendarAgenda';
import { CalendarDrawer } from './CalendarDrawer';
import { CalendarStrip } from './CalendarStrip';

interface CalendarPhoneProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
}

export const CalendarPhone: FC<CalendarPhoneProps> = ({ board, scroll }) => {
  const selection = useCalendarSelection(board, false);

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <CalendarStrip board={board} scroll={scroll} />
      <CalendarAgenda board={board} scroll={scroll} under="strip" selectedId={null} />
      <CalendarDrawer selection={selection} onClose={board.close} />
    </Stack>
  );
};
