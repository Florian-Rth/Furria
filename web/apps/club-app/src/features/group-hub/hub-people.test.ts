import { describe, expect, it } from 'vitest';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import { countGroupAdmins, toHubPeople, toPrefillPerson } from './hub-people';

const member = (over: Partial<GroupDetailMember>): GroupDetailMember => ({
  personId: 1,
  firstName: 'Anna',
  lastName: 'Bauer',
  groupMembershipId: 11,
  joinedOn: '2016-11-11',
  leftOn: null,
  since: '2016-11-11',
  isAffiliated: true,
  ...over,
});

const admin = (over: Partial<GroupDetailAdmin>): GroupDetailAdmin => ({
  personId: 1,
  firstName: 'Anna',
  lastName: 'Bauer',
  groupAdminId: 91,
  function: 'Trainerin',
  sinceOn: '2020-11-11',
  untilOn: null,
  since: '2020-11-11',
  isAffiliated: true,
  ...over,
});

describe('toHubPeople', () => {
  it('folds the group admin and her group membership into one entry', () => {
    const people = toHubPeople([member({})], [admin({})]);

    expect(people).toEqual([
      {
        personId: 1,
        firstName: 'Anna',
        lastName: 'Bauer',
        isAffiliated: true,
        groupMembershipId: 11,
        memberSince: '2016-11-11',
        groupAdminId: 91,
        adminSince: '2020-11-11',
        adminFunction: 'Trainerin',
      },
    ]);
  });

  it('puts every group admin ahead of the plain members', () => {
    const people = toHubPeople(
      [member({ personId: 1 }), member({ personId: 2, groupMembershipId: 12 })],
      [admin({ personId: 2, groupAdminId: 92 })],
    );

    expect(people.map((person) => person.personId)).toEqual([2, 1]);
  });

  it('keeps a group admin who dances in no row of the group', () => {
    const people = toHubPeople([], [admin({ personId: 7, groupAdminId: 97 })]);

    expect(people[0]).toMatchObject({ personId: 7, groupMembershipId: null, memberSince: null });
  });

  it('leaves a plain member without any admin trace', () => {
    const people = toHubPeople([member({ personId: 3, groupMembershipId: 13 })], []);

    expect(people[0]).toMatchObject({ groupAdminId: null, adminSince: null, adminFunction: null });
  });
});

describe('countGroupAdmins', () => {
  it.each([
    { case: 'an empty group', members: [] as GroupDetailMember[], admins: [], expected: 0 },
    {
      case: 'a group without admins',
      members: [member({})],
      admins: [] as GroupDetailAdmin[],
      expected: 0,
    },
    {
      case: 'a group whose only admin dances along',
      members: [member({})],
      admins: [admin({})],
      expected: 1,
    },
    {
      case: 'a group led from outside',
      members: [member({ personId: 4, groupMembershipId: 14 })],
      admins: [admin({ personId: 5, groupAdminId: 95 })],
      expected: 1,
    },
  ])('counts the admins of $case', ({ members, admins, expected }) => {
    expect(countGroupAdmins(toHubPeople(members, admins))).toBe(expected);
  });
});

describe('toPrefillPerson', () => {
  it('returns null without a person id', () => {
    expect(toPrefillPerson(toHubPeople([member({})], []), null)).toBeNull();
  });

  it('returns null when nobody in the group matches the id', () => {
    expect(toPrefillPerson(toHubPeople([member({})], []), 999)).toBeNull();
  });

  it('resolves a name from the group her people already carry', () => {
    const people = toHubPeople([member({ personId: 4, groupMembershipId: 14 })], []);

    expect(toPrefillPerson(people, 4)).toEqual({
      personId: 4,
      firstName: 'Anna',
      lastName: 'Bauer',
    });
  });
});
