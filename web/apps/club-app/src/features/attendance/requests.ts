import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AttendanceResponse } from './schemas';

export const requestAttendanceResponse = (
  { calendarEntryId, answer }: AttendanceResponse,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/calendar/${calendarEntryId}/response`, {
    method: 'POST',
    body: { answer },
    schema: NoContentSchema,
    accessToken,
  });
