import { describe, expect, it } from 'vitest';
import {
  dayMarkOf,
  entriesOnBoardDay,
  toBoardDay,
  toBoardWeeks,
  toBoardWindow,
  toEntryDays,
} from './calendar-board';
import type { CalendarEntry } from './schemas';

const NO_LABELS = {
  opening: null,
  womensCarnivalDay: null,
  roseMonday: null,
  carnivalTuesday: null,
  ashWednesday: null,
  carnivalWeek: null,
};

const at = (day: number, hour: number, month = 10, year = 2026): string =>
  new Date(year, month - 1, day, hour).toISOString();

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 1,
  title: 'Training',
  startsAt: at(13, 19),
  endsAt: null,
  kind: 'training',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  visibility: 'club',
  asksForResponse: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: null,
  ...overrides,
});

describe('toEntryDays', () => {
  it.each([
    ['an open end', null, '2026-10-13'],
    ['an end that evening', at(13, 23), '2026-10-13'],
    ['an end in the small hours', at(14, 3), '2026-10-13'],
    ['an end on a later day', at(15, 18), '2026-10-15'],
  ])('ends an entry with %s on the right day', (_case, endsAt, endDay) => {
    expect(toEntryDays({ startsAt: at(13, 19), endsAt })).toEqual({
      startDay: '2026-10-13',
      endDay,
    });
  });
});

describe('entriesOnBoardDay', () => {
  it('lists a trip on every day it covers, the running entry first', () => {
    const trip = entry({ calendarEntryId: 1, startsAt: at(12, 9), endsAt: at(14, 18) });
    const training = entry({ calendarEntryId: 2, startsAt: at(13, 8), isRunning: true });
    const elsewhere = entry({ calendarEntryId: 3, startsAt: at(20, 19) });

    const ids = entriesOnBoardDay([trip, training, elsewhere], '2026-10-13').map(
      (onDay) => onDay.calendarEntryId,
    );

    expect(ids).toEqual([2, 1]);
  });
});

describe('dayMarkOf', () => {
  it.each([
    [new Date(2026, 10, 11), 'opening'],
    [new Date(2027, 1, 4), 'womensCarnivalDay'],
    [new Date(2027, 1, 6), 'carnivalWeek'],
    [new Date(2027, 1, 8), 'roseMonday'],
    [new Date(2027, 1, 9), 'carnivalTuesday'],
    [new Date(2027, 1, 10), 'ashWednesday'],
  ])('marks %s as %s', (day, key) => {
    expect(dayMarkOf(day)?.key).toBe(key);
  });

  it('leaves an ordinary day unmarked', () => {
    expect(dayMarkOf(new Date(2027, 1, 11))).toBeNull();
  });
});

describe('toBoardWeeks', () => {
  const cursor = new Date(2026, 9, 1);
  const today = new Date(2026, 9, 13, 10);

  it('opens the week of the selected day only', () => {
    const open = toBoardWeeks(cursor, today, '2026-10-13', [], NO_LABELS).map((week) => week.open);

    expect(open).toEqual([false, false, true, false, false]);
  });

  it('flags a day whose entry still waits for the viewer’s answer', () => {
    const weeks = toBoardWeeks(
      cursor,
      today,
      '2026-10-13',
      [entry({ startsAt: at(15, 19), asksForResponse: true })],
      NO_LABELS,
    );
    const flagged = weeks
      .flatMap((week) => week.days)
      .filter((day) => day.awaitsAnswer)
      .map((day) => day.isoDay);

    expect(flagged).toEqual(['2026-10-15']);
  });

  it('stops asking once the entry is over', () => {
    const weeks = toBoardWeeks(
      cursor,
      today,
      '2026-10-13',
      [entry({ startsAt: at(5, 19), asksForResponse: true })],
      NO_LABELS,
    );

    expect(weeks.flatMap((week) => week.days).some((day) => day.awaitsAnswer)).toBe(false);
  });
});

describe('toBoardDay', () => {
  const today = new Date(2026, 9, 13);

  it.each([
    ['a requested day on the board', new Date(2026, 9, 1), '2026-10-20', '2026-10-20'],
    ['today in the current month', new Date(2026, 9, 1), null, '2026-10-13'],
    ['the first of another month', new Date(2026, 11, 1), null, '2026-12-01'],
    [
      'the first when the request is off the board',
      new Date(2026, 11, 1),
      '2026-10-20',
      '2026-12-01',
    ],
  ])('picks %s', (_case, cursor, requested, day) => {
    expect(toBoardDay(cursor, today, requested)).toBe(day);
  });
});

describe('toBoardWindow', () => {
  it('reaches from the Monday of the first week to the Sunday of the last', () => {
    expect(toBoardWindow(new Date(2026, 9, 1))).toEqual({ from: '2026-09-28', to: '2026-11-01' });
  });
});
