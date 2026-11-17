import { describe, expect, it } from 'vitest';
import type { CalendarEntryKind } from '@/features/club/schemas';
import type { CalendarAudienceReach } from './calendar-audience-reach';
import {
  toAudienceReach,
  toOfferedAudiences,
  toReachablePeople,
  toReachablePool,
} from './calendar-audience-reach';
import type { CalendarEntryAudience } from './schemas';

const CLUB: CalendarAudienceReach = { scope: 'club' };
const EVERY_GROUP: CalendarAudienceReach = { scope: 'everyGroup' };
const TANZGARDE_ONLY: CalendarAudienceReach = { scope: 'ownGroups', groupIds: [1] };

describe('toAudienceReach', () => {
  const groups = [
    { groupId: 1, name: 'Tanzgarde', isMember: false, isAdmin: true },
    { groupId: 2, name: 'Showtanz', isMember: true, isAdmin: false },
  ];

  it.each([
    [true, true, CLUB],
    [true, false, CLUB],
    [false, true, EVERY_GROUP],
    [false, false, TANZGARDE_ONLY],
  ])('club calendar %s, groups %s → %o', (managesClubCalendar, managesGroups, expected) => {
    expect(toAudienceReach({ managesClubCalendar, managesGroups }, groups)).toEqual(expected);
  });
});

describe('toOfferedAudiences', () => {
  it.each<
    [
      CalendarAudienceReach,
      CalendarEntryAudience | null,
      CalendarEntryKind,
      CalendarEntryAudience[],
    ]
  >([
    [CLUB, null, 'plain', ['club', 'groups', 'people']],
    [TANZGARDE_ONLY, null, 'plain', ['groups', 'people']],
    [EVERY_GROUP, 'groups', 'trip', ['groups', 'people']],
    [TANZGARDE_ONLY, 'club', 'plain', ['club', 'groups', 'people']],
    [CLUB, null, 'training', ['groups', 'people']],
    [CLUB, 'club', 'training', ['groups', 'people']],
  ])('%o holding %s for a %s → %o', (reach, held, kind, expected) => {
    expect(toOfferedAudiences(reach, held, kind)).toEqual(expected);
  });
});

describe('toReachablePool', () => {
  const pool = {
    state: 'ready',
    groups: [
      { groupId: 1, name: 'Tanzgarde' },
      { groupId: 2, name: 'Showtanz' },
    ],
  } as const;

  it.each<[CalendarAudienceReach, number[]]>([
    [CLUB, [1, 2]],
    [EVERY_GROUP, [1, 2]],
    [TANZGARDE_ONLY, [1]],
  ])('%o → %o', (reach, expected) => {
    const reachable = toReachablePool(pool, reach);

    expect(
      reachable.state === 'ready' ? reachable.groups.map((group) => group.groupId) : [],
    ).toEqual(expected);
  });

  it('keeps a failed pool failed', () => {
    expect(toReachablePool({ state: 'failed' }, TANZGARDE_ONLY)).toEqual({ state: 'failed' });
  });
});

describe('toReachablePeople', () => {
  const people = [
    { personId: 10, firstName: 'Tina', lastName: 'Tanz', groupIds: [1] },
    { personId: 11, firstName: 'Sven', lastName: 'Show', groupIds: [2] },
    { personId: 12, firstName: 'Mia', lastName: 'Mitglied', groupIds: [] },
  ];

  it.each<[CalendarAudienceReach, number[]]>([
    [CLUB, [10, 11, 12]],
    [EVERY_GROUP, [10, 11]],
    [TANZGARDE_ONLY, [10]],
  ])('%o → %o', (reach, expected) => {
    expect(toReachablePeople(people, reach).map((person) => person.personId)).toEqual(expected);
  });
});
