import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CalendarQuery } from './calendar-query';
import { toCalendarPath } from './calendar-query';
import type { AttendanceAnswer, CalendarResponse } from './schemas';
import { CalendarResponseSchema } from './schemas';

export const requestCalendar = (
  query: CalendarQuery,
  accessToken: string,
): Promise<CalendarResponse> =>
  apiFetch(toCalendarPath(query), { schema: CalendarResponseSchema, accessToken });

export const requestAttendanceResponse = (
  calendarEntryId: number,
  answer: AttendanceAnswer,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/calendar/${calendarEntryId}/response`, {
    method: 'POST',
    body: { answer },
    schema: NoContentSchema,
    accessToken,
  });
