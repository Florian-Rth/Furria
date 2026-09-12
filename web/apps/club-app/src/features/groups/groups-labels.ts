import type { KkFilterOption } from '@furria/ui';
import type { MyGroupSummary } from '@/features/group-hub';
import type { PersonRef } from '@/lib/api/schemas';
import { toGroupSubline } from '@/lib/group-sections';
import type { StateChip } from '@/lib/state-chips';
import { GROUP_ADMIN_CHIP, MY_GROUP_CHIP, toRecruitingChip } from '@/lib/state-chips';
import { normalizeForSearch } from '@/lib/text';
import type { GroupDetails, GroupSummary } from './schemas';

const GROUP_ID_PATTERN = /^[1-9]\d*$/;
const GROUP_TITLE_FALLBACK = 'Gruppe';

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
  lastName: string;
}

export type RecruitingContactSegment =
  | RecruitingContactTextSegment
  | RecruitingContactPersonSegment;

const text = (value: string): RecruitingContactTextSegment => ({ kind: 'text', text: value });

const name = (person: PersonRef): RecruitingContactPersonSegment => ({
  kind: 'person',
  personId: person.personId,
  firstName: person.firstName,
  lastName: person.lastName,
});

export const toContactPersonName = (segment: RecruitingContactPersonSegment): string =>
  `${segment.firstName} ${segment.lastName}`;

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
  segment.kind === 'text' ? segment.text : toContactPersonName(segment);

export const toRecruitingContactLine = (admins: readonly PersonRef[]): string =>
  toRecruitingContactSegments(admins).map(toSegmentText).join('');

export const GROUPS_SECTION_TITLE = 'Alle Gruppen';

export const ALL_GROUPS_FILTER_ID = 'all';
export const RECRUITING_FILTER_ID = 'recruiting';
export const SETTLED_FILTER_ID = 'settled';

const ALL_GROUPS_LABEL = 'Alle';
const ALL_GROUPS_SUGGESTION = 'Wähle „Alle“, um wieder alle zu sehen.';

const isRecruiting = (group: GroupSummary): boolean => group.isRecruiting;

export const toRecruitingFilterOptions = (groups: readonly GroupSummary[]): KkFilterOption[] => {
  const recruiting = groups.filter(isRecruiting).length;

  return [
    { id: ALL_GROUPS_FILTER_ID, label: ALL_GROUPS_LABEL, count: groups.length },
    { id: RECRUITING_FILTER_ID, label: toRecruitingChip(true).label, count: recruiting },
    {
      id: SETTLED_FILTER_ID,
      label: toRecruitingChip(false).label,
      count: groups.length - recruiting,
    },
  ];
};

export interface GroupsFilter {
  query: string;
  status: string;
}

const matchesGroupStatus = (group: GroupSummary, status: string): boolean => {
  if (status === RECRUITING_FILTER_ID) {
    return group.isRecruiting;
  }
  if (status === SETTLED_FILTER_ID) {
    return !group.isRecruiting;
  }

  return true;
};

export const filterGroups = (
  groups: readonly GroupSummary[],
  { query, status }: GroupsFilter,
): GroupSummary[] => {
  const needle = normalizeForSearch(query.trim());

  return groups.filter(
    (group) =>
      matchesGroupStatus(group, status) &&
      (needle === '' || normalizeForSearch(group.name).includes(needle)),
  );
};

const NO_GROUP_MATCH_LINES: Record<string, string> = {
  [RECRUITING_FILTER_ID]: 'Gerade sucht keine Gruppe Verstärkung.',
  [SETTLED_FILTER_ID]: 'Gerade sucht jede Gruppe im Verzeichnis Verstärkung.',
};

export const toNoGroupMatchLine = (query: string, status: string): string => {
  const needle = query.trim();

  if (needle !== '') {
    return `Kein Gruppenname passt zu „${needle}“. Vielleicht anders geschrieben?`;
  }

  const statusLine = NO_GROUP_MATCH_LINES[status];

  if (statusLine === undefined) {
    return 'Im Verzeichnis steht gerade keine Gruppe.';
  }

  return `${statusLine} ${ALL_GROUPS_SUGGESTION}`;
};

export const NO_GROUP_MATCH_TITLE = 'KEINE GRUPPE GEFUNDEN';

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
