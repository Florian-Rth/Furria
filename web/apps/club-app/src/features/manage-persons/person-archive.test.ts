import { describe, expect, it } from 'vitest';
import type { RunningTie } from './person-archive';
import {
  toArchiveNote,
  toMembershipArchiveEffect,
  toRunningTies,
  toRunningTiesList,
} from './person-archive';
import type { PersonMembership } from './schemas';

const TODAY = '2026-10-07';

const membership = (endedOn: string | null): PersonMembership => ({
  membershipId: 1,
  startedOn: '2019-09-01',
  endedOn,
  isRunning: false,
  isFuture: false,
  pauses: [],
  admission: null,
});

const untied = {
  memberships: [],
  groups: [],
  roles: [],
  unendedGroupAdminTenures: [],
  unendedBoardSeats: [],
  unendedKeyHoldings: [],
};

describe('toRunningTies', () => {
  it.each<{ case: string; endedOn: string | null; expected: RunningTie[] }>([
    { case: 'an open membership', endedOn: null, expected: [{ kind: 'membership' }] },
    { case: 'a membership ending today', endedOn: TODAY, expected: [{ kind: 'membership' }] },
    {
      case: 'a membership ending later',
      endedOn: '2027-03-31',
      expected: [{ kind: 'membership' }],
    },
    { case: 'a membership ended yesterday', endedOn: '2026-10-06', expected: [] },
  ])('counts $case once', ({ endedOn, expected }) => {
    const ties = toRunningTies(
      { ...untied, memberships: [membership('2015-01-01'), membership(endedOn)] },
      TODAY,
    );

    expect(ties).toEqual(expected);
  });

  it('names every unended tie in the club order, each name once per kind', () => {
    const ties = toRunningTies(
      {
        memberships: [membership(null)],
        groups: [
          { groupId: 1, name: 'Elferrat', joinedOn: '2010-01-01', leftOn: '2012-01-01' },
          { groupId: 2, name: 'Tanzgarde', joinedOn: '2020-01-01', leftOn: null },
          { groupId: 2, name: 'Tanzgarde', joinedOn: '2027-01-01', leftOn: null },
          { groupId: 3, name: 'Zugteam', joinedOn: '2020-01-01', leftOn: TODAY },
        ],
        roles: [
          { roleId: 4, name: 'Kassenprüfung', sinceOn: '2024-01-01', untilOn: '2027-01-01' },
          { roleId: 5, name: 'Schriftführung', sinceOn: '2020-01-01', untilOn: '2025-01-01' },
        ],
        unendedGroupAdminTenures: [
          {
            groupId: 6,
            name: 'Jugendgarde',
            function: 'Trainerin',
            sinceOn: '2022-01-01',
            untilOn: null,
          },
        ],
        unendedBoardSeats: [
          { boardOfficeId: 7, name: 'Kassenwart', sinceOn: '2024-01-01', untilOn: null },
        ],
        unendedKeyHoldings: [
          { venueId: 8, name: 'Lager', sinceOn: '2024-01-01', untilOn: null },
          { venueId: 8, name: 'Lager', sinceOn: '2026-11-01', untilOn: null },
        ],
      },
      TODAY,
    );

    expect(ties).toEqual([
      { kind: 'membership' },
      { kind: 'group', name: 'Tanzgarde' },
      { kind: 'group', name: 'Zugteam' },
      { kind: 'role', name: 'Kassenprüfung' },
      { kind: 'groupAdmin', name: 'Jugendgarde' },
      { kind: 'boardSeat', name: 'Kassenwart' },
      { kind: 'keyHolding', name: 'Lager' },
    ]);
  });

  it('finds nothing running on a person whose every tie has ended', () => {
    expect(
      toRunningTies(
        {
          ...untied,
          memberships: [membership('2020-06-30')],
          groups: [{ groupId: 1, name: 'Elferrat', joinedOn: '2010-01-01', leftOn: '2020-06-30' }],
        },
        TODAY,
      ),
    ).toEqual([]);
  });
});

describe('toRunningTiesList', () => {
  it('writes the ties as one line in their order', () => {
    expect(
      toRunningTiesList([
        { kind: 'membership' },
        { kind: 'boardSeat', name: 'Kassenwart' },
        { kind: 'keyHolding', name: 'Lager' },
      ]),
    ).toBe('Mitgliedschaft · Vorstandssitz Kassenwart · Schlüssel Lager');
  });
});

describe('toArchiveNote', () => {
  const today = new Date(2026, 9, 20, 12, 0);

  it.each([
    {
      case: 'names the archiving person by first name',
      archivedBy: { personId: 4, firstName: 'Anna', lastName: 'Kessler' },
      archivedOn: '2026-10-07',
      expected: 'Archiviert von Anna am 7. Okt.',
    },
    {
      case: 'says "dir" when the viewer archived her',
      archivedBy: { personId: 9, firstName: 'Paula', lastName: 'Brendel' },
      archivedOn: '2026-10-07',
      expected: 'Archiviert von dir am 7. Okt.',
    },
    {
      case: 'names nobody when the actor is gone or was the managing login',
      archivedBy: null,
      archivedOn: '2025-12-31',
      expected: 'Archiviert am 31. Dez. 2025',
    },
  ])('$case', ({ archivedBy, archivedOn, expected }) => {
    expect(toArchiveNote({ archivedOn, archivedBy }, 9, today)).toBe(expected);
  });

  it('says nothing about a person who is not archived', () => {
    expect(toArchiveNote(null, 9, today)).toBeNull();
  });
});

describe('toMembershipArchiveEffect', () => {
  it.each([
    { isArchived: false, endedOn: '2020-01-01', expected: 'untouched' },
    { isArchived: false, endedOn: null, expected: 'untouched' },
    { isArchived: true, endedOn: null, expected: 'lifted' },
    { isArchived: true, endedOn: TODAY, expected: 'lifted' },
    { isArchived: true, endedOn: '2027-03-31', expected: 'lifted' },
    { isArchived: true, endedOn: '2026-10-06', expected: 'refused' },
  ])(
    'answers $expected for archived $isArchived ending $endedOn',
    ({ isArchived, endedOn, expected }) => {
      expect(toMembershipArchiveEffect(isArchived, endedOn, TODAY)).toBe(expected);
    },
  );
});
