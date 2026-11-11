import { KkDaySchedule } from '@furria/ui/KkDaySchedule';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toIsoDayLabel } from '@/lib/calendar-days';
import type { CalendarScheduleDay } from '../calendar-day-schedules';
import { toScheduleStepsLabel } from '../calendar-labels';

interface CalendarDetailScheduleDayProps {
  day: CalendarScheduleDay;
  showsDay: boolean;
  title: string | null;
}

export const CalendarDetailScheduleDay: FC<CalendarDetailScheduleDayProps> = ({
  day,
  showsDay,
  title,
}) => {
  const heading = showsDay ? toIsoDayLabel(day.isoDay) : null;
  const dayLabel = heading === null ? null : <KkDaySchedule.Day label={heading} />;
  const stepsLabel = toScheduleStepsLabel(heading ?? title);
  const steps = day.steps.map((step) => (
    <KkDaySchedule.Step key={step.stepId} time={step.time} text={step.text} />
  ));

  return (
    <Stack sx={{ gap: 0.25, minWidth: 0 }}>
      {dayLabel}
      <KkDaySchedule.Steps label={stepsLabel}>{steps}</KkDaySchedule.Steps>
    </Stack>
  );
};
