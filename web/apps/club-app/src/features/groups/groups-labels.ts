import type { PersonRef } from '@/lib/api/schemas';
import {
  GROUP_SECTION_TITLES as SHARED_GROUP_SECTION_TITLES,
  toGroupSubline,
} from '@/lib/group-sections';
import type { StateChip } from '@/lib/state-chips';
import { toRecruitingChip } from '@/lib/state-chips';
import type { GroupDetails } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const GROUP_TITLE_FALLBACK = 'Gruppe';

export const GROUP_SECTION_TITLES = {
  about: 'Die Gruppe',
  members: SHARED_GROUP_SECTION_TITLES.members,
  admins: SHARED_GROUP_SECTION_TITLES.admins,
  photos: 'Bilder',
} as const;

export const toGroupId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toMemberCountLabel = (count: number): string => {
  if (count === 0) {
    return 'keine Mitglieder';
  }
  if (count === 1) {
    return '1 Person';
  }

  return `${count} Personen`;
};

export const toRecruitingContactLine = (admins: readonly PersonRef[]): string => {
  const [first, second, ...further] = admins;

  if (first === undefined) {
    return 'Diese Gruppe sucht noch eine Ansprechperson.';
  }
  if (second === undefined) {
    return `Melde dich bei ${first.firstName}.`;
  }
  if (further.length === 0) {
    return `Melde dich bei ${first.firstName} oder ${second.firstName}.`;
  }

  return `Melde dich bei ${first.firstName}, ${second.firstName} oder einer der anderen Gruppen-Admins.`;
};

export const toGroupsIntroSentence = (total: number, recruiting: number): string => {
  const groups =
    total === 1 ? 'Eine Gruppe trägt die Session.' : `${total} Gruppen tragen die Session.`;

  if (recruiting === 0) {
    return `${groups} Gerade sucht keine davon Verstärkung.`;
  }
  if (recruiting === 1) {
    return `${groups} Eine davon sucht gerade Verstärkung.`;
  }

  return `${groups} ${recruiting} davon suchen gerade Verstärkung.`;
};

export interface GroupHeadline {
  title: string;
  openness: StateChip | null;
  memberCount: string | null;
}

export const toGroupHeadline = (group: GroupDetails | undefined): GroupHeadline => {
  if (group === undefined) {
    return { title: GROUP_TITLE_FALLBACK, openness: null, memberCount: null };
  }

  return {
    title: group.name,
    openness: toRecruitingChip(group.isRecruiting),
    memberCount: toGroupSubline(group.members.length, group.admins.length),
  };
};

export const toNoMembersLine = (name: string): string =>
  `In ${name} tanzt und hilft gerade niemand mit.`;

export const NO_ADMINS_LINE = 'Für diese Gruppe ist gerade niemand als Gruppen-Admin eingetragen.';

export const toNoDescriptionLine = (name: string): string =>
  `Zu ${name} steht noch nichts geschrieben.`;
