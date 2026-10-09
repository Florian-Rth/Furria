import { RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { AttendanceAnswer, AttendanceResponse } from './schemas';

export class OfflineAnswerError extends Error {
  constructor() {
    super('The answer was not sent because the device is offline.');
    this.name = 'OfflineAnswerError';
  }
}

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

const statusOf = (error: Error): number | null =>
  error instanceof ServerFailureError || error instanceof RequestFailedError ? error.status : null;

export const toAttendanceFailureOf = (error: Error | null): AttendanceFailure | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof OfflineAnswerError) {
    return 'offline';
  }

  const status = statusOf(error);

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

export interface AttendanceAttempt {
  submittedAt: number;
  error: Error | null;
}

export const LAST_PENDING_ANSWER = 1;

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
