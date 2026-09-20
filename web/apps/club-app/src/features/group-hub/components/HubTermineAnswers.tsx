import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AttendanceAnswerKey } from '@/lib/calendar-copy';
import { toAttendanceChoices } from '@/lib/calendar-copy';
import { useGroupAttendanceMutation } from '../api';
import type { GroupCalendarEntry } from '../schemas';
import { HubTermineAnswerButton } from './HubTermineAnswerButton';

const ROW_SX = { alignItems: 'center', gap: 0.75, flexWrap: 'wrap' } as const;

interface HubTermineAnswersProps {
  groupId: number;
  entry: GroupCalendarEntry;
}

export const HubTermineAnswers: FC<HubTermineAnswersProps> = ({ groupId, entry }) => {
  const mutation = useGroupAttendanceMutation(groupId);

  const answer = (chosen: AttendanceAnswerKey): void => {
    mutation.mutate({ calendarEntryId: entry.calendarEntryId, answer: chosen });
  };

  const buttons = toAttendanceChoices(entry.viewerAnswer).map((choice) => (
    <HubTermineAnswerButton
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
