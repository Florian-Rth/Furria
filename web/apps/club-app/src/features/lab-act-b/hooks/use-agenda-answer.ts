import type { KkAgendaAnswerValue } from '@furria/ui/KkAgenda';
import type { Mutation } from '@tanstack/react-query';
import { useMutationState } from '@tanstack/react-query';
import { attendanceResponseMutationKey } from '@/features/attendance/api';
import { ATTENDANCE_FAILURE_EFFECTS } from '@/features/attendance/attendance-answer';
import { useAttendanceAnswer } from '@/features/attendance/hooks/use-attendance-answer';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { AttendanceResponseSchema } from '@/features/attendance/schemas';

export interface AgendaAnswer {
  value: AttendanceAnswer | null;
  error: string | undefined;
  choose: (answer: KkAgendaAnswerValue) => void;
}

const pendingAnswerOf = ({ state }: Mutation): AttendanceAnswer | null => {
  const parsed = AttendanceResponseSchema.safeParse(state.variables);

  return parsed.success ? parsed.data.answer : null;
};

export const useAgendaAnswer = (
  calendarEntryId: number,
  saved: AttendanceAnswer | null,
): AgendaAnswer => {
  const control = useAttendanceAnswer(calendarEntryId);
  const pending = useMutationState({
    filters: { mutationKey: attendanceResponseMutationKey(calendarEntryId), status: 'pending' },
    select: pendingAnswerOf,
  });
  const optimistic = pending.at(-1) ?? null;
  const message =
    control.failure === null ? null : ATTENDANCE_FAILURE_EFFECTS[control.failure].message;

  return {
    value: optimistic ?? saved,
    error: message ?? undefined,
    choose: (answer) => {
      if (answer !== (optimistic ?? saved)) {
        control.choose(answer);
      }
    },
  };
};
