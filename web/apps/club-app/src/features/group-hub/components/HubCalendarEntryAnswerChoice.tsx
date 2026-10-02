import { KkAnswerChoice } from '@furria/ui';
import type { FC } from 'react';
import { ATTENDANCE_LABELS, toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import { useGroupAttendanceChoice } from '../hooks/use-group-attendance-choice';
import type { GroupCalendarEntry } from '../schemas';

interface HubCalendarEntryAnswerChoiceProps {
  entry: GroupCalendarEntry;
}

export const HubCalendarEntryAnswerChoice: FC<HubCalendarEntryAnswerChoiceProps> = ({ entry }) => {
  const choice = useGroupAttendanceChoice(entry);
  const label = toAttendanceChoiceLabel(entry.title);

  return (
    <KkAnswerChoice
      label={label}
      value={choice.answer}
      onChange={choice.choose}
      labels={ATTENDANCE_LABELS}
      disabled={choice.isSaving}
      error={choice.errorMessage}
    />
  );
};
