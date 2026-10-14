import type { MutationKey, UseMutationResult } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { requestAttendanceResponse } from './requests';
import type { AttendanceResponse } from './schemas';

export const ATTENDANCE_RESPONSE_MUTATION_KEY = ['attendance-response'] as const;

export const attendanceResponseMutationKey = (calendarEntryId: number): MutationKey => [
  ...ATTENDANCE_RESPONSE_MUTATION_KEY,
  calendarEntryId,
];

export const useAttendanceResponseMutation = (
  calendarEntryId: number,
): UseMutationResult<void, Error, AttendanceResponse> =>
  useApiMutation({
    key: attendanceResponseMutationKey(calendarEntryId),
    request: requestAttendanceResponse,
    changes: ['attendanceResponse'],
  });
