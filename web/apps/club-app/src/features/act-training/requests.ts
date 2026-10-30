import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { MarkedAnswer } from './training-attendance';

const attendancePath = (actId: number, calendarEntryId: number, personId: number): string =>
  `/api/acts/${actId}/trainings/${calendarEntryId}/attendance/${personId}`;

export const requestAttendanceMark = (
  actId: number,
  calendarEntryId: number,
  personId: number,
  answer: MarkedAnswer,
  accessToken: string,
): Promise<void> =>
  apiFetch(attendancePath(actId, calendarEntryId, personId), {
    method: 'PUT',
    body: { answer },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAttendanceWithdrawal = (
  actId: number,
  calendarEntryId: number,
  personId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(attendancePath(actId, calendarEntryId, personId), {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
