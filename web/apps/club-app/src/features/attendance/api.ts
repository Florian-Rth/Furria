import type { MutationKey, UseMutationResult } from '@tanstack/react-query';
import { onlineManager, useMutation, useQueryClient } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { refreshAfter } from '@/lib/query/refresh-after';
import { LAST_PENDING_ANSWER, OfflineAnswerError } from './attendance-answer';
import { requestAttendanceResponse } from './requests';
import type { AttendanceResponse } from './schemas';

export const ATTENDANCE_RESPONSE_MUTATION_KEY = ['attendance-response'] as const;

export const attendanceResponseMutationKey = (calendarEntryId: number): MutationKey => [
  ...ATTENDANCE_RESPONSE_MUTATION_KEY,
  calendarEntryId,
];

export const useAttendanceResponseMutation = (
  calendarEntryId: number,
): UseMutationResult<void, Error, AttendanceResponse> => {
  const queryClient = useQueryClient();
  const mutationKey = attendanceResponseMutationKey(calendarEntryId);

  return useMutation({
    mutationKey,
    scope: { id: `attendance-response-${calendarEntryId}` },
    networkMode: 'always',
    mutationFn: (response: AttendanceResponse) => {
      if (!onlineManager.isOnline()) {
        return Promise.reject(new OfflineAnswerError());
      }

      return withFreshAccessToken((accessToken) =>
        requestAttendanceResponse(response, accessToken),
      );
    },
    onSettled: async () => {
      if (queryClient.isMutating({ mutationKey }) !== LAST_PENDING_ANSWER) {
        return;
      }

      const refreshing = refreshAfter(queryClient, ['attendanceResponse']);

      if (onlineManager.isOnline()) {
        await refreshing;
      }
    },
  });
};
