import { describe, expect, it } from 'vitest';
import type { ArchivePlan, RunningTie } from './person-archive';
import {
  toArchivePlan,
  toLastDayVerdict,
  toMembershipArchiveEffect,
  toRunningTies,
} from './person-archive';
import type { PersonMembership, PersonPause } from './schemas';

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
    { isArchived: true, endedOn: TODAY, expected: 'lifted' },
    { isArchived: true, endedOn: '2026-10-06', expected: 'refused' },
  ])(
    'answers $expected for archived $isArchived ending $endedOn',
    ({ isArchived, endedOn, expected }) => {
      expect(toMembershipArchiveEffect(isArchived, endedOn, TODAY)).toBe(expected);
    },
  );
});

const pause = (firstSessionYear: number, lastSessionYear: number | null): PersonPause => ({
  pauseId: firstSessionYear,
  firstSessionYear,
  lastSessionYear,
});

const runningMembership = (startedOn: string, pauses: PersonPause[]): PersonMembership => ({
  membershipId: 2,
  startedOn,
  endedOn: null,
  isRunning: true,
  isFuture: false,
  pauses,
  admission: null,
});

const unarchived = { ...untied, unendedTiesUnderArchivedParents: [] };

describe('toArchivePlan', () => {
  it('ends what began before today and deletes what begins today or later', () => {
    const plan = toArchivePlan(
      {
        ...unarchived,
        memberships: [runningMembership('2019-09-01', [])],
        groups: [
          { groupId: 1, name: 'Garde', joinedOn: '2026-10-01', leftOn: null },
          { groupId: 2, name: 'Prinzengarde', joinedOn: TODAY, leftOn: null },
          { groupId: 3, name: 'Elferrat', joinedOn: '2010-01-01', leftOn: '2012-01-01' },
        ],
        unendedKeyHoldings: [{ venueId: 4, name: 'Lager', sinceOn: '2026-12-01', untilOn: null }],
        unendedTiesUnderArchivedParents: [
          { kind: 'role', name: 'Kassenprüfung', sinceOn: '2024-01-01' },
        ],
      },
      TODAY,
      '2026-10-06',
    );

    expect(plan.ends).toEqual([
      { kind: 'membership', name: null, startsOn: '2019-09-01' },
      { kind: 'group', name: 'Garde', startsOn: '2026-10-01' },
      { kind: 'role', name: 'Kassenprüfung', startsOn: '2024-01-01' },
    ]);
    expect(plan.deletes).toEqual([
      { kind: 'group', name: 'Prinzengarde', startsOn: TODAY },
      { kind: 'keyHolding', name: 'Lager', startsOn: '2026-12-01' },
    ]);
    expect(plan.earliestLastDay).toBe('2026-10-01');
    expect(plan.limitingTie).toEqual({ kind: 'group', name: 'Garde', startsOn: '2026-10-01' });
  });

  it.each<{
    case: string;
    pauses: PersonPause[];
    cut: { firstSessionYear: number; lastSessionYear: number | null }[];
    deleted: { firstSessionYear: number; lastSessionYear: number | null }[];
  }>([
    {
      case: 'an open pause is cut to the last day session',
      pauses: [pause(2024, null)],
      cut: [{ firstSessionYear: 2024, lastSessionYear: 2025 }],
      deleted: [],
    },
    {
      case: 'a pause wholly in a later session is deleted',
      pauses: [pause(2026, 2027)],
      cut: [],
      deleted: [{ firstSessionYear: 2026, lastSessionYear: 2027 }],
    },
  ])('$case', ({ pauses, cut, deleted }) => {
    const plan = toArchivePlan(
      { ...unarchived, memberships: [runningMembership('2019-09-01', pauses)] },
      TODAY,
      '2026-10-06',
    );

    expect(plan.cutPauses).toEqual(cut);
    expect(plan.deletedPauses).toEqual(deleted);
  });

  it('deletes a membership dated ahead without touching its pauses', () => {
    const plan = toArchivePlan(
      { ...unarchived, memberships: [runningMembership('2026-12-01', [pause(2026, null)])] },
      TODAY,
      '2026-10-06',
    );

    expect(plan.ends).toEqual([]);
    expect(plan.deletes).toEqual([{ kind: 'membership', name: null, startsOn: '2026-12-01' }]);
    expect(plan.cutPauses).toEqual([]);
    expect(plan.deletedPauses).toEqual([]);
    expect(plan.earliestLastDay).toBeNull();
  });
});

describe('toArchivePlan edges', () => {
  it.each<{ case: string; lastDay: string | null; cut: number; deleted: number }>([
    {
      case: 'a last day before 11.11. keeps the next session',
      lastDay: '2026-11-10',
      cut: 0,
      deleted: 1,
    },
    {
      case: 'a last day on 11.11. reaches the next session',
      lastDay: '2026-11-11',
      cut: 1,
      deleted: 0,
    },
  ])('$case', ({ lastDay, cut, deleted }) => {
    const plan = toArchivePlan(
      { ...unarchived, memberships: [runningMembership('2019-09-01', [pause(2026, null)])] },
      '2026-11-19',
      lastDay,
    );

    expect(plan.cutPauses).toHaveLength(cut);
    expect(plan.deletedPauses).toHaveLength(deleted);
  });

  it('ends a tie already ending later and deletes an ahead tie under an archived parent', () => {
    const plan = toArchivePlan(
      {
        ...unarchived,
        roles: [{ roleId: 1, name: 'Kassenprüfung', sinceOn: '2024-01-01', untilOn: '2027-01-01' }],
        unendedTiesUnderArchivedParents: [
          { kind: 'boardSeat', name: 'Beisitz', sinceOn: '2026-12-01' },
        ],
      },
      TODAY,
      '2026-10-06',
    );

    expect(plan.ends).toEqual([{ kind: 'role', name: 'Kassenprüfung', startsOn: '2024-01-01' }]);
    expect(plan.deletes).toEqual([{ kind: 'boardSeat', name: 'Beisitz', startsOn: '2026-12-01' }]);
  });
});

describe('toLastDayVerdict', () => {
  const plan: ArchivePlan = {
    ends: [{ kind: 'group', name: 'Garde', startsOn: '2026-10-01' }],
    cutPauses: [],
    deletes: [],
    deletedPauses: [],
    earliestLastDay: '2026-10-01',
    limitingTie: { kind: 'group', name: 'Garde', startsOn: '2026-10-01' },
  };

  it.each<{ lastDay: string | null; expected: string }>([
    { lastDay: null, expected: 'missing' },
    { lastDay: TODAY, expected: 'tooLate' },
    { lastDay: '2026-09-30', expected: 'beforeStart' },
    { lastDay: '2026-10-01', expected: 'fine' },
  ])('answers $expected for $lastDay', ({ lastDay, expected }) => {
    expect(toLastDayVerdict(lastDay, plan, TODAY)).toBe(expected);
  });
});
