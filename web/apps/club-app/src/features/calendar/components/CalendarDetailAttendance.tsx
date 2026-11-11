import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AttendanceRoll } from '../calendar-attendance';
import type { CalendarReminderSource } from '../calendar-reminders';
import type { CalendarDetailAnswer } from '../hooks/use-calendar-detail';
import { CalendarAttendanceAnswer } from './CalendarAttendanceAnswer';
import { CalendarAttendanceRoll } from './CalendarAttendanceRoll';
import { CalendarReminderAction } from './CalendarReminderAction';

interface CalendarDetailAttendanceProps {
  answer: CalendarDetailAnswer | null;
  roll: AttendanceRoll | null;
  reminder: CalendarReminderSource | null;
}

export const CalendarDetailAttendance: FC<CalendarDetailAttendanceProps> = ({
  answer,
  roll,
  reminder,
}) => {
  const reminderAction = reminder === null ? null : <CalendarReminderAction source={reminder} />;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <CalendarAttendanceAnswer answer={answer} />
      <CalendarAttendanceRoll roll={roll} />
      {reminderAction}
    </Stack>
  );
};
