import { toWriteErrorMessage } from '@/lib/write-error';
import { useGroupAttendanceMutation } from '../api';
import type { GroupAttendanceAnswer, GroupCalendarEntry } from '../schemas';

export interface GroupAttendanceChoice {
  answer: GroupAttendanceAnswer | null;
  isSaving: boolean;
  errorMessage: string | undefined;
  choose: (answer: GroupAttendanceAnswer) => void;
}

export const useGroupAttendanceChoice = (entry: GroupCalendarEntry): GroupAttendanceChoice => {
  const mutation = useGroupAttendanceMutation();

  const choose = (answer: GroupAttendanceAnswer): void => {
    mutation.mutate({ calendarEntryId: entry.calendarEntryId, answer });
  };

  return {
    answer: mutation.isPending ? mutation.variables.answer : entry.viewerAnswer,
    isSaving: mutation.isPending,
    errorMessage: toWriteErrorMessage(mutation.error) ?? undefined,
    choose,
  };
};
