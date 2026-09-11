import { formatPeriod } from '@/lib/membership-labels';
import type { HubAdmin, HubDetails, HubMember } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const HUB_TITLE_FALLBACK = 'Meine Gruppe';
const COUNT_SEPARATOR = ' · ';

const MEMBER_EYEBROW = 'du bist hier dabei';
const ADMIN_EYEBROW = 'du bist Gruppen-Admin';

export const HUB_SECTION_TITLES = {
  about: 'Die Gruppe',
  members: 'Wer ist dabei',
  admins: 'Gruppen-Admins',
  history: 'Geschichte',
  events: 'Termine',
  photos: 'Bilder',
} as const;

export const toHubId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toPeopleCountLabel = (count: number): string => {
  if (count === 0) {
    return 'niemand dabei';
  }
  if (count === 1) {
    return '1 Person dabei';
  }

  return `${count} Personen dabei`;
};

export const toAdminCountLabel = (count: number): string => {
  if (count === 0) {
    return 'kein Gruppen-Admin';
  }
  if (count === 1) {
    return '1 Gruppen-Admin';
  }

  return `${count} Gruppen-Admins`;
};

export interface HubHeadline {
  title: string;
  eyebrow: string | null;
  countLine: string | null;
}

export const toHubHeadline = (hub: HubDetails | undefined): HubHeadline => {
  if (hub === undefined) {
    return { title: HUB_TITLE_FALLBACK, eyebrow: null, countLine: null };
  }

  const counts = [toPeopleCountLabel(hub.members.length), toAdminCountLabel(hub.admins.length)];

  return {
    title: hub.name,
    eyebrow: hub.viewerIsAdmin ? ADMIN_EYEBROW : MEMBER_EYEBROW,
    countLine: counts.join(COUNT_SEPARATOR),
  };
};

export type HubHistoryKind = 'membership' | 'admin';

export interface HubHistoryEntry {
  key: string;
  title: string;
  span: string;
  kind: HubHistoryKind;
  meta?: string;
}

interface DatedHistoryEntry extends HubHistoryEntry {
  startedOn: string;
}

const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

const toPastMemberEntry = (member: HubMember): DatedHistoryEntry => ({
  key: `membership-${member.groupMembershipId}`,
  title: toPersonName(member),
  span: formatPeriod(member.joinedOn, member.leftOn),
  kind: 'membership',
  startedOn: member.joinedOn,
});

const toPastAdminEntry = (admin: HubAdmin): DatedHistoryEntry => ({
  key: `admin-${admin.groupAdminId}`,
  title: toPersonName(admin),
  span: formatPeriod(admin.sinceOn, admin.untilOn),
  kind: 'admin',
  meta: admin.function ?? undefined,
  startedOn: admin.sinceOn,
});

const byNewestStart = (left: DatedHistoryEntry, right: DatedHistoryEntry): number => {
  if (left.startedOn !== right.startedOn) {
    return left.startedOn < right.startedOn ? 1 : -1;
  }

  return left.key.localeCompare(right.key);
};

export const toHistoryEntries = (
  pastMembers: readonly HubMember[],
  pastAdmins: readonly HubAdmin[],
): HubHistoryEntry[] => {
  const dated = [...pastMembers.map(toPastMemberEntry), ...pastAdmins.map(toPastAdminEntry)];

  return dated
    .sort(byNewestStart)
    .map(({ key, title, span, kind, meta }) => ({ key, title, span, kind, meta }));
};

export const toNoMembersLine = (name: string): string =>
  `In ${name} ist gerade niemand eingetragen.`;

export const toNoDescriptionLine = (name: string): string =>
  `Zu ${name} steht noch nichts geschrieben.`;

export const NO_ADMINS_LINE = 'Für diese Gruppe ist gerade niemand als Gruppen-Admin eingetragen.';
