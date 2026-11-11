import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useCalendarDetailAttendance } from '../hooks/use-calendar-detail-attendance';
import type { CalendarEntry } from '../schemas';
import { CalendarAttendanceAnswer } from './CalendarAttendanceAnswer';
import { CalendarAttendanceRoll } from './CalendarAttendanceRoll';
import { CalendarReminderAction } from './CalendarReminderAction';

interface CalendarDetailAttendanceProps {
  entry: CalendarEntry;
}

export const CalendarDetailAttendance: FC<CalendarDetailAttendanceProps> = ({ entry }) => {
  const control = useCalendarDetailAttendance(entry);

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <CalendarAttendanceAnswer answer={control.answer} />
      <CalendarAttendanceRoll roll={control.roll} />
      <CalendarReminderAction source={control.reminder} />
    </Stack>
  );
};
