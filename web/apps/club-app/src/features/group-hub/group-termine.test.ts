import { describe, expect, it } from 'vitest';
import {
  isOwnTermin,
  toTermineMark,
  toTermineMeta,
  toTermineWindow,
  toTerminMetaLine,
} from './group-termine';
import type { GroupCalendarEntry } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const anEntry = (overrides: Partial<GroupCalendarEntry>): GroupCalendarEntry => ({
  calendarEntryId: 1,
  title: 'Prunksitzung',
  startsAt: at(2027, 2, 6, 19),
  endsAt: at(2027, 2, 6, 23),
  kind: 'meeting',
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
  ...overrides,
});

describe('toTermineWindow', () => {
  it.each([
    [new Date(2027, 0, 1), '2027-01-01', '2027-06-30'],
    [new Date(2027, 11, 31), '2027-12-31', '2028-06-28'],
  ])('spans half a year from %s', (today, from, to) => {
    expect(toTermineWindow(today)).toEqual({ from, to });
  });
});

describe('isOwnTermin', () => {
  it.each([
    [7, 7, true],
    [8, 7, false],
    [null, 7, false],
  ])('reads owner %s against Gruppe %s as %s', (ownerGroupId, groupId, expected) => {
    expect(isOwnTermin(anEntry({ ownerGroupId }), groupId)).toBe(expected);
  });
});

describe('toTermineMark', () => {
  it('marks a running Termin', () => {
    expect(toTermineMark(anEntry({ isRunning: true, ownerGroupId: 7 }), 7)).toEqual({
      kind: 'running',
      label: 'läuft gerade',
    });
  });

  it('marks nothing on the Gruppes own Termin', () => {
    expect(toTermineMark(anEntry({ ownerGroupId: 7 }), 7)).toBeNull();
  });

  it('marks a club-owned Termin as a guest appearance', () => {
    expect(toTermineMark(anEntry({ ownerGroupId: null }), 7)).toEqual({
      kind: 'guestOfClub',
      label: 'Verein',
    });
  });

  it('carries the owning Gruppes stored tone', () => {
    expect(
      toTermineMark(
        anEntry({ ownerGroupId: 8, ownerGroupName: 'Kindergarde', ownerGroupTone: 'teal' }),
        7,
      ),
    ).toEqual({ kind: 'guestOfGroup', label: 'Kindergarde', tone: 'teal' });
  });

  it('falls back to a derived tone when the owning Gruppe picked none', () => {
    expect(
      toTermineMark(
        anEntry({ ownerGroupId: 8, ownerGroupName: 'Kindergarde', ownerGroupTone: null }),
        7,
      ),
    ).toEqual({ kind: 'guestOfGroup', label: 'Kindergarde', tone: expect.any(String) });
  });
});

describe('toTerminMetaLine', () => {
  it('names the Ort when the Termin carries one', () => {
    expect(
      toTerminMetaLine(anEntry({ venueId: 3, venueName: 'Bühnenhaus', kind: 'performance' }), 7),
    ).toBe('19:00 – 23:00 Uhr · Auftritt · Bühnenhaus');
  });

  it('leaves the Gruppe itself out of the mitwirkenden line', () => {
    expect(
      toTerminMetaLine(
        anEntry({
          participatingGroups: [
            { groupId: 7, name: 'Tanzgarde', tone: null },
            { groupId: 8, name: 'Kindergarde', tone: null },
          ],
        }),
        7,
      ),
    ).toBe('19:00 – 23:00 Uhr · Sitzung · mit Kindergarde');
  });

  it('names several mitwirkende Gruppen', () => {
    expect(
      toTerminMetaLine(
        anEntry({
          participatingGroups: [
            { groupId: 8, name: 'Kindergarde', tone: null },
            { groupId: 9, name: 'Männerballett', tone: null },
          ],
        }),
        7,
      ),
    ).toBe('19:00 – 23:00 Uhr · Sitzung · mit Kindergarde, Männerballett');
  });

  it('reads an open end', () => {
    expect(toTerminMetaLine(anEntry({ endsAt: null }), 7)).toBe('ab 19:00 Uhr · Sitzung');
  });
});

describe('toTermineMeta', () => {
  it.each([
    [0, 'nichts geplant'],
    [1, '1 Termin'],
    [4, '4 Termine'],
  ])('counts %i as %s', (count, expected) => {
    expect(toTermineMeta(count)).toBe(expected);
  });
});
