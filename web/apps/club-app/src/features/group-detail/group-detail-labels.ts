import { formatPeriod } from '@/lib/membership-labels';
import type { GroupDetailAdmin, GroupDetailMember } from './schemas';

export type GroupHistoryKind = 'membership' | 'admin';

export interface GroupHistoryEntry {
  key: string;
  title: string;
  span: string;
  kind: GroupHistoryKind;
  meta?: string;
}

interface DatedGroupHistoryEntry extends GroupHistoryEntry {
  startedOn: string;
}

const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

const toPastMemberEntry = (member: GroupDetailMember): DatedGroupHistoryEntry => ({
  key: `membership-${member.groupMembershipId}`,
  title: toPersonName(member),
  span: formatPeriod(member.joinedOn, member.leftOn),
  kind: 'membership',
  startedOn: member.joinedOn,
});

const toPastAdminEntry = (admin: GroupDetailAdmin): DatedGroupHistoryEntry => ({
  key: `admin-${admin.groupAdminId}`,
  title: toPersonName(admin),
  span: formatPeriod(admin.sinceOn, admin.untilOn),
  kind: 'admin',
  meta: admin.function ?? undefined,
  startedOn: admin.sinceOn,
});

const byNewestStart = (left: DatedGroupHistoryEntry, right: DatedGroupHistoryEntry): number => {
  if (left.startedOn !== right.startedOn) {
    return left.startedOn < right.startedOn ? 1 : -1;
  }

  return left.key.localeCompare(right.key);
};

export const toGroupHistoryEntries = (
  pastMembers: readonly GroupDetailMember[],
  pastAdmins: readonly GroupDetailAdmin[],
): GroupHistoryEntry[] => {
  const dated = [...pastMembers.map(toPastMemberEntry), ...pastAdmins.map(toPastAdminEntry)];

  return dated
    .sort(byNewestStart)
    .map(({ key, title, span, kind, meta }) => ({ key, title, span, kind, meta }));
};

export const GROUP_HISTORY_KIND_LABELS: Record<GroupHistoryKind, string> = {
  membership: 'Zugehörigkeit',
  admin: 'Gruppen-Admin',
};

export const SINCE_LABEL = 'seit';

export const ADD_MEMBER_LABEL = 'Mitglied';
export const ADD_MEMBER_ACTION_LABEL = 'Mitglied aufnehmen';

export const NO_MEMBERS_TITLE = 'NOCH NIEMAND DABEI';
export const NO_ADMINS_TITLE = 'KEIN GRUPPEN-ADMIN';
export const NO_HISTORY_TITLE = 'NOCH KEINE GESCHICHTE';
export const NO_HISTORY_LINE = 'Beendete Zugehörigkeiten und frühere Gruppen-Admins stehen hier.';

const ADD_ANYONE_INVITE = 'Du kannst jede Person aus dem Register aufnehmen.';

export const toNoMembersLine = (groupName: string, canManage: boolean): string => {
  const line = `In ${groupName} ist gerade niemand eingetragen.`;

  return canManage ? `${line} ${ADD_ANYONE_INVITE}` : line;
};

export const toNoDescriptionLine = (groupName: string): string =>
  `Zu ${groupName} steht noch nichts geschrieben.`;
