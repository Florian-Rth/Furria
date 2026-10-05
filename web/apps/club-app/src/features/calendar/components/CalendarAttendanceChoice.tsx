import { KkAnswerChoice } from '@furria/ui';
import type { FC } from 'react';
import { ATTENDANCE_LABELS, toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import { useAttendanceChoice } from '../hooks/use-attendance-choice';
import type { CalendarEntry } from '../schemas';

interface CalendarAttendanceChoiceProps {
  entry: CalendarEntry;
}

export const CalendarAttendanceChoice: FC<CalendarAttendanceChoiceProps> = ({ entry }) => {
  const choice = useAttendanceChoice(entry);
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
