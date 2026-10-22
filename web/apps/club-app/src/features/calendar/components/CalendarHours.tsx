import { KkCalendarHours } from '@furria/ui/KkCalendarHours';
import type { FC } from 'react';
import { HOURS_LABEL } from '../calendar-agenda-copy';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { useCalendarHours } from '../hooks/use-calendar-hours';
import type { CalendarWeekPage } from '../hooks/use-calendar-pager';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarHoursLane } from './CalendarHoursLane';

interface CalendarHoursProps {
  board: CalendarBoard;
  page: CalendarWeekPage;
  scroll: CalendarScroll;
  framed: boolean;
  onPickDay: (isoDay: string) => void;
}

export const CalendarHours: FC<CalendarHoursProps> = ({
  board,
  page,
  scroll,
  framed,
  onPickDay,
}) => {
  const hours = useCalendarHours(board, page, scroll);
  const lanes = hours.week.lanes.map((lane, index) => (
    <CalendarHoursLane
      key={lane.day.isoDay}
      lane={lane}
      laneIndex={index}
      nowMinute={hours.nowMinute}
      nowClock={hours.nowClock}
      onPickDay={onPickDay}
      onSelect={hours.select}
    />
  ));

  return (
    <KkCalendarHours label={HOURS_LABEL} axis={hours.week.axis} framed={framed}>
      <KkCalendarHours.Axis />
      <KkCalendarHours.Page pageKey={hours.pageKey} travel={hours.travel} onTravel={hours.travelTo}>
        {lanes}
      </KkCalendarHours.Page>
    </KkCalendarHours>
  );
};
