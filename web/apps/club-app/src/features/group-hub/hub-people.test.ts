import { describe, expect, it } from 'vitest';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import { countGroupAdmins, toHubPeople } from './hub-people';

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
  it('folds the Gruppen-Admin and her Zugehörigkeit into one entry', () => {
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

  it('puts every Gruppen-Admin ahead of the plain members', () => {
    const people = toHubPeople(
      [member({ personId: 1 }), member({ personId: 2, groupMembershipId: 12 })],
      [admin({ personId: 2, groupAdminId: 92 })],
    );

    expect(people.map((person) => person.personId)).toEqual([2, 1]);
  });

  it('keeps a Gruppen-Admin who dances in no row of the Gruppe', () => {
    const people = toHubPeople([], [admin({ personId: 7, groupAdminId: 97 })]);

    expect(people[0]).toMatchObject({ personId: 7, groupMembershipId: null, memberSince: null });
  });

  it('leaves a plain member without any Admin trace', () => {
    const people = toHubPeople([member({ personId: 3, groupMembershipId: 13 })], []);

    expect(people[0]).toMatchObject({ groupAdminId: null, adminSince: null, adminFunction: null });
  });
});

describe('countGroupAdmins', () => {
  it.each([
    { case: 'an empty Gruppe', members: [] as GroupDetailMember[], admins: [], expected: 0 },
    {
      case: 'a Gruppe without Admins',
      members: [member({})],
      admins: [] as GroupDetailAdmin[],
      expected: 0,
    },
    {
      case: 'a Gruppe whose only Admin dances along',
      members: [member({})],
      admins: [admin({})],
      expected: 1,
    },
    {
      case: 'a Gruppe led from outside',
      members: [member({ personId: 4, groupMembershipId: 14 })],
      admins: [admin({ personId: 5, groupAdminId: 95 })],
      expected: 1,
    },
  ])('counts the Admins of $case', ({ members, admins, expected }) => {
    expect(countGroupAdmins(toHubPeople(members, admins))).toBe(expected);
  });
});
