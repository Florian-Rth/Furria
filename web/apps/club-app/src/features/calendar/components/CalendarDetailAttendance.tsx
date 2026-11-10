import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AttendanceRoll } from '../calendar-attendance';
import type { CalendarDetailAnswer } from '../hooks/use-calendar-detail';
import { CalendarAttendanceAnswer } from './CalendarAttendanceAnswer';
import { CalendarAttendanceRoll } from './CalendarAttendanceRoll';

interface CalendarDetailAttendanceProps {
  answer: CalendarDetailAnswer | null;
  roll: AttendanceRoll | null;
}

export const CalendarDetailAttendance: FC<CalendarDetailAttendanceProps> = ({ answer, roll }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <CalendarAttendanceAnswer answer={answer} />
    <CalendarAttendanceRoll roll={roll} />
  </Stack>
);
