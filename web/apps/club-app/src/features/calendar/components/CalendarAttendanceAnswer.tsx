import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { CalendarDetailAnswer } from '../hooks/use-calendar-detail';

interface CalendarAttendanceAnswerProps {
  answer: CalendarDetailAnswer | null;
}

export const CalendarAttendanceAnswer: FC<CalendarAttendanceAnswerProps> = ({ answer }) => {
  if (answer === null) {
    return null;
  }

  return (
    <KkCalendarAgenda.Answer
      label={answer.label}
      value={answer.value}
      onChange={answer.choose}
      labels={ATTENDANCE_LABELS}
      error={answer.error}
      disabled={answer.disabled}
    />
  );
};
