import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useCalendarDetailAttendance } from '../hooks/use-calendar-detail-attendance';
import type { CalendarEntry } from '../schemas';
import { CalendarAttendanceAnswer } from './CalendarAttendanceAnswer';
import { CalendarAttendanceRoll } from './CalendarAttendanceRoll';
import { CalendarNamesSheet } from './CalendarNamesSheet';
import { CalendarReminderAction } from './CalendarReminderAction';

const NO_TABS = [] as const;

interface CalendarDetailAttendanceProps {
  entry: CalendarEntry;
}

export const CalendarDetailAttendance: FC<CalendarDetailAttendanceProps> = ({ entry }) => {
  const control = useCalendarDetailAttendance(entry);
  const tabs = control.roll?.tabs ?? NO_TABS;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <CalendarAttendanceAnswer answer={control.answer} />
      <CalendarAttendanceRoll roll={control.roll} onOpen={control.sheet.open} />
      <CalendarNamesSheet
        title={entry.title}
        tabs={tabs}
        sheet={control.sheet}
        openAction={<CalendarReminderAction source={control.reminder} />}
      />
    </Stack>
  );
};
