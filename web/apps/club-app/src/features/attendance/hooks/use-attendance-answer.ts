import type { Mutation } from '@tanstack/react-query';
import { useMutationState } from '@tanstack/react-query';
import { useState } from 'react';
import { attendanceResponseMutationKey, useAttendanceResponseMutation } from '../api';
import type { AttendanceAttempt, AttendanceFailure } from '../attendance-answer';
import { latestAnswerErrorOf, resubmitsAfter, toAttendanceFailureOf } from '../attendance-answer';
import type { AttendanceAnswer } from '../schemas';

export interface AttendanceAnswerOptions {
  onSaved?: (answer: AttendanceAnswer) => void;
}

export interface AttendanceAnswerControl {
  choose: (answer: AttendanceAnswer) => void;
  failure: AttendanceFailure | null;
}

const toAttempt = ({ state }: Mutation): AttendanceAttempt => ({
  submittedAt: state.submittedAt,
  error: state.error,
});

export const useAttendanceAnswer = (
  calendarEntryId: number,
  { onSaved }: AttendanceAnswerOptions = {},
): AttendanceAnswerControl => {
  const mutation = useAttendanceResponseMutation(calendarEntryId);
  const [mountedAt] = useState(Date.now);
  const attempts = useMutationState({
    filters: { mutationKey: attendanceResponseMutationKey(calendarEntryId) },
    select: toAttempt,
  });

  const submit = (answer: AttendanceAnswer, isResubmission: boolean): void => {
    mutation.mutate(
      { calendarEntryId, answer },
      {
        onSuccess: () => {
          onSaved?.(answer);
        },
        onError: (error) => {
          if (resubmitsAfter(error, isResubmission)) {
            submit(answer, true);
          }
        },
      },
    );
  };

  const choose = (answer: AttendanceAnswer): void => {
    submit(answer, false);
  };

  return { choose, failure: toAttendanceFailureOf(latestAnswerErrorOf(attempts, mountedAt)) };
};
