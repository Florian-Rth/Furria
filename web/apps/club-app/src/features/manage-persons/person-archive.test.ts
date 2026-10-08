import { describe, expect, it } from 'vitest';
import type { RunningTie } from './person-archive';
import { toMembershipArchiveEffect, toRunningTies } from './person-archive';
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
});

describe('toMembershipArchiveEffect', () => {
  it.each([
    { isArchived: false, endedOn: '2020-01-01', expected: 'untouched' },
    { isArchived: true, endedOn: null, expected: 'lifted' },
    { isArchived: true, endedOn: TODAY, expected: 'lifted' },
    { isArchived: true, endedOn: '2026-10-06', expected: 'refused' },
  ])(
    'answers $expected for archived $isArchived ending $endedOn',
    ({ isArchived, endedOn, expected }) => {
      expect(toMembershipArchiveEffect(isArchived, endedOn, TODAY)).toBe(expected);
    },
  );
});
