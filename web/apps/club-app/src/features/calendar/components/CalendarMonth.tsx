import { KkCalendarMonth } from '@furria/ui/KkCalendarMonth';
import type { FC } from 'react';
import {
  MONTH_LABEL,
  NEXT_MONTH,
  PREVIOUS_MONTH,
  TODAY,
  WEEKDAY_HEADERS,
} from '../calendar-agenda-copy';
import type { CalendarPager } from '../hooks/use-calendar-pager';

interface CalendarMonthProps {
  pager: CalendarPager;
}

export const CalendarMonth: FC<CalendarMonthProps> = ({ pager }) => {
  const days = pager.days.map((day) => (
    <KkCalendarMonth.Day key={day.isoDay} day={day} onSelect={pager.selectDay} />
  ));
  const onToday = pager.showsToday ? pager.today : undefined;

  return (
    <KkCalendarMonth label={MONTH_LABEL}>
      <KkCalendarMonth.Bar>
        <KkCalendarMonth.Title
          title={pager.title}
          caption={pager.caption}
          todayLabel={TODAY}
          onToday={onToday}
        />
        <KkCalendarMonth.Tools>
          <KkCalendarMonth.Travel
            previousLabel={PREVIOUS_MONTH}
            nextLabel={NEXT_MONTH}
            onPrevious={pager.previous}
            onNext={pager.next}
          />
        </KkCalendarMonth.Tools>
      </KkCalendarMonth.Bar>
      <KkCalendarMonth.Weekdays weekdays={WEEKDAY_HEADERS} />
      <KkCalendarMonth.Grid
        rows={pager.rows}
        focusRow={0}
        open
        pageKey={pager.pageKey}
        travel={pager.travel}
        onTravel={pager.travelTo}
      >
        {days}
      </KkCalendarMonth.Grid>
    </KkCalendarMonth>
  );
};
