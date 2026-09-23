import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AttendanceAnswerKey } from '@/lib/calendar-copy';
import { toAttendanceChoices } from '@/lib/calendar-copy';
import { useGroupAttendanceMutation } from '../api';
import type { GroupCalendarEntry } from '../schemas';
import { HubCalendarEntryAnswerButton } from './HubCalendarEntryAnswerButton';

const ROW_SX = { alignItems: 'center', gap: 0.75, flexWrap: 'wrap' } as const;

interface HubCalendarEntryAnswersProps {
  groupId: number;
  entry: GroupCalendarEntry;
}

export const HubCalendarEntryAnswers: FC<HubCalendarEntryAnswersProps> = ({ groupId, entry }) => {
  const mutation = useGroupAttendanceMutation(groupId);

  const answer = (chosen: AttendanceAnswerKey): void => {
    mutation.mutate({ calendarEntryId: entry.calendarEntryId, answer: chosen });
  };

  const buttons = toAttendanceChoices(entry.viewerAnswer).map((choice) => (
    <HubCalendarEntryAnswerButton
      key={choice.answer}
      choice={choice}
      disabled={mutation.isPending}
      onSelect={answer}
    />
  ));

  return (
    <Stack direction="row" sx={ROW_SX}>
      {buttons}
    </Stack>
  );
};
