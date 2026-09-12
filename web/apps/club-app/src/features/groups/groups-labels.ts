import type { MyGroupSummary } from '@/features/group-hub';
import type { PersonRef } from '@/lib/api/schemas';
import {
  GROUP_SECTION_TITLES as SHARED_GROUP_SECTION_TITLES,
  toGroupSubline,
} from '@/lib/group-sections';
import type { StateChip } from '@/lib/state-chips';
import { GROUP_ADMIN_CHIP, MY_GROUP_CHIP, toRecruitingChip } from '@/lib/state-chips';
import type { GroupDetails } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const GROUP_TITLE_FALLBACK = 'Gruppe';

export const GROUP_SECTION_TITLES = {
  about: SHARED_GROUP_SECTION_TITLES.about,
  members: SHARED_GROUP_SECTION_TITLES.members,
  admins: SHARED_GROUP_SECTION_TITLES.admins,
  events: SHARED_GROUP_SECTION_TITLES.events,
  photos: SHARED_GROUP_SECTION_TITLES.photos,
} as const;

export const RESERVED_BADGE = 'bald';

export const EVENTS_RESERVED = {
  title: 'Noch nicht da',
  description:
    'Training, Proben und Auftritte der Gruppe an einem Ort. Kommt in einer späteren Phase.',
} as const;

export const PHOTOS_RESERVED = {
  title: 'Noch keine Bilder',
  description:
    'Platz für ein paar Bilder aus vergangenen Sessions. Die Bildergalerie liefert sie später automatisch — hier wird nichts hochgeladen.',
} as const;

export interface GroupStanding {
  isMember: boolean;
  isAdmin: boolean;
}

export const toGroupStandings = (groups: readonly MyGroupSummary[]): Map<number, GroupStanding> =>
  new Map(
    groups.map((group) => [group.groupId, { isMember: group.isMember, isAdmin: group.isAdmin }]),
  );

export const toGroupStandingChips = (standing: GroupStanding | undefined): StateChip[] => {
  if (standing === undefined) {
    return [];
  }

  const chips: StateChip[] = [];

  if (standing.isMember) {
    chips.push(MY_GROUP_CHIP);
  }
  if (standing.isAdmin) {
    chips.push(GROUP_ADMIN_CHIP);
  }

  return chips;
};

export const toGroupId = (raw: string): number | null =>
  GROUP_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toPersonUnitLabel = (count: number): string => (count === 1 ? 'Person' : 'Personen');

export interface RecruitingContactTextSegment {
  kind: 'text';
  text: string;
}

export interface RecruitingContactPersonSegment {
  kind: 'person';
  personId: number;
  firstName: string;
}

export type RecruitingContactSegment =
  | RecruitingContactTextSegment
  | RecruitingContactPersonSegment;

const text = (value: string): RecruitingContactTextSegment => ({ kind: 'text', text: value });

const name = (person: PersonRef): RecruitingContactPersonSegment => ({
  kind: 'person',
  personId: person.personId,
  firstName: person.firstName,
});

const CONTACT_OPENING = 'Melde dich bei ';
const NO_CONTACT_LINE = 'Diese Gruppe sucht noch eine Ansprechperson.';

export const toRecruitingContactSegments = (
  admins: readonly PersonRef[],
): RecruitingContactSegment[] => {
  const [first, second, ...further] = admins;

  if (first === undefined) {
    return [text(NO_CONTACT_LINE)];
  }
  if (second === undefined) {
    return [text(CONTACT_OPENING), name(first), text('.')];
  }
  if (further.length === 0) {
    return [text(CONTACT_OPENING), name(first), text(' oder '), name(second), text('.')];
  }

  return [
    text(CONTACT_OPENING),
    name(first),
    text(', '),
    name(second),
    text(' oder einer der anderen Gruppen-Admins.'),
  ];
};

const toSegmentText = (segment: RecruitingContactSegment): string =>
  segment.kind === 'text' ? segment.text : segment.firstName;

export const toRecruitingContactLine = (admins: readonly PersonRef[]): string =>
  toRecruitingContactSegments(admins).map(toSegmentText).join('');

export const GROUPS_SECTION_TITLE = 'Alle Gruppen';

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

export const GROUP_EYEBROW = 'Gruppe';

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
