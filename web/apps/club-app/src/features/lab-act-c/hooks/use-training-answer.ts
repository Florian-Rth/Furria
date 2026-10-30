import { useAttendanceResponseMutation } from '@/features/attendance/api';
import type { AnswerKey } from '../act-c-model';
import { answerKeyOf } from '../act-c-model';

export interface TrainingAnswer {
  value: AnswerKey | null;
  busy: boolean;
  answer: (key: AnswerKey) => void;
}

export const useTrainingAnswer = (
  calendarEntryId: number,
  saved: AnswerKey | null,
): TrainingAnswer => {
  const mutation = useAttendanceResponseMutation(calendarEntryId);
  const pending = mutation.isPending ? answerKeyOf(mutation.variables?.answer) : null;

  const answer = (key: AnswerKey): void => {
    mutation.mutate({ calendarEntryId, answer: key });
  };

  return { value: pending ?? saved, busy: mutation.isPending, answer };
};
