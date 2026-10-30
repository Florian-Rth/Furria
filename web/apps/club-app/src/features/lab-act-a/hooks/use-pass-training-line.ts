import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import { useId, useState } from 'react';
import { ATTENDANCE_FAILURE_EFFECTS } from '@/features/attendance/attendance-answer';
import { useAttendanceAnswer } from '@/features/attendance/hooks/use-attendance-answer';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { shownAnswerOf } from '../pass-act';

export interface PassTrainingLine {
  choiceId: string;
  value: AttendanceAnswer | null;
  choosing: boolean;
  alert: string | undefined;
  toggle: () => void;
  collapse: () => void;
  choose: (answer: KkAnswer) => void;
}

export const usePassTrainingLine = (
  calendarEntryId: number,
  saved: AttendanceAnswer | null,
): PassTrainingLine => {
  const choiceId = useId();
  const [choosing, setChoosing] = useState(false);
  const [chosen, setChosen] = useState<AttendanceAnswer | null>(null);
  const answer = useAttendanceAnswer(calendarEntryId);
  const effect = answer.failure === null ? null : ATTENDANCE_FAILURE_EFFECTS[answer.failure];

  return {
    choiceId,
    value: shownAnswerOf(saved, chosen, answer.failure !== null),
    choosing,
    alert: effect?.message ?? undefined,
    toggle: () => {
      setChoosing((open) => !open);
    },
    collapse: () => {
      setChoosing(false);
    },
    choose: (picked) => {
      setChosen(picked);
      setChoosing(false);
      answer.choose(picked);
    },
  };
};
