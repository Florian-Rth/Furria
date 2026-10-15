import { apiStatusOf } from '@furria/api-client';
import { OfflineWriteError } from '@/lib/api/offline-write-error';
import type { AttendanceAnswer, AttendanceResponse } from './schemas';

export type AttendanceFailure = 'unsaved' | 'gone' | 'notAsked' | 'conflict' | 'offline';

export interface AttendanceFailureEffect {
  message: string | null;
  dims: boolean;
}

export const ATTENDANCE_FAILURE_EFFECTS: Record<AttendanceFailure, AttendanceFailureEffect> = {
  unsaved: { message: 'Nicht gespeichert – nochmal tippen', dims: false },
  gone: { message: 'nicht mehr im Kalender', dims: true },
  notAsked: { message: 'fragt keine Zu-/Absage mehr', dims: true },
  conflict: { message: null, dims: false },
  offline: { message: 'Offline – nicht gespeichert', dims: false },
};

const BAD_REQUEST_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

export const toAttendanceFailureOf = (error: Error | null): AttendanceFailure | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof OfflineWriteError) {
    return 'offline';
  }

  const status = apiStatusOf(error);

  if (status === NOT_FOUND_STATUS || status === FORBIDDEN_STATUS) {
    return 'gone';
  }
  if (status === BAD_REQUEST_STATUS) {
    return 'notAsked';
  }
  if (status === CONFLICT_STATUS) {
    return 'conflict';
  }

  return 'unsaved';
};

export const resubmitsAfter = (error: Error, isResubmission: boolean): boolean =>
  !isResubmission && toAttendanceFailureOf(error) === 'conflict';

export interface AttendanceAttempt {
  submittedAt: number;
  error: Error | null;
}

export const latestAnswerErrorOf = (
  attempts: readonly AttendanceAttempt[],
  since: number,
): Error | null => {
  const latest = attempts.at(-1);

  return latest === undefined || latest.submittedAt < since ? null : latest.error;
};

export const pendingAnswersOf = (
  pending: readonly AttendanceResponse[],
): ReadonlyMap<number, AttendanceAnswer> =>
  new Map(pending.map(({ calendarEntryId, answer }) => [calendarEntryId, answer]));
