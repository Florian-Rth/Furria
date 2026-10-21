import type { FC } from 'react';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarFold } from '../hooks/use-calendar-fold';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarHours } from './CalendarHours';
import { CalendarStripDays } from './CalendarStripDays';

interface CalendarStripFaceProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
  fold: CalendarFold;
}

export const CalendarStripFace: FC<CalendarStripFaceProps> = ({ board, scroll, fold }) => {
  if (fold.mode === 'hours') {
    return (
      <CalendarHours
        board={board}
        page={fold}
        scroll={scroll}
        framed={false}
        onPickDay={fold.pickDay}
      />
    );
  }

  return <CalendarStripDays fold={fold} />;
};
