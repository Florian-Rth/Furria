import { KkDaySchedule } from '@furria/ui/KkDaySchedule';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import { toScheduleView } from '../calendar-day-schedules';
import type { CalendarDaySchedule } from '../schemas';
import { CalendarDetailScheduleDay } from './CalendarDetailScheduleDay';

interface CalendarDetailDayScheduleProps {
  schedule: CalendarDaySchedule;
  startsAt: string;
  endsAt: string | null;
}

export const CalendarDetailDaySchedule: FC<CalendarDetailDayScheduleProps> = ({
  schedule,
  startsAt,
  endsAt,
}) => {
  const view = toScheduleView(schedule.steps, startsAt, endsAt);
  const label = schedule.title ?? CALENDAR_ADD_ON_LABELS.daySchedule;
  const head = schedule.title === null ? null : <KkDaySchedule.Head title={schedule.title} />;
  const days = view.days.map((day) => (
    <CalendarDetailScheduleDay
      key={day.day}
      day={day}
      showsDay={view.showsDays}
      title={schedule.title}
    />
  ));

  return (
    <KkDaySchedule label={label}>
      {head}
      {days}
    </KkDaySchedule>
  );
};
