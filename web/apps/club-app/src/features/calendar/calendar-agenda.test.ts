import { describe, expect, it } from 'vitest';
import { isoWeekOf, owedIdsOf } from './calendar-agenda';
import type { CalendarEntry } from './schemas';

const at = (day: string, time: string): string =>
  new Date(
    Number(day.slice(0, 4)),
    Number(day.slice(5, 7)) - 1,
    Number(day.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
  ).toISOString();

const entry = (
  calendarEntryId: number,
  startsAt: string,
  endsAt: string | null,
  extra: Partial<CalendarEntry> = {},
): CalendarEntry => ({
  calendarEntryId,
  title: `Eintrag ${calendarEntryId}`,
  startsAt,
  endsAt,
  kind: 'training',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  audience: 'club',
  audienceGroups: [],
  audiencePeople: [],
  asksForResponse: false,
  addOns: [],
  attendance: null,
  description: null,
  viewerAnswer: null,
  mayAnswer: true,
  openFunctions: [],
  isRunning: false,
  event: null,
  ...extra,
});

const NOW = Date.parse(at('2026-10-20', '12:00'));

describe('isoWeekOf', () => {
  it.each([
    ['2027-01-01', 53],
    ['2027-01-04', 1],
    ['2026-12-28', 53],
  ])('%s is in week %d', (day, week) => {
    expect(isoWeekOf(day)).toBe(week);
  });
});

describe('owedIdsOf', () => {
  it('owes only unanswered, asking, unfinished entries', () => {
    const entries = [
      entry(1, at('2026-10-21', '19:00'), at('2026-10-21', '21:00'), { asksForResponse: true }),
      entry(2, at('2026-10-21', '19:00'), null, { asksForResponse: true, viewerAnswer: 'maybe' }),
      entry(3, at('2026-10-19', '19:00'), at('2026-10-19', '21:00'), { asksForResponse: true }),
      entry(4, at('2026-10-22', '19:00'), null),
      entry(5, at('2026-10-23', '19:00'), null, { asksForResponse: true }),
      entry(6, at('2026-10-20', '11:00'), at('2026-10-20', '13:00'), { asksForResponse: true }),
    ];

    expect(owedIdsOf(entries, NOW, new Map([[5, 'yes']]))).toEqual([1, 6]);
  });
});
