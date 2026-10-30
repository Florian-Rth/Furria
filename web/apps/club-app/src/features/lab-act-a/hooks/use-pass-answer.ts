import type { KkPassAnswer } from '@furria/ui/KkPassCard';
import { useState } from 'react';
import { ATTENDANCE_FAILURE_EFFECTS } from '@/features/attendance/attendance-answer';
import { useAttendanceAnswer } from '@/features/attendance/hooks/use-attendance-answer';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { shownAnswerOf } from '../pass-act';

export interface PassAnswerControl {
  value: AttendanceAnswer | null;
  owed: boolean;
  error: string | undefined;
  choose: (answer: KkPassAnswer) => void;
}

export const usePassAnswer = (
  calendarEntryId: number,
  saved: AttendanceAnswer | null,
): PassAnswerControl => {
  const [chosen, setChosen] = useState<KkPassAnswer | null>(null);
  const answer = useAttendanceAnswer(calendarEntryId);
  const effect = answer.failure === null ? null : ATTENDANCE_FAILURE_EFFECTS[answer.failure];
  const value = shownAnswerOf(saved, chosen, answer.failure !== null);

  return {
    value,
    owed: value === null || value === 'maybe',
    error: effect?.message ?? undefined,
    choose: (picked) => {
      setChosen(picked);
      answer.choose(picked);
    },
  };
};
