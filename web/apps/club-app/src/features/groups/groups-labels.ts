import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import type { PersonRef } from '@/lib/api/schemas';
import { toRecruitingChip } from '@/lib/state-chips';
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

export const toGroupCardSignal = (group: GroupSummary): string | null =>
  group.isRecruiting ? toRecruitingChip(true).label : null;

export const toGroupKindLabel = (groupKindName: string | null): string | null => {
  if (groupKindName === null) {
    return null;
  }

  const named = groupKindName.trim();

  return named === '' ? null : named;
};

const NO_LEAD_LINE = 'Noch ohne Gruppen-Admin';

const toFullName = (person: PersonRef): string => `${person.firstName} ${person.lastName}`;

export type AdminRoster =
  | { kind: 'none' }
  | { kind: 'one'; first: PersonRef }
  | { kind: 'two'; first: PersonRef; second: PersonRef }
  | { kind: 'more'; first: PersonRef; second: PersonRef; furtherCount: number };

export const adminRosterOf = (admins: readonly PersonRef[]): AdminRoster => {
  const [first, second, ...further] = admins;

  if (first === undefined) {
    return { kind: 'none' };
  }
  if (second === undefined) {
    return { kind: 'one', first };
  }
  if (further.length === 0) {
    return { kind: 'two', first, second };
  }

  return { kind: 'more', first, second, furtherCount: further.length };
};

const LEAD_PREFIX = 'Leitung: ';
const LEAD_SEPARATOR = ', ';
const FURTHER_LEADS_MARK = ' +';

export const toShortName = (person: PersonRef): string => {
  const initial = person.firstName.trim().charAt(0);

  return initial === '' ? person.lastName : `${initial}. ${person.lastName}`;
};

export const toGroupCardLeadLine = (admins: readonly PersonRef[]): string => {
  const roster = adminRosterOf(admins);

  if (roster.kind === 'none') {
    return NO_LEAD_LINE;
  }
  if (roster.kind === 'one') {
    return `${LEAD_PREFIX}${toFullName(roster.first)}`;
  }

  const pair = `${toShortName(roster.first)}${LEAD_SEPARATOR}${toShortName(roster.second)}`;
  const further = roster.kind === 'more' ? `${FURTHER_LEADS_MARK}${roster.furtherCount}` : '';

  return `${LEAD_PREFIX}${pair}${further}`;
};

const META_SEPARATOR = ' · ';

export const toCardKindName = (name: string, groupKindName: string | null): string | null => {
  const kind = toGroupKindLabel(groupKindName);

  if (kind === null) {
    return null;
  }

  return normalizeForSearch(name).includes(normalizeForSearch(kind)) ? null : kind;
};

export const toPersonUnitLabel = (count: number): string => (count === 1 ? 'Person' : 'Personen');

export const toGroupSizeLine = (count: number): string => `${count} ${toPersonUnitLabel(count)}`;

export const toGroupCardSizeLine = (count: number, foundedLine: string | null): string =>
  foundedLine === null
    ? toGroupSizeLine(count)
    : `${toGroupSizeLine(count)}${META_SEPARATOR}${foundedLine}`;

export const ALL_GROUPS_FILTER_ID = 'all';
export const RECRUITING_FILTER_ID = 'recruiting';
export const SETTLED_FILTER_ID = 'settled';

const ALL_GROUPS_LABEL = 'Alle';
const ALL_GROUPS_SUGGESTION = 'Wähle „Alle“, um alle anzuzeigen.';

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
  [RECRUITING_FILTER_ID]: 'Keine Gruppe sucht Verstärkung.',
  [SETTLED_FILTER_ID]: 'Alle Gruppen suchen Verstärkung.',
};

export type NoGroupMatch =
  | { kind: 'query'; needle: string }
  | { kind: 'status'; line: string }
  | { kind: 'noGroups' };

export const noGroupMatchOf = (query: string, status: string): NoGroupMatch => {
  const needle = query.trim();

  if (needle !== '') {
    return { kind: 'query', needle };
  }

  const statusLine = NO_GROUP_MATCH_LINES[status];

  return statusLine === undefined ? { kind: 'noGroups' } : { kind: 'status', line: statusLine };
};

export const toNoGroupMatchLine = (query: string, status: string): string => {
  const match = noGroupMatchOf(query, status);

  if (match.kind === 'query') {
    return `Keine Gruppe passt zu „${match.needle}“.`;
  }
  if (match.kind === 'noGroups') {
    return 'Es sind noch keine Gruppen angelegt.';
  }

  return `${match.line} ${ALL_GROUPS_SUGGESTION}`;
};

export const NO_GROUP_MATCH_TITLE = 'KEINE GRUPPE GEFUNDEN';

export const toGroupsIntroSentence = (total: number, recruiting: number): string => {
  const groups =
    total === 1 ? 'Eine Gruppe trägt die Session.' : `${total} Gruppen tragen die Session.`;

  if (recruiting === 0) {
    return `${groups} Keine davon sucht Verstärkung.`;
  }
  if (recruiting === 1) {
    return `${groups} Eine davon sucht Verstärkung.`;
  }

  return `${groups} ${recruiting} davon suchen Verstärkung.`;
};

export const GROUPS_LEAD = 'Alle Gruppen des Vereins und wer Verstärkung sucht.';
