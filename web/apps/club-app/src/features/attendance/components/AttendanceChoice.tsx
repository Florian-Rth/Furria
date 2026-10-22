import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import type { FC } from 'react';
import { ATTENDANCE_LABELS, toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { AnswerableEntry } from '../hooks/use-attendance-choice';
import { useAttendanceChoice } from '../hooks/use-attendance-choice';

interface AttendanceChoiceProps {
  entry: AnswerableEntry & { title: string };
}

export const AttendanceChoice: FC<AttendanceChoiceProps> = ({ entry }) => {
  const choice = useAttendanceChoice(entry);
  const label = toAttendanceChoiceLabel(entry.title);

  return (
    <KkAnswerChoice
      label={label}
      value={choice.answer}
      onChange={choice.choose}
      labels={ATTENDANCE_LABELS}
      disabled={choice.isInert}
      error={choice.failureMessage}
    />
  );
};
