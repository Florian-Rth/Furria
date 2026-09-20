import type { KkFilterOption } from '@furria/ui';
import type { PersonRef } from '@/lib/api/schemas';
import type { StateChip } from '@/lib/state-chips';
import { GROUP_ADMIN_CHIP, MY_GROUP_CHIP, toRecruitingChip } from '@/lib/state-chips';
import { normalizeForSearch } from '@/lib/text';
import type { GroupSummary } from './schemas';

export const MY_GROUPS_SECTION_TITLE = 'Meine Gruppen';
export const OTHER_GROUPS_SECTION_TITLE = 'Alle Gruppen';

const MY_GROUPS_SECTION_ID = 'mine';
const OTHER_GROUPS_SECTION_ID = 'rest';
const ONE_LIST_SECTION_ID = 'all';

export interface GroupsSection {
  readonly id: string;
  readonly title: string | null;
  readonly groups: readonly GroupSummary[];
}

const isMyGroup = (group: GroupSummary): boolean => group.viewerIsMember || group.viewerIsAdmin;

export const toGroupsSections = (groups: readonly GroupSummary[]): readonly GroupsSection[] => {
  if (groups.length === 0) {
    return [];
  }

  const mine = groups.filter(isMyGroup);

  if (mine.length === 0) {
    return [{ id: ONE_LIST_SECTION_ID, title: null, groups }];
  }
  if (mine.length === groups.length) {
    return [{ id: MY_GROUPS_SECTION_ID, title: MY_GROUPS_SECTION_TITLE, groups }];
  }

  return [
    { id: MY_GROUPS_SECTION_ID, title: MY_GROUPS_SECTION_TITLE, groups: mine },
    {
      id: OTHER_GROUPS_SECTION_ID,
      title: OTHER_GROUPS_SECTION_TITLE,
      groups: groups.filter((group) => !isMyGroup(group)),
    },
  ];
};

export const toGroupStandingChips = (group: GroupSummary): StateChip[] => {
  const chips: StateChip[] = [];

  if (group.viewerIsMember) {
    chips.push(MY_GROUP_CHIP);
  }
  if (group.viewerIsAdmin) {
    chips.push(GROUP_ADMIN_CHIP);
  }

  return chips;
};

export const toGroupCardChips = (group: GroupSummary): StateChip[] => {
  const chips: StateChip[] = [];

  if (group.isRecruiting) {
    chips.push(toRecruitingChip(true));
  }
  if (group.viewerIsAdmin) {
    chips.push(GROUP_ADMIN_CHIP);
  }

  return chips;
};

const GROUP_KIND_FALLBACK = 'Gruppe';

export const toGroupKindLabel = (groupKindName: string | null): string =>
  groupKindName === null || groupKindName.trim() === '' ? GROUP_KIND_FALLBACK : groupKindName;

const LED_BY_PREFIX = 'Geleitet von ';
const LED_BY_PAIR = ' und ';
const NO_LEAD_LINE = 'Noch ohne Gruppen-Admin';
const FURTHER_LEADS_SUFFIX = ' weitere';
const NAMED_LEAD = 1;

const toFullName = (person: PersonRef): string => `${person.firstName} ${person.lastName}`;

export const toGroupLeadLine = (admins: readonly PersonRef[]): string => {
  const [first, second, ...further] = admins;

  if (first === undefined) {
    return NO_LEAD_LINE;
  }
  if (second === undefined) {
    return `${LED_BY_PREFIX}${toFullName(first)}`;
  }
  if (further.length === 0) {
    return `${LED_BY_PREFIX}${toFullName(first)}${LED_BY_PAIR}${toFullName(second)}`;
  }

  const rest = further.length + NAMED_LEAD;

  return `${LED_BY_PREFIX}${toFullName(first)}${LED_BY_PAIR}${rest}${FURTHER_LEADS_SUFFIX}`;
};

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

export const toGroupContactLine = (group: GroupSummary): string =>
  group.isRecruiting ? toRecruitingContactLine(group.admins) : toGroupLeadLine(group.admins);

const CARD_LABEL_SUFFIX = ' – Kurzansicht öffnen';

export const toGroupCardLabel = (name: string): string => `${name}${CARD_LABEL_SUFFIX}`;

export const GROUP_PEEK_CLOSE_LABEL = 'Kurzansicht schließen';
export const GROUP_PEEK_OPEN_LABEL = 'Ganze Seite öffnen';
export const toGroupSizeLine = (count: number): string => `${count} ${toPersonUnitLabel(count)}`;

const ONE_GROUP_LABEL = '1 Gruppe';
const GROUP_UNIT_LABEL = 'Gruppen';
const ONE_GROUP = 1;

export const toGroupCountLabel = (count: number): string =>
  count === ONE_GROUP ? ONE_GROUP_LABEL : `${count} ${GROUP_UNIT_LABEL}`;

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

export const toGroupsLead = (groups: readonly GroupSummary[]): string =>
  toGroupsIntroSentence(groups.length, groups.filter((group) => group.isRecruiting).length);
