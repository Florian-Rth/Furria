import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useAttendanceResponseMutation } from '../api';
import { toAttendanceChoices } from '../calendar-labels';
import type { AttendanceAnswer, CalendarEntry } from '../schemas';
import { CalendarAttendanceButton } from './CalendarAttendanceButton';

interface CalendarAttendanceRowProps {
  entry: CalendarEntry;
}

export const CalendarAttendanceRow: FC<CalendarAttendanceRowProps> = ({ entry }) => {
  const mutation = useAttendanceResponseMutation();

  const answer = (chosen: AttendanceAnswer): void => {
    mutation.mutate({ calendarEntryId: entry.calendarEntryId, answer: chosen });
  };

  const buttons = toAttendanceChoices(entry.viewerAnswer).map((choice) => (
    <CalendarAttendanceButton
      key={choice.answer}
      choice={choice}
      disabled={mutation.isPending}
      onSelect={answer}
    />
  ));

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
      {buttons}
    </Stack>
  );
};
