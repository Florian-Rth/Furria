import { describe, expect, it } from 'vitest';
import { weekDaysOf } from './calendar-agenda';
import { hoursBadgeOf, hoursTintOf, toClock, toSegments, toUsualSegments } from './calendar-hours';
import type { CalendarEntry, UsualTraining } from './schemas';

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 1,
  title: 'Training',
  startsAt: '2026-10-20T19:00:00',
  endsAt: '2026-10-20T21:00:00',
  kind: 'training',
  venueId: null,
  venueName: null,
  ownerGroupId: 1,
  ownerGroupName: 'Tanzgarde',
  ownerGroupTone: null,
  participatingGroups: [],
  visibility: 'club',
  asksForResponse: false,
  asksTheCast: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: null,
  ...overrides,
});

const WEEK = weekDaysOf('2026-10-26');
const NO_PENDING = new Map<number, 'yes' | 'maybe' | 'no'>();

const usual = (startsAt: string, endsAt: string): UsualTraining => ({
  usualTrainingTimeId: 4,
  groupId: 1,
  groupName: 'Tanzgarde',
  groupTone: null,
  startsAt,
  endsAt,
  venueId: null,
  venueName: null,
});

describe('toUsualSegments', () => {
  it.each([
    ['2026-10-27T19:30:00', '2026-10-27T21:00:00', [{ dayIndex: 1, from: 1170, to: 1260 }]],
    ['2026-11-03T19:30:00', '2026-11-03T21:00:00', []],
    ['2026-11-01T23:00:00', '2026-11-02T00:30:00', [{ dayIndex: 6, from: 1380, to: 1440 }]],
  ])('places %s to %s on its own lane', (startsAt, endsAt, placed) => {
    const segments = toUsualSegments([usual(startsAt, endsAt)], WEEK);

    expect(
      segments.map(({ dayIndex, span }) => ({
        dayIndex,
        from: span.startMinute,
        to: span.endMinute,
      })),
    ).toEqual(placed);
  });
});

describe('toSegments', () => {
  it('places a same-day entry by its minutes', () => {
    const segments = toSegments(
      [entry({ startsAt: '2026-10-27T19:00:00', endsAt: '2026-10-27T21:00:00' })],
      WEEK,
    );

    expect(segments.map(({ dayIndex, span }) => ({ dayIndex, span }))).toEqual([
      {
        dayIndex: 1,
        span: {
          startMinute: 1140,
          endMinute: 1260,
          continuesBefore: false,
          continuesAfter: false,
          openEnd: false,
        },
      },
    ]);
  });

  it('keeps a night-owl entry on its first lane past midnight', () => {
    const segments = toSegments(
      [entry({ startsAt: '2026-10-31T19:11:00', endsAt: '2026-11-01T01:00:00' })],
      WEEK,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]?.dayIndex).toBe(5);
    expect(segments[0]?.span).toMatchObject({
      startMinute: 1151,
      endMinute: 1500,
      continuesAfter: false,
    });
  });

  it('runs a two-day entry across lanes', () => {
    const segments = toSegments(
      [entry({ startsAt: '2026-10-31T08:00:00', endsAt: '2026-11-01T18:00:00' })],
      WEEK,
    );

    expect(
      segments.map(({ dayIndex, span }) => [
        dayIndex,
        span.startMinute,
        span.endMinute,
        span.continuesBefore,
        span.continuesAfter,
      ]),
    ).toEqual([
      [5, 480, 1440, false, true],
      [6, 0, 1080, true, false],
    ]);
  });

  it('gives an open-ended entry a marked hour', () => {
    const segments = toSegments([entry({ startsAt: '2026-10-28T18:00:00', endsAt: null })], WEEK);

    expect(segments[0]?.span).toMatchObject({ startMinute: 1080, endMinute: 1140, openEnd: true });
  });

  it('keeps wall-clock minutes on the day the clocks go back', () => {
    const segments = toSegments(
      [entry({ startsAt: '2026-10-25T19:00:00', endsAt: '2026-10-25T21:00:00' })],
      weekDaysOf('2026-10-19'),
    );

    expect(segments[0]?.span).toMatchObject({ startMinute: 1140, endMinute: 1260 });
  });

  it('drops entries outside the week', () => {
    expect(toSegments([entry({})], WEEK)).toEqual([]);
  });
});

describe('hoursBadgeOf', () => {
  const now = Date.parse('2026-10-20T12:00:00');

  it.each([
    { name: 'no response asked', overrides: {}, pending: NO_PENDING, badge: null },
    {
      name: 'asked, unanswered, ahead',
      overrides: { asksForResponse: true },
      pending: NO_PENDING,
      badge: 'owed',
    },
    {
      name: 'answered maybe',
      overrides: { asksForResponse: true, viewerAnswer: 'maybe' as const },
      pending: NO_PENDING,
      badge: 'maybe',
    },
    {
      name: 'a pending answer wins',
      overrides: { asksForResponse: true },
      pending: new Map([[1, 'no' as const]]),
      badge: 'no',
    },
    {
      name: 'asked but over',
      overrides: {
        asksForResponse: true,
        startsAt: '2026-10-19T19:00:00',
        endsAt: '2026-10-19T21:00:00',
      },
      pending: NO_PENDING,
      badge: null,
    },
    {
      name: 'running and unanswered',
      overrides: {
        asksForResponse: true,
        startsAt: '2026-10-20T11:00:00',
        endsAt: '2026-10-20T13:00:00',
      },
      pending: NO_PENDING,
      badge: 'owed',
    },
  ])('$name', ({ overrides, pending, badge }) => {
    expect(hoursBadgeOf(entry(overrides), now, pending)).toBe(badge);
  });
});

describe('hoursTintOf', () => {
  it.each([
    { isoDay: '2026-10-20', expected: 'today' },
    { isoDay: '2026-11-11', expected: 'carnival' },
    { isoDay: '2026-10-21', expected: 'none' },
  ])('$isoDay → $expected', ({ isoDay, expected }) => {
    expect(hoursTintOf(isoDay, '2026-10-20')).toBe(expected);
  });
});

describe('toClock', () => {
  it.each([
    { minute: 0, expected: '00:00' },
    { minute: 1151, expected: '19:11' },
    { minute: 1500, expected: '01:00' },
  ])('$minute → $expected', ({ minute, expected }) => {
    expect(toClock(minute)).toBe(expected);
  });
});
