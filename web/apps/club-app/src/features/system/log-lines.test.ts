import { describe, expect, it } from 'vitest';
import type { LogDay, LogTime } from './log-lines';
import { freshCountOf, groupLogEntries, logDayOf, logRowsOf, logTimeOf } from './log-lines';
import type { LogEntry } from './schemas';

const entry = (
  id: number,
  loggedAt: Date,
  template: string,
  source: LogEntry['source'] = 'api',
): LogEntry => ({
  id,
  loggedAt: loggedAt.toISOString(),
  source,
  instance: 'api-1',
  level: 'warning',
  category: 'Furria.Mail',
  template,
  message: `${template} #${id}`,
  exception: null,
});

describe('groupLogEntries', () => {
  it('folds consecutive repeats of one message and keeps interruptions apart', () => {
    const at = new Date(2026, 9, 13, 14, 0);
    const groups = groupLogEntries([
      entry(9, at, 'Mail {Id} failed'),
      entry(8, at, 'Mail {Id} failed'),
      entry(7, at, 'Mail {Id} failed', 'mediaWorker'),
      entry(6, at, 'Disk low'),
      entry(5, at, 'Mail {Id} failed'),
    ]);

    expect(groups.map((group) => group.entries.map((member) => member.id))).toEqual([
      [9, 8],
      [7],
      [6],
      [5],
    ]);
  });
});

describe('logRowsOf', () => {
  it('opens a day divider before the first entry of every day', () => {
    const rows = logRowsOf(
      groupLogEntries([
        entry(3, new Date(2026, 9, 13, 0, 5), 'A'),
        entry(2, new Date(2026, 9, 12, 23, 50), 'B'),
        entry(1, new Date(2026, 9, 12, 22, 10), 'C'),
      ]),
    );

    expect(rows.map((row) => (row.kind === 'day' ? row.day : row.group.head.id))).toEqual([
      '2026-10-13',
      3,
      '2026-10-12',
      2,
      1,
    ]);
  });
});

describe('logTimeOf', () => {
  const now = new Date(2026, 9, 13, 14, 30, 0);

  it.each<{ label: string; at: Date; time: LogTime }>([
    { label: 'just now', at: new Date(2026, 9, 13, 14, 29, 30), time: { kind: 'now' } },
    {
      label: 'minutes within the hour',
      at: new Date(2026, 9, 13, 14, 2, 59),
      time: { kind: 'minutes', minutes: 27 },
    },
    {
      label: 'the clock beyond the hour',
      at: new Date(2026, 9, 13, 13, 12, 5),
      time: { kind: 'clock', clock: '13:12:05' },
    },
  ])('$label', ({ at, time }) => {
    expect(logTimeOf(at, now)).toEqual(time);
  });
});

describe('logDayOf', () => {
  const now = new Date(2026, 9, 1, 8, 0);

  it.each<{ day: string; kind: LogDay }>([
    { day: '2026-10-01', kind: 'today' },
    { day: '2026-09-30', kind: 'yesterday' },
    { day: '2026-09-29', kind: 'earlier' },
  ])('$day is $kind', ({ day, kind }) => {
    expect(logDayOf(day, now)).toBe(kind);
  });
});

describe('freshCountOf', () => {
  const at = new Date(2026, 9, 13, 14, 0);
  const head = [entry(12, at, 'A'), entry(11, at, 'B'), entry(10, at, 'C')];

  it.each<{ label: string; newest: number | null; count: number }>([
    { label: 'counts what arrived above the newest shown line', newest: 10, count: 2 },
    { label: 'counts nothing when the list is current', newest: 12, count: 0 },
    { label: 'counts everything when nothing is shown yet', newest: null, count: 3 },
  ])('$label', ({ newest, count }) => {
    expect(freshCountOf(head, newest)).toBe(count);
  });
});
