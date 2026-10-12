import type { Mutation } from '@tanstack/react-query';
import { useMutationState } from '@tanstack/react-query';
import { ATTENDANCE_RESPONSE_MUTATION_KEY } from '../api';
import { pendingAnswersOf } from '../attendance-answer';
import type { AttendanceAnswer, AttendanceResponse } from '../schemas';
import { AttendanceResponseSchema } from '../schemas';

const toResponse = ({ state }: Mutation): AttendanceResponse =>
  AttendanceResponseSchema.parse(state.variables);

export const usePendingAnswers = (): ReadonlyMap<number, AttendanceAnswer> =>
  pendingAnswersOf(
    useMutationState({
      filters: { mutationKey: ATTENDANCE_RESPONSE_MUTATION_KEY, status: 'pending' },
      select: toResponse,
    }),
  );
