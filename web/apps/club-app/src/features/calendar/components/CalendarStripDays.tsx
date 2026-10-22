import { KkCalendarStrip } from '@furria/ui/KkCalendarStrip';
import type { FC } from 'react';
import { WEEKDAY_HEADERS } from '../calendar-agenda-copy';
import type { CalendarFold } from '../hooks/use-calendar-fold';

interface CalendarStripDaysProps {
  fold: CalendarFold;
}

export const CalendarStripDays: FC<CalendarStripDaysProps> = ({ fold }) => {
  const days = fold.days.map((day) => (
    <KkCalendarStrip.Day key={day.isoDay} day={day} onSelect={fold.pickDay} />
  ));

  return (
    <>
      <KkCalendarStrip.Weekdays weekdays={WEEKDAY_HEADERS} />
      <KkCalendarStrip.Weeks
        rows={fold.rows}
        focusRow={fold.row}
        open={fold.open}
        pageKey={fold.pageKey}
        travel={fold.travel}
        onTravel={fold.travelTo}
      >
        {days}
      </KkCalendarStrip.Weeks>
    </>
  );
};
