import { describe, expect, it } from 'vitest';
import {
  toAttendanceChoices,
  toCalendarLead,
  toEntryMetaLine,
  toScopeOptions,
} from './calendar-labels';
import type { CalendarEntry } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 1,
  title: 'Prunksitzung',
  startsAt: at(2026, 2, 14, 19),
  endsAt: null,
  kind: 'performance',
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  visibility: 'club',
  asksForResponse: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  ...overrides,
});

describe('toCalendarLead', () => {
  it.each([
    [0, 'Gerade steht nichts im Kalender.'],
    [1, 'Ein Termin steht im Kalender.'],
    [4, '4 Termine stehen im Kalender.'],
  ])('reads %i entries as %s', (count, expected) => {
    expect(toCalendarLead(count)).toBe(expected);
  });
});

describe('toAttendanceChoices', () => {
  it('marks nothing when the viewer has not answered', () => {
    expect(toAttendanceChoices(null).map((choice) => choice.selected)).toEqual([
      false,
      false,
      false,
    ]);
  });

  it.each([
    ['yes' as const, [true, false, false]],
    ['no' as const, [false, true, false]],
    ['maybe' as const, [false, false, true]],
  ])('marks the answer %s', (answer, expected) => {
    expect(toAttendanceChoices(answer).map((choice) => choice.selected)).toEqual(expected);
  });
});

describe('toEntryMetaLine', () => {
  it('names the time and the kind of a bare entry', () => {
    expect(toEntryMetaLine(entry({}))).toBe('ab 19:00 Uhr · Auftritt · Verein');
  });

  it('appends the venue when the entry has one', () => {
    expect(toEntryMetaLine(entry({ venueName: 'Stadthalle' }))).toBe(
      'ab 19:00 Uhr · Auftritt · Stadthalle · Verein',
    );
  });

  it('names the owning group instead of the club and says nothing about a group-only reach', () => {
    expect(
      toEntryMetaLine(
        entry({
          endsAt: at(2026, 2, 14, 23),
          kind: 'rehearsal',
          venueName: 'Probenraum',
          ownerGroupId: 3,
          ownerGroupName: 'Garde',
          visibility: 'group',
        }),
      ),
    ).toBe('19:00 – 23:00 Uhr · Probe · Probenraum · Garde');
  });

  it('spells out the reach when a group entry is open to the whole club', () => {
    expect(
      toEntryMetaLine(entry({ ownerGroupId: 3, ownerGroupName: 'Garde', visibility: 'club' })),
    ).toBe('ab 19:00 Uhr · Auftritt · Garde · für alle im Verein');
  });

  it.each([
    [null, 'ab 19:00 Uhr · Auftritt · Verein · öffentlich'],
    ['Garde', 'ab 19:00 Uhr · Auftritt · Garde · öffentlich'],
  ])('marks a public entry owned by %s', (ownerGroupName, expected) => {
    expect(
      toEntryMetaLine(
        entry({
          ownerGroupId: ownerGroupName === null ? null : 3,
          ownerGroupName,
          visibility: 'public',
        }),
      ),
    ).toBe(expected);
  });
});

describe('toScopeOptions', () => {
  it('counts everything, the club-owned entries and every owning group once', () => {
    const options = toScopeOptions([
      entry({ calendarEntryId: 1 }),
      entry({ calendarEntryId: 2 }),
      entry({ calendarEntryId: 3, ownerGroupId: 3, ownerGroupName: 'Garde' }),
      entry({ calendarEntryId: 4, ownerGroupId: 3, ownerGroupName: 'Garde' }),
      entry({ calendarEntryId: 5, ownerGroupId: 1, ownerGroupName: 'Elferrat' }),
    ]);

    expect(options).toEqual([
      { id: 'all', label: 'Alle', count: 5 },
      { id: 'club', label: 'Verein', count: 2 },
      { id: 'group-1', label: 'Elferrat', count: 1 },
      { id: 'group-3', label: 'Garde', count: 2 },
    ]);
  });

  it('offers no group chip when nothing in the window belongs to a group', () => {
    expect(toScopeOptions([entry({})]).map((option) => option.id)).toEqual(['all', 'club']);
  });
});
