import type { KkGroupTone } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import {
  entriesOnDay,
  sortRunningFirst,
  toDayCounts,
  toDayNumberLabel,
  toIsoDayLabel,
  toLocalIsoDay,
  toMonthGridWeeks,
  toMonthLabel,
  toMonthWeeks,
  toMonthWindow,
  toTimeSpanLabel,
  toWeekdayEyebrow,
} from './calendar-days';

const at = (year: number, month: number, day: number, hour = 0, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

describe('toLocalIsoDay', () => {
  it.each([
    [at(2026, 2, 14, 19, 30), '2026-02-14'],
    [at(2026, 2, 14, 0, 0), '2026-02-14'],
    [at(2026, 2, 14, 23, 59), '2026-02-14'],
    [at(2026, 12, 31, 23, 0), '2026-12-31'],
  ])('reads %s as the local day %s', (instant, expected) => {
    expect(toLocalIsoDay(instant)).toBe(expected);
  });
});

describe('toDayNumberLabel', () => {
  it.each([
    [at(2026, 2, 14, 19), '14.02.'],
    [at(2026, 11, 1, 8), '01.11.'],
  ])('pads %s to %s', (instant, expected) => {
    expect(toDayNumberLabel(instant)).toBe(expected);
  });
});

describe('toWeekdayEyebrow', () => {
  it.each([
    [at(2026, 2, 14, 12), 'SA'],
    [at(2026, 2, 15, 12), 'SO'],
    [at(2026, 2, 16, 12), 'MO'],
  ])('names the weekday of %s as %s', (instant, expected) => {
    expect(toWeekdayEyebrow(instant)).toBe(expected);
  });
});

describe('toTimeSpanLabel', () => {
  it('reads an open-ended entry as a start time', () => {
    expect(toTimeSpanLabel(at(2026, 2, 14, 19, 0), null)).toBe('ab 19:00 Uhr');
  });

  it('reads an entry that ends the same day as a span', () => {
    expect(toTimeSpanLabel(at(2026, 2, 14, 19, 0), at(2026, 2, 14, 23, 30))).toBe(
      '19:00 – 23:30 Uhr',
    );
  });

  it('names the closing day when the entry runs past midnight', () => {
    expect(toTimeSpanLabel(at(2026, 2, 14, 19, 0), at(2026, 2, 15, 2, 0))).toBe(
      '19:00 Uhr – 15.02. 02:00 Uhr',
    );
  });
});

describe('toIsoDayLabel', () => {
  it.each([
    ['2026-02-14', 'Samstag, 14.02.2026'],
    ['2026-11-11', 'Mittwoch, 11.11.2026'],
  ])('reads %s as %s', (isoDay, expected) => {
    expect(toIsoDayLabel(isoDay)).toBe(expected);
  });

  it('hands back an unparseable day unchanged', () => {
    expect(toIsoDayLabel('irgendwann')).toBe('irgendwann');
  });
});

describe('toMonthLabel', () => {
  it.each([
    [new Date(2026, 1, 1), 'Februar 2026'],
    [new Date(2026, 10, 1), 'November 2026'],
  ])('names the month of %s', (cursor, expected) => {
    expect(toMonthLabel(cursor)).toBe(expected);
  });
});

describe('toMonthWindow', () => {
  it.each([
    [new Date(2026, 1, 17), '2026-02-01', '2026-02-28'],
    [new Date(2024, 1, 17), '2024-02-01', '2024-02-29'],
    [new Date(2026, 11, 3), '2026-12-01', '2026-12-31'],
  ])('spans the whole month of %s', (cursor, from, to) => {
    expect(toMonthWindow(cursor)).toEqual({ from, to });
  });
});

describe('toMonthWeeks', () => {
  it('opens every week on a Monday', () => {
    const weeks = toMonthWeeks(new Date(2026, 1, 1));

    expect(weeks.map((week) => week[0]?.getDay())).toEqual(weeks.map(() => 1));
  });

  it('leads a month that opens on a Sunday with a full week', () => {
    const [firstWeek] = toMonthWeeks(new Date(2026, 1, 1));

    expect(firstWeek?.[0]?.getDate()).toBe(26);
    expect(firstWeek?.[6]?.getDate()).toBe(1);
  });

  it('uses five rows for a 28-day February that opens on a Sunday', () => {
    expect(toMonthWeeks(new Date(2026, 1, 1))).toHaveLength(5);
  });

  it('uses four rows for a 28-day February that opens on a Monday', () => {
    expect(toMonthWeeks(new Date(2021, 1, 1))).toHaveLength(4);
  });

  it('uses six rows for a 31-day month that opens on a Sunday', () => {
    expect(toMonthWeeks(new Date(2026, 2, 1))).toHaveLength(6);
  });
});

interface ToneCase {
  case: string;
  tones: readonly (KkGroupTone | null)[];
  expected: readonly KkGroupTone[];
}

const toneCases: readonly ToneCase[] = [
  { case: 'keeps a club-only day without a tone', tones: [null, null], expected: [] },
  {
    case: 'keeps the first-seen order of the tones',
    tones: ['rose', 'teal'],
    expected: ['rose', 'teal'],
  },
  {
    case: 'drops a tone the day already carries',
    tones: ['teal', 'rose', 'teal'],
    expected: ['teal', 'rose'],
  },
  {
    case: 'skips the club entries between two tones',
    tones: ['teal', null, 'rose'],
    expected: ['teal', 'rose'],
  },
  {
    case: 'caps the tones of one day at three',
    tones: ['clay', 'olive', 'lime', 'fern'],
    expected: ['clay', 'olive', 'lime'],
  },
];

describe('toDayCounts', () => {
  it('counts the entries that fall on one local day', () => {
    const days = toDayCounts([
      { startsAt: at(2026, 2, 14, 10), tone: null },
      { startsAt: at(2026, 2, 14, 20), tone: null },
      { startsAt: at(2026, 2, 15, 10), tone: null },
    ]);

    expect([...days.entries()]).toEqual([
      ['2026-02-14', { entryCount: 2, tones: [] }],
      ['2026-02-15', { entryCount: 1, tones: [] }],
    ]);
  });

  it.each(toneCases)('$case', ({ tones, expected }) => {
    const marks = tones.map((tone) => ({ startsAt: at(2026, 2, 14, 10), tone }));

    expect(toDayCounts(marks).get('2026-02-14')).toEqual({
      entryCount: tones.length,
      tones: expected,
    });
  });
});

describe('toMonthGridWeeks', () => {
  it('marks the month, today, the selection, the entry count and the tones', () => {
    const weeks = toMonthGridWeeks(
      new Date(2026, 1, 1),
      new Date(2026, 1, 14),
      [
        { startsAt: at(2026, 2, 14, 19), tone: 'teal' },
        { startsAt: at(2026, 2, 14, 21), tone: null },
      ],
      '2026-02-16',
    );
    const days = weeks.flatMap((week) => week.days);

    expect(days.find((day) => day.isoDay === '2026-01-26')).toEqual({
      isoDay: '2026-01-26',
      dayNumber: 26,
      inMonth: false,
      isToday: false,
      selected: false,
      entryCount: 0,
      tones: [],
    });
    expect(days.find((day) => day.isoDay === '2026-02-14')).toEqual({
      isoDay: '2026-02-14',
      dayNumber: 14,
      inMonth: true,
      isToday: true,
      selected: false,
      entryCount: 2,
      tones: ['teal'],
    });
    expect(days.find((day) => day.isoDay === '2026-02-16')?.selected).toBe(true);
  });
});

describe('entriesOnDay', () => {
  it('keeps only the entries that start on that local day', () => {
    const entries = [
      { startsAt: at(2026, 2, 14, 23) },
      { startsAt: at(2026, 2, 15, 1) },
      { startsAt: at(2026, 2, 14, 8) },
    ];

    expect(entriesOnDay(entries, '2026-02-14')).toEqual([entries[0], entries[2]]);
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
