import { useIsMutating } from '@tanstack/react-query';
import { useState } from 'react';
import { attendanceResponseMutationKey } from '@/features/attendance/api';
import { ATTENDANCE_FAILURE_EFFECTS } from '@/features/attendance/attendance-answer';
import { useAttendanceAnswer } from '@/features/attendance/hooks/use-attendance-answer';
import type { AnswerKey } from '../act-card-model';

export interface TrainingAnswer {
  value: AnswerKey | null;
  busy: boolean;
  failure: string | null;
  answer: (key: AnswerKey) => void;
}

export const useTrainingAnswer = (
  calendarEntryId: number,
  saved: AnswerKey | null,
): TrainingAnswer => {
  const [chosen, setChosen] = useState<AnswerKey | null>(null);
  const control = useAttendanceAnswer(calendarEntryId);
  const busy = useIsMutating({ mutationKey: attendanceResponseMutationKey(calendarEntryId) }) > 0;
  const failure = control.failure === null ? null : ATTENDANCE_FAILURE_EFFECTS[control.failure];
  const pending = busy ? chosen : null;

  const answer = (key: AnswerKey): void => {
    setChosen(key);
    control.choose(key);
  };

  return { value: pending ?? saved, busy, failure: failure?.message ?? null, answer };
};
