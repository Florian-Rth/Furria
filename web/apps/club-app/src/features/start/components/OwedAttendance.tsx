import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { useOwedAttendance } from '../hooks/use-owed-attendance';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry } from '../schemas';

interface OwedAttendanceProps {
  entry: StartEntry;
  board: StartBoard;
}

export const OwedAttendance: FC<OwedAttendanceProps> = ({ entry, board }) => {
  const answer = useOwedAttendance(entry, board);

  return (
    <KkAnswerChoice
      label={answer.choiceLabel}
      value={answer.value}
      onChange={answer.choose}
      labels={ATTENDANCE_LABELS}
      error={answer.error}
      disabled={answer.disabled}
    />
  );
};
