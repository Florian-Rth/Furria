import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { AttendanceRoll } from '../calendar-attendance';
import type { CalendarDetailAnswer } from '../hooks/use-calendar-detail';
import { CalendarAttendanceRoll } from './CalendarAttendanceRoll';

interface CalendarDetailAttendanceProps {
  answer: CalendarDetailAnswer | null;
  roll: AttendanceRoll | null;
}

export const CalendarDetailAttendance: FC<CalendarDetailAttendanceProps> = ({ answer, roll }) => {
  const choice =
    answer === null ? null : (
      <KkCalendarAgenda.Answer
        label={answer.label}
        value={answer.value}
        onChange={answer.choose}
        labels={ATTENDANCE_LABELS}
        error={answer.error}
        disabled={answer.disabled}
      />
    );
  const rollBlock = roll === null ? null : <CalendarAttendanceRoll roll={roll} />;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      {choice}
      {rollBlock}
    </Stack>
  );
};
