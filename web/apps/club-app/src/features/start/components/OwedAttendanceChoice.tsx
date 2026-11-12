import { KkAnswerChoice } from '@furria/ui/KkAnswerChoice';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { OwedAttendanceView } from '../hooks/use-owed-attendance';

interface OwedAttendanceChoiceProps {
  view: OwedAttendanceView;
}

export const OwedAttendanceChoice: FC<OwedAttendanceChoiceProps> = ({ view }) => (
  <KkAnswerChoice
    label={view.choiceLabel}
    value={view.value}
    onChange={view.choose}
    labels={ATTENDANCE_LABELS}
    error={view.error}
    disabled={view.disabled}
  />
);
