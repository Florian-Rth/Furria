import { describe, expect, it } from 'vitest';
import { sortRunningFirst, toMonthWeeks, toTimeSpan } from './calendar-days';

const at = (year: number, month: number, day: number, hour = 0, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

describe('toTimeSpan', () => {
  it.each([
    { label: 'an open-ended entry', endsAt: null, expected: 'open-ended' },
    {
      label: 'an entry that ends the same day',
      endsAt: at(2026, 2, 14, 23, 30),
      expected: 'same-day',
    },
    {
      label: 'an entry that runs past midnight',
      endsAt: at(2026, 2, 15, 2, 0),
      expected: 'overnight',
    },
  ])('reads $label as $expected', ({ endsAt, expected }) => {
    expect(toTimeSpan(at(2026, 2, 14, 19, 0), endsAt).kind).toBe(expected);
  });
});

describe('toMonthWeeks', () => {
  it('leads a month that opens on a Sunday with a full week opening on Monday', () => {
    const [firstWeek] = toMonthWeeks(new Date(2026, 1, 1));

    expect(firstWeek?.[0]?.getDay()).toBe(1);
    expect(firstWeek?.[0]?.getDate()).toBe(26);
    expect(firstWeek?.[6]?.getDate()).toBe(1);
  });

  it.each([
    { label: 'a 28-day February that opens on a Sunday', cursor: new Date(2026, 1, 1), rows: 5 },
    { label: 'a 28-day February that opens on a Monday', cursor: new Date(2021, 1, 1), rows: 4 },
    { label: 'a 31-day month that opens on a Sunday', cursor: new Date(2026, 2, 1), rows: 6 },
  ])('uses $rows rows for $label', ({ cursor, rows }) => {
    expect(toMonthWeeks(cursor)).toHaveLength(rows);
  });
});

describe('sortRunningFirst', () => {
  it('lifts a running entry above an earlier upcoming one', () => {
    const running = { calendarEntryId: 2, startsAt: at(2026, 2, 14, 19), isRunning: true };
    const upcoming = { calendarEntryId: 1, startsAt: at(2026, 2, 13, 9), isRunning: false };

    expect(sortRunningFirst([upcoming, running])).toEqual([running, upcoming]);
  });

  it('orders equally running entries by start', () => {
    const later = { calendarEntryId: 1, startsAt: at(2026, 2, 16, 9), isRunning: false };
    const sooner = { calendarEntryId: 2, startsAt: at(2026, 2, 15, 9), isRunning: false };

    expect(sortRunningFirst([later, sooner])).toEqual([sooner, later]);
  });

  it('breaks a shared start on the entry id', () => {
    const second = { calendarEntryId: 9, startsAt: at(2026, 2, 15, 9), isRunning: false };
    const first = { calendarEntryId: 4, startsAt: at(2026, 2, 15, 9), isRunning: false };

    expect(sortRunningFirst([second, first])).toEqual([first, second]);
  });

  it('leaves the given array untouched', () => {
    const entries = [
      { calendarEntryId: 1, startsAt: at(2026, 2, 16, 9), isRunning: false },
      { calendarEntryId: 2, startsAt: at(2026, 2, 15, 9), isRunning: true },
    ];

    sortRunningFirst(entries);

    expect(entries[0]?.calendarEntryId).toBe(1);
  });
});
