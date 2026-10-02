import { toWriteErrorMessage } from '@/lib/write-error';
import { useAttendanceResponseMutation } from '../api';
import type { AttendanceAnswer, CalendarEntry } from '../schemas';

export interface AttendanceChoice {
  answer: AttendanceAnswer | null;
  isSaving: boolean;
  errorMessage: string | undefined;
  choose: (answer: AttendanceAnswer) => void;
}

export const useAttendanceChoice = (entry: CalendarEntry): AttendanceChoice => {
  const mutation = useAttendanceResponseMutation();

  const choose = (answer: AttendanceAnswer): void => {
    mutation.mutate({ calendarEntryId: entry.calendarEntryId, answer });
  };

  return {
    answer: mutation.isPending ? mutation.variables.answer : entry.viewerAnswer,
    isSaving: mutation.isPending,
    errorMessage: toWriteErrorMessage(mutation.error) ?? undefined,
    choose,
  };
};
