import type { KkFilterOption } from '@furria/ui';
import { normalizeForSearch } from '@/lib/text';
import type { ManagedGroupSummary } from './schemas';

export const ALL_GROUPS_FILTER_ID = 'all';
export const NO_ADMIN_GROUPS_FILTER_ID = 'no-admin';
export const NO_KIND_GROUPS_FILTER_ID = 'no-kind';
export const ARCHIVED_GROUPS_FILTER_ID = 'archived';

export type GroupWorkFilterId =
  | typeof ALL_GROUPS_FILTER_ID
  | typeof NO_ADMIN_GROUPS_FILTER_ID
  | typeof NO_KIND_GROUPS_FILTER_ID
  | typeof ARCHIVED_GROUPS_FILTER_ID;

const ALL_GROUPS_LABEL = 'Alle';
const NO_ADMIN_LABEL = 'ohne Gruppen-Admin';
const NO_KIND_LABEL = 'ohne Gruppenart';
const ARCHIVED_LABEL = 'archiviert';

export const isGroupArchived = (group: ManagedGroupSummary): boolean => group.archivedOn !== null;

export const lacksGroupAdmin = (group: ManagedGroupSummary): boolean =>
  !isGroupArchived(group) && group.admins.length === 0;

export const lacksGroupKind = (group: ManagedGroupSummary): boolean =>
  !isGroupArchived(group) && group.groupKindId === null;

export interface GroupWorkFacets {
  total: number;
  listed: number;
  withoutAdmin: number;
  withoutKind: number;
  archived: number;
  isSettled: boolean;
}

export const toGroupWorkFacets = (groups: readonly ManagedGroupSummary[]): GroupWorkFacets => {
  const archived = groups.filter(isGroupArchived).length;
  const withoutAdmin = groups.filter(lacksGroupAdmin).length;
  const withoutKind = groups.filter(lacksGroupKind).length;

  return {
    total: groups.length,
    listed: groups.length - archived,
    withoutAdmin,
    withoutKind,
    archived,
    isSettled: withoutAdmin === 0 && withoutKind === 0,
  };
};

export const toGroupWorkFilterOptions = (facets: GroupWorkFacets): KkFilterOption[] => {
  const options: KkFilterOption[] = [];

  if (facets.withoutAdmin > 0) {
    options.push({
      id: NO_ADMIN_GROUPS_FILTER_ID,
      label: NO_ADMIN_LABEL,
      count: facets.withoutAdmin,
      tone: 'accent',
      countFirst: true,
    });
  }
  if (facets.withoutKind > 0) {
    options.push({
      id: NO_KIND_GROUPS_FILTER_ID,
      label: NO_KIND_LABEL,
      count: facets.withoutKind,
      tone: 'gold',
      countFirst: true,
    });
  }
  if (facets.archived > 0) {
    options.push({
      id: ARCHIVED_GROUPS_FILTER_ID,
      label: ARCHIVED_LABEL,
      count: facets.archived,
      tone: 'neutral',
      countFirst: true,
    });
  }
  options.push({ id: ALL_GROUPS_FILTER_ID, label: ALL_GROUPS_LABEL, count: facets.total });

  return options;
};

export const toGroupWorkFilterId = (raw: string): GroupWorkFilterId => {
  if (
    raw === NO_ADMIN_GROUPS_FILTER_ID ||
    raw === NO_KIND_GROUPS_FILTER_ID ||
    raw === ARCHIVED_GROUPS_FILTER_ID
  ) {
    return raw;
  }

  return ALL_GROUPS_FILTER_ID;
};

export const resolveGroupWorkFilter = (
  requested: GroupWorkFilterId,
  facets: GroupWorkFacets,
): GroupWorkFilterId => {
  if (requested === NO_ADMIN_GROUPS_FILTER_ID && facets.withoutAdmin === 0) {
    return ALL_GROUPS_FILTER_ID;
  }
  if (requested === NO_KIND_GROUPS_FILTER_ID && facets.withoutKind === 0) {
    return ALL_GROUPS_FILTER_ID;
  }
  if (requested === ARCHIVED_GROUPS_FILTER_ID && facets.archived === 0) {
    return ALL_GROUPS_FILTER_ID;
  }

  return requested;
};

const matchesFilter = (group: ManagedGroupSummary, filter: GroupWorkFilterId): boolean => {
  if (filter === NO_ADMIN_GROUPS_FILTER_ID) {
    return lacksGroupAdmin(group);
  }
  if (filter === NO_KIND_GROUPS_FILTER_ID) {
    return lacksGroupKind(group);
  }
  if (filter === ARCHIVED_GROUPS_FILTER_ID) {
    return isGroupArchived(group);
  }

  return true;
};

const byName = (left: ManagedGroupSummary, right: ManagedGroupSummary): number =>
  left.name.localeCompare(right.name, 'de');

export interface GroupRegisterBands {
  running: ManagedGroupSummary[];
  archived: ManagedGroupSummary[];
}

export const toGroupRegisterBands = (
  groups: readonly ManagedGroupSummary[],
  query: string,
  filter: GroupWorkFilterId,
): GroupRegisterBands => {
  const needle = normalizeForSearch(query.trim());
  const matched = groups.filter(
    (group) =>
      matchesFilter(group, filter) &&
      (needle === '' || normalizeForSearch(group.name).includes(needle)),
  );

  return {
    running: matched.filter((group) => !isGroupArchived(group)).sort(byName),
    archived: matched.filter(isGroupArchived).sort(byName),
  };
};

export const countBandedGroups = (bands: GroupRegisterBands): number =>
  bands.running.length + bands.archived.length;

export const isGroupBanded = (bands: GroupRegisterBands, groupId: number | null): boolean =>
  groupId !== null &&
  [...bands.running, ...bands.archived].some((group) => group.groupId === groupId);

const EMPTY_REGISTER_LEAD = 'Noch steht keine Gruppe im Verzeichnis.';
const SETTLED_LEAD = 'Alles gepflegt.';

const toListedSentence = (listed: number): string =>
  listed === 1 ? 'Eine Gruppe steht im Verzeichnis.' : `${listed} Gruppen stehen im Verzeichnis.`;

export const toManagedGroupsLead = (facets: GroupWorkFacets): string => {
  if (facets.total === 0) {
    return EMPTY_REGISTER_LEAD;
  }
  if (facets.isSettled) {
    return `${toListedSentence(facets.listed)} ${SETTLED_LEAD}`;
  }

  return toListedSentence(facets.listed);
};

const FACET_META: Record<GroupWorkFilterId, (count: number) => string> = {
  [ALL_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe im Verzeichnis' : `${count} Gruppen im Verzeichnis`,
  [NO_ADMIN_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe ohne Gruppen-Admin' : `${count} Gruppen ohne Gruppen-Admin`,
  [NO_KIND_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe ohne Gruppenart' : `${count} Gruppen ohne Gruppenart`,
  [ARCHIVED_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine archivierte Gruppe' : `${count} archivierte Gruppen`,
};

const NO_MATCH_META = 'Keine Gruppe passt';

const toArchivedTail = (archived: number): string =>
  archived === 1 ? '1 archiviert' : `${archived} archiviert`;

export const toRegisterMeta = (filter: GroupWorkFilterId, bands: GroupRegisterBands): string => {
  if (countBandedGroups(bands) === 0) {
    return NO_MATCH_META;
  }
  if (filter !== ALL_GROUPS_FILTER_ID || bands.archived.length === 0) {
    return FACET_META[filter](countBandedGroups(bands));
  }
  if (bands.running.length === 0) {
    return FACET_META[ARCHIVED_GROUPS_FILTER_ID](bands.archived.length);
  }

  return `${FACET_META[ALL_GROUPS_FILTER_ID](bands.running.length)} · ${toArchivedTail(bands.archived.length)}`;
};
