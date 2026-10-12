import { apiStatusOf } from '@furria/api-client';
import { OfflineWriteError } from '@/lib/api/offline-write-error';
import type { Start, StartAttendance } from './schemas';

export type StartAnswerFailure = 'unsaved' | 'gone' | 'notAsked' | 'conflict' | 'offline';

export interface StartAnswerFailureEffect {
  message: string | null;
  dims: boolean;
}

export const ANSWER_FAILURE_EFFECTS: Record<StartAnswerFailure, StartAnswerFailureEffect> = {
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

export const toAnswerFailureOf = (error: Error | null): StartAnswerFailure | null => {
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

export interface StartAnswerAttempt {
  submittedAt: number;
  error: Error | null;
}

export const latestAnswerErrorOf = (
  attempts: readonly StartAnswerAttempt[],
  since: number,
): Error | null => {
  const latest = attempts.at(-1);

  return latest === undefined || latest.submittedAt < since ? null : latest.error;
};

export const withEntryAttendance = (
  start: Start,
  calendarEntryId: number,
  attendance: StartAttendance | null,
): Start => ({
  ...start,
  panels: start.panels.map((panel) =>
    panel.kind === 'calendar'
      ? {
          ...panel,
          entries: panel.entries.map((entry) =>
            entry.calendarEntryId === calendarEntryId ? { ...entry, attendance } : entry,
          ),
        }
      : panel,
  ),
});
