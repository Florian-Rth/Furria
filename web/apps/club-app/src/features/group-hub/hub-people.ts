import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import type { PersonRef } from '@/lib/api/schemas';

export interface HubPerson {
  personId: number;
  firstName: string;
  lastName: string;
  isAffiliated: boolean;
  groupMembershipId: number | null;
  memberSince: string | null;
  groupAdminId: number | null;
  adminSince: string | null;
  adminFunction: string | null;
}

const fromAdmin = (admin: GroupDetailAdmin, member: GroupDetailMember | null): HubPerson => ({
  personId: admin.personId,
  firstName: admin.firstName,
  lastName: admin.lastName,
  isAffiliated: admin.isAffiliated,
  groupMembershipId: member === null ? null : member.groupMembershipId,
  memberSince: member === null ? null : member.since,
  groupAdminId: admin.groupAdminId,
  adminSince: admin.since,
  adminFunction: admin.function,
});

const fromMember = (member: GroupDetailMember): HubPerson => ({
  personId: member.personId,
  firstName: member.firstName,
  lastName: member.lastName,
  isAffiliated: member.isAffiliated,
  groupMembershipId: member.groupMembershipId,
  memberSince: member.since,
  groupAdminId: null,
  adminSince: null,
  adminFunction: null,
});

export const toHubPeople = (
  members: readonly GroupDetailMember[],
  admins: readonly GroupDetailAdmin[],
): HubPerson[] => {
  const memberByPerson = new Map(members.map((member) => [member.personId, member]));
  const adminPersonIds = new Set(admins.map((admin) => admin.personId));

  const led = admins.map((admin) => fromAdmin(admin, memberByPerson.get(admin.personId) ?? null));
  const rest = members
    .filter((member) => !adminPersonIds.has(member.personId))
    .map((member) => fromMember(member));

  return [...led, ...rest];
};

export const countGroupAdmins = (people: readonly HubPerson[]): number =>
  people.filter((person) => person.groupAdminId !== null).length;

export const toPrefillPerson = (
  people: readonly HubPerson[],
  personId: number | null,
): PersonRef | null => {
  if (personId === null) {
    return null;
  }

  const found = people.find((person) => person.personId === personId);

  return found === undefined
    ? null
    : { personId: found.personId, firstName: found.firstName, lastName: found.lastName };
};
