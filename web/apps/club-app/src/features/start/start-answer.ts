import { RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { Start, StartAttendance } from './schemas';

export class OfflineAnswerError extends Error {
  constructor() {
    super('The answer was not sent because the device is offline.');
    this.name = 'OfflineAnswerError';
  }
}

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

const statusOf = (error: Error): number | null =>
  error instanceof ServerFailureError || error instanceof RequestFailedError ? error.status : null;

export const toAnswerFailureOf = (error: Error | null): StartAnswerFailure | null => {
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

export const attendanceOf = (
  start: Start | undefined,
  calendarEntryId: number,
): StartAttendance | null | undefined => {
  for (const panel of start?.panels ?? []) {
    if (panel.kind === 'calendar') {
      const entry = panel.entries.find(
        (candidate) => candidate.calendarEntryId === calendarEntryId,
      );

      if (entry !== undefined) {
        return entry.attendance;
      }
    }
  }

  return undefined;
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
