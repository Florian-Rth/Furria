import type { KkConfirmFact, KkFilterOption } from '@furria/ui';
import {
  GROUP_SECTION_TITLES as SHARED_GROUP_SECTION_TITLES,
  toGroupSubline,
} from '@/lib/group-sections';
import { formatIsoDay } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { ARCHIVED_CHIP, NO_ADMIN_CHIP, toRecruitingChip } from '@/lib/state-chips';
import { normalizeForSearch } from '@/lib/text';
import type { ManagedGroupSummary } from './schemas';

export const MANAGE_GROUPS_SECTION_TITLES = {
  list: 'Alle Gruppen',
  members: SHARED_GROUP_SECTION_TITLES.managedMembers,
} as const;

export interface ManagedGroupsEmptyCopy {
  title: string;
  description: string;
}

export const MANAGED_GROUPS_EMPTY: Record<'filtered' | 'cold', ManagedGroupsEmptyCopy> = {
  filtered: {
    title: 'KEINE GRUPPE PASST',
    description: 'Anderer Suchbegriff oder ein anderer Filter bringt sie zurück.',
  },
  cold: {
    title: 'NOCH KEINE GRUPPE',
    description:
      'Leg die erste Gruppe an. Danach kannst du Personen dazu eintragen und Gruppen-Admins ernennen.',
  },
};

export const MANAGE_GROUPS_FOOTNOTE =
  'Archivieren löscht nichts: Die Gruppe verschwindet aus dem Verzeichnis, ihre Geschichte bleibt in den Profilen stehen.';

export const toGroupCountLine = (group: ManagedGroupSummary): string =>
  toGroupSubline(group.memberCount, group.admins.length);

export interface ManagedGroupChips {
  status: StateChip | null;
  openness: StateChip;
}

export const toManagedGroupChips = (group: ManagedGroupSummary): ManagedGroupChips => {
  const openness = toRecruitingChip(group.isRecruiting);

  if (group.archivedOn !== null) {
    return { status: ARCHIVED_CHIP, openness };
  }
  if (group.admins.length === 0) {
    return { status: NO_ADMIN_CHIP, openness };
  }

  return { status: null, openness };
};

export const ALL_GROUPS_FILTER_ID = 'all';
export const ACTIVE_GROUPS_FILTER_ID = 'active';
export const ARCHIVED_GROUPS_FILTER_ID = 'archived';

export type GroupStatusFilterId =
  | typeof ALL_GROUPS_FILTER_ID
  | typeof ACTIVE_GROUPS_FILTER_ID
  | typeof ARCHIVED_GROUPS_FILTER_ID;

export const toGroupStatusFilterId = (raw: string): GroupStatusFilterId => {
  if (raw === ACTIVE_GROUPS_FILTER_ID || raw === ARCHIVED_GROUPS_FILTER_ID) {
    return raw;
  }

  return ALL_GROUPS_FILTER_ID;
};

const isArchived = (group: ManagedGroupSummary): boolean => group.archivedOn !== null;

export const countArchived = (groups: readonly ManagedGroupSummary[]): number =>
  groups.filter(isArchived).length;

export const toGroupStatusFilterOptions = (
  groups: readonly ManagedGroupSummary[],
): KkFilterOption[] => {
  const archived = countArchived(groups);

  return [
    { id: ALL_GROUPS_FILTER_ID, label: 'Alle', count: groups.length },
    { id: ACTIVE_GROUPS_FILTER_ID, label: 'Aktiv', count: groups.length - archived },
    { id: ARCHIVED_GROUPS_FILTER_ID, label: 'Archiviert', count: archived },
  ];
};

const matchesStatus = (group: ManagedGroupSummary, status: GroupStatusFilterId): boolean => {
  if (status === ACTIVE_GROUPS_FILTER_ID) {
    return !isArchived(group);
  }
  if (status === ARCHIVED_GROUPS_FILTER_ID) {
    return isArchived(group);
  }

  return true;
};

const matchesQuery = (group: ManagedGroupSummary, needle: string): boolean =>
  normalizeForSearch(group.name).includes(needle);

const byArchivedLastThenName = (left: ManagedGroupSummary, right: ManagedGroupSummary): number => {
  if (isArchived(left) !== isArchived(right)) {
    return isArchived(left) ? 1 : -1;
  }

  return left.name.localeCompare(right.name, 'de');
};

export const filterManagedGroups = (
  groups: readonly ManagedGroupSummary[],
  query: string,
  status: GroupStatusFilterId,
): ManagedGroupSummary[] => {
  const needle = normalizeForSearch(query.trim());
  const matched = groups.filter(
    (group) => matchesStatus(group, status) && (needle === '' || matchesQuery(group, needle)),
  );

  return matched.sort(byArchivedLastThenName);
};

export const findManagedGroup = (
  groups: readonly ManagedGroupSummary[],
  groupId: number | null,
): ManagedGroupSummary | null => {
  if (groupId === null) {
    return null;
  }

  return groups.find((group) => group.groupId === groupId) ?? null;
};

export const toManagedGroupsIntro = (groups: readonly ManagedGroupSummary[]): string => {
  if (groups.length === 0) {
    return 'Noch steht keine Gruppe im Verzeichnis.';
  }

  const archived = countArchived(groups);
  const active = groups.length - archived;
  const head =
    active === 1 ? 'Eine Gruppe steht im Verzeichnis.' : `${active} Gruppen stehen im Verzeichnis.`;

  if (archived === 0) {
    return head;
  }

  const tail =
    archived === 1 ? 'Eine weitere ist archiviert.' : `${archived} weitere sind archiviert.`;

  return `${head} ${tail}`;
};

const NOBODY_LINE = 'Es ist gerade niemand eingetragen.';

const toZugehoerigkeitenClause = (
  count: number,
  singularVerb: string,
  pluralVerb: string,
): string => {
  if (count === 0) {
    return NOBODY_LINE;
  }
  if (count === 1) {
    return `Die eine Zugehörigkeit ${singularVerb}.`;
  }

  return `Die ${count} Zugehörigkeiten ${pluralVerb}.`;
};

export const toArchivedSinceLine = (archivedOn: string): string =>
  `Archiviert am ${formatIsoDay(archivedOn)}. Zum Bearbeiten musst du die Gruppe zuerst wieder aktivieren.`;

export const toArchiveQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_EYEBROW = 'Gruppe archivieren';
export const ARCHIVE_EXPLANATION =
  'Archivieren löscht nichts: Die Zugehörigkeiten bleiben bestehen — die Gruppe zählt nur nicht mehr mit. Sie verschwindet aus dem Verzeichnis, ihre Geschichte bleibt in den Profilen stehen.';

export const toArchiveConsequence = (
  name: string,
  memberCount: number,
  todayLabel: string,
): string =>
  `Ab dem ${todayLabel} steht ${name} nicht mehr im Verzeichnis. ${toZugehoerigkeitenClause(memberCount, 'bleibt bestehen', 'bleiben bestehen')}`;

export const toRestoreQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_EYEBROW = 'Gruppe aktivieren';
export const RESTORE_EXPLANATION =
  'Die Gruppe steht wieder im Verzeichnis und zählt wieder für die Vereinsbindung. An den Zeiträumen ändert sich nichts — sie waren nie weg.';

export const toRestoreConsequence = (
  name: string,
  memberCount: number,
  todayLabel: string,
): string =>
  `Ab dem ${todayLabel} steht ${name} wieder im Verzeichnis. ${toZugehoerigkeitenClause(memberCount, 'zählt wieder mit', 'zählen wieder mit')}`;

export const toGroupFacts = (group: ManagedGroupSummary, dayLabel: string): KkConfirmFact[] => [
  { label: 'Gruppe', value: group.name },
  { label: 'Personen', value: String(group.memberCount) },
  { label: 'Gruppen-Admins', value: String(group.admins.length) },
  { label: 'Ab', value: dayLabel },
];

export const toGroupCreatedMessage = (name: string): string => `${name} ist angelegt.`;

export const toGroupSavedMessage = (name: string): string => `${name} ist gespeichert.`;

export const toGroupArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toGroupRestoredMessage = (name: string): string => `${name} ist wieder aktiv.`;
