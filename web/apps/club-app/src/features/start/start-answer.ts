import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { Start, StartEntry } from './schemas';

const withPendingAnswer = (
  entry: StartEntry,
  pendingAnswers: ReadonlyMap<number, AttendanceAnswer>,
): StartEntry => {
  const pending = pendingAnswers.get(entry.calendarEntryId);

  return pending === undefined || entry.attendance === null
    ? entry
    : { ...entry, attendance: { viewerAnswer: pending, isOwed: false } };
};

export const withPendingAnswers = (
  start: Start,
  pendingAnswers: ReadonlyMap<number, AttendanceAnswer>,
): Start =>
  pendingAnswers.size === 0
    ? start
    : {
        ...start,
        panels: start.panels.map((panel) =>
          panel.kind === 'calendar'
            ? {
                ...panel,
                entries: panel.entries.map((entry) => withPendingAnswer(entry, pendingAnswers)),
              }
            : panel,
        ),
      };

const calendarEntryIdsOf = (start: Start | undefined): Set<number> =>
  new Set(
    (start?.panels ?? []).flatMap((panel) =>
      panel.kind === 'calendar' ? panel.entries.map((entry) => entry.calendarEntryId) : [],
    ),
  );

export const toHeldAnswers = (
  pending: ReadonlyMap<number, AttendanceAnswer>,
  settled: ReadonlyMap<number, AttendanceAnswer>,
  fresh: Start | undefined,
): ReadonlyMap<number, AttendanceAnswer> => {
  const freshIds = calendarEntryIdsOf(fresh);
  const dropped = [...settled].filter(([calendarEntryId]) => !freshIds.has(calendarEntryId));

  return new Map([...dropped, ...pending]);
};
