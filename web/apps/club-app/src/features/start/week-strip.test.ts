import { describe, expect, it } from 'vitest';
import type { StartEntry } from './schemas';
import {
  dayOfEntry,
  markStateOf,
  shownMarksOf,
  slotOf,
  toDayRuns,
  toEntryDays,
  toStripDays,
} from './week-strip';

const entry = (overrides: Partial<StartEntry>): StartEntry => ({
  calendarEntryId: 1,
  title: 'Training',
  kind: 'training',
  startsAt: '2027-01-19T12:00:00Z',
  endsAt: '2027-01-19T14:00:00Z',
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: null,
  description: null,
  event: null,
  ...overrides,
});

const TODAY = '2027-01-19';
const MORNING = new Date('2027-01-19T08:00:00Z');

describe('slotOf', () => {
  it.each([
    { isoDay: '2027-01-19', expected: 'today' },
    { isoDay: '2027-01-20', expected: 'tomorrow' },
    { isoDay: '2027-01-25', expected: 'week' },
    { isoDay: '2027-01-26', expected: 'later' },
    { isoDay: '2027-01-18', expected: 'today' },
  ])('places $isoDay as $expected', ({ isoDay, expected }) => {
    expect(slotOf(isoDay, TODAY)).toBe(expected);
  });
});

describe('dayOfEntry', () => {
  it('keeps an entry that began yesterday on today', () => {
    expect(dayOfEntry(entry({ startsAt: '2027-01-18T12:00:00Z' }), TODAY)).toBe(TODAY);
  });

  it('keeps a later entry on its own day', () => {
    expect(dayOfEntry(entry({ startsAt: '2027-01-22T12:00:00Z' }), TODAY)).toBe('2027-01-22');
  });
});

describe('markStateOf', () => {
  it.each([
    {
      name: 'running beats an owed answer',
      overrides: {
        startsAt: '2027-01-19T07:00:00Z',
        attendance: { viewerAnswer: null, isOwed: true },
      },
      expected: 'live',
    },
    {
      name: 'owed',
      overrides: { attendance: { viewerAnswer: null, isOwed: true } },
      expected: 'owed',
    },
    {
      name: 'answered yes',
      overrides: { attendance: { viewerAnswer: 'yes' as const, isOwed: false } },
      expected: 'answered',
    },
    {
      name: 'answered maybe',
      overrides: { attendance: { viewerAnswer: 'maybe' as const, isOwed: false } },
      expected: 'answered',
    },
    {
      name: 'asks but not owed',
      overrides: { attendance: { viewerAnswer: null, isOwed: false } },
      expected: 'plain',
    },
    { name: 'asks nothing', overrides: {}, expected: 'plain' },
  ])('$name', ({ overrides, expected }) => {
    expect(markStateOf(entry(overrides), MORNING)).toBe(expected);
  });
});

describe('shownMarksOf', () => {
  const mark = (calendarEntryId: number) => ({
    calendarEntryId,
    kind: 'training' as const,
    state: 'plain' as const,
    time: '18:00',
    title: 'Training',
  });

  it.each([
    { count: 0, shown: 0, overflow: 0 },
    { count: 2, shown: 2, overflow: 0 },
    { count: 3, shown: 2, overflow: 1 },
    { count: 7, shown: 2, overflow: 5 },
  ])('shows $shown of $count with $overflow folded', ({ count, shown, overflow }) => {
    const result = shownMarksOf(Array.from({ length: count }, (_, index) => mark(index)));

    expect([result.shown.length, result.overflow]).toEqual([shown, overflow]);
  });
});

describe('toEntryDays', () => {
  it('groups by day in date order and keeps the given order within a day', () => {
    const days = toEntryDays(
      [
        entry({ calendarEntryId: 3, startsAt: '2027-01-30T12:00:00Z' }),
        entry({ calendarEntryId: 2, startsAt: '2027-01-19T15:00:00Z' }),
        entry({ calendarEntryId: 1, startsAt: '2027-01-19T07:00:00Z' }),
        entry({ calendarEntryId: 4, startsAt: '2027-01-20T12:00:00Z' }),
      ],
      TODAY,
    );

    expect(
      days.map((day) => [day.isoDay, day.slot, day.entries.map((item) => item.calendarEntryId)]),
    ).toEqual([
      ['2027-01-19', 'today', [2, 1]],
      ['2027-01-20', 'tomorrow', [4]],
      ['2027-01-30', 'later', [3]],
    ]);
  });
});

describe('toStripDays', () => {
  const strip = toStripDays(
    [
      entry({ calendarEntryId: 2, startsAt: '2027-01-19T15:00:00Z' }),
      entry({ calendarEntryId: 1, startsAt: '2027-01-19T07:00:00Z' }),
      entry({
        calendarEntryId: 5,
        startsAt: '2027-01-21T12:00:00Z',
        attendance: { viewerAnswer: null, isOwed: true },
      }),
      entry({ calendarEntryId: 7, startsAt: '2027-02-02T12:00:00Z' }),
      entry({ calendarEntryId: 6, startsAt: '2027-01-30T12:00:00Z' }),
    ],
    TODAY,
    MORNING,
  );

  it('lays out seven days and the rest', () => {
    expect(strip.map((day) => day.key)).toEqual([
      '2027-01-19',
      '2027-01-20',
      '2027-01-21',
      '2027-01-22',
      '2027-01-23',
      '2027-01-24',
      '2027-01-25',
      'later',
    ]);
  });

  it('orders a day by start and marks its states', () => {
    expect(strip[0]?.marks.map((mark) => [mark.calendarEntryId, mark.state])).toEqual([
      [1, 'live'],
      [2, 'plain'],
    ]);
    expect(strip[2]?.marks.map((mark) => mark.state)).toEqual(['owed']);
  });

  it('jumps only from days that hold something', () => {
    expect(strip.map((day) => day.jumpTo)).toEqual([
      '2027-01-19',
      null,
      '2027-01-21',
      null,
      null,
      null,
      null,
      '2027-01-30',
    ]);
  });

  it('collects everything beyond the week in date order', () => {
    expect(strip[7]?.marks.map((mark) => mark.calendarEntryId)).toEqual([6, 7]);
  });
});

describe('toDayRuns', () => {
  it('runs rows of one day together and keeps late starters on today', () => {
    const runs = toDayRuns(
      [
        { entry: entry({ calendarEntryId: 1, startsAt: '2027-01-18T20:00:00Z' }) },
        { entry: entry({ calendarEntryId: 2, startsAt: '2027-01-19T15:00:00Z' }) },
        { entry: entry({ calendarEntryId: 3, startsAt: '2027-01-21T12:00:00Z' }) },
        { entry: entry({ calendarEntryId: 4, startsAt: '2027-01-21T16:00:00Z' }) },
      ],
      TODAY,
    );

    expect(
      runs.map((run) => [run.isoDay, run.rows.map((row) => row.entry.calendarEntryId)]),
    ).toEqual([
      ['2027-01-19', [1, 2]],
      ['2027-01-21', [3, 4]],
    ]);
  });
});
