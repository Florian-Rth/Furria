import { toIsoDay } from '@/lib/day';
import type { LogEntry } from './schemas';
import { formatClockSeconds } from './system-format';

export interface LogGroup {
  key: string;
  head: LogEntry;
  entries: LogEntry[];
}

export type LogRow = { kind: 'day'; key: string; day: string } | { kind: 'group'; group: LogGroup };

export type LogTime =
  | { kind: 'now' }
  | { kind: 'minutes'; minutes: number }
  | { kind: 'clock'; clock: string };

export type LogDay = 'today' | 'yesterday' | 'earlier';

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

const sameKind = (left: LogEntry, right: LogEntry): boolean =>
  left.template === right.template &&
  left.category === right.category &&
  left.source === right.source;

export const groupLogEntries = (entries: readonly LogEntry[]): LogGroup[] => {
  const groups: LogGroup[] = [];

  for (const entry of entries) {
    const current = groups.at(-1);

    if (current !== undefined && sameKind(current.head, entry)) {
      current.entries.push(entry);
    } else {
      groups.push({ key: `log-${entry.id}`, head: entry, entries: [entry] });
    }
  }

  return groups;
};

export const logRowsOf = (groups: readonly LogGroup[]): LogRow[] => {
  const rows: LogRow[] = [];
  let shownDay: string | null = null;

  for (const group of groups) {
    const day = toIsoDay(new Date(group.head.loggedAt));

    if (day !== shownDay) {
      rows.push({ kind: 'day', key: `day-${day}`, day });
      shownDay = day;
    }
    rows.push({ kind: 'group', group });
  }

  return rows;
};

export const logTimeOf = (loggedAt: Date, now: Date): LogTime => {
  const age = now.getTime() - loggedAt.getTime();

  if (age < MINUTE_MS) {
    return { kind: 'now' };
  }
  if (age < HOUR_MS) {
    return { kind: 'minutes', minutes: Math.floor(age / MINUTE_MS) };
  }

  return { kind: 'clock', clock: formatClockSeconds(loggedAt) };
};

export const logDayOf = (day: string, now: Date): LogDay => {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  if (day === toIsoDay(now)) {
    return 'today';
  }
  if (day === toIsoDay(yesterday)) {
    return 'yesterday';
  }

  return 'earlier';
};

export const freshCountOf = (head: readonly LogEntry[], newestShownId: number | null): number =>
  newestShownId === null ? head.length : head.filter((entry) => entry.id > newestShownId).length;
