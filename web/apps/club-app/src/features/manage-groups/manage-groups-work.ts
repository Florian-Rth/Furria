import type { KkFilterOption } from '@furria/ui';
import { normalizeForSearch } from '@/lib/text';
import type { ManagedGroupSummary } from './schemas';

export const ALL_GROUPS_FILTER_ID = 'all';
export const NO_ADMIN_GROUPS_FILTER_ID = 'no-admin';
export const NO_KIND_GROUPS_FILTER_ID = 'no-kind';
export const NO_PEOPLE_GROUPS_FILTER_ID = 'no-people';
export const ARCHIVED_GROUPS_FILTER_ID = 'archived';

export type GroupWorkFilterId =
  | typeof ALL_GROUPS_FILTER_ID
  | typeof NO_ADMIN_GROUPS_FILTER_ID
  | typeof NO_KIND_GROUPS_FILTER_ID
  | typeof NO_PEOPLE_GROUPS_FILTER_ID
  | typeof ARCHIVED_GROUPS_FILTER_ID;

const ALL_GROUPS_LABEL = 'Alle';
const NO_ADMIN_LABEL = 'ohne Gruppen-Admin';
const NO_KIND_LABEL = 'ohne Gruppenart';
const NO_PEOPLE_LABEL = 'ohne Personen';
const ARCHIVED_LABEL = 'archiviert';

export const isGroupArchived = (group: ManagedGroupSummary): boolean => group.archivedOn !== null;

export const lacksGroupAdmin = (group: ManagedGroupSummary): boolean =>
  !isGroupArchived(group) && group.admins.length === 0;

export const lacksGroupKind = (group: ManagedGroupSummary): boolean =>
  !isGroupArchived(group) && group.groupKindId === null;

export const lacksPeople = (group: ManagedGroupSummary): boolean =>
  !isGroupArchived(group) && group.memberCount === 0;

export interface GroupWorkFacets {
  total: number;
  listed: number;
  withoutAdmin: number;
  withoutKind: number;
  withoutPeople: number;
  archived: number;
}

export const toGroupWorkFacets = (groups: readonly ManagedGroupSummary[]): GroupWorkFacets => {
  const archived = groups.filter(isGroupArchived).length;
  const withoutAdmin = groups.filter(lacksGroupAdmin).length;
  const withoutKind = groups.filter(lacksGroupKind).length;
  const withoutPeople = groups.filter(lacksPeople).length;

  return {
    total: groups.length,
    listed: groups.length - archived,
    withoutAdmin,
    withoutKind,
    withoutPeople,
    archived,
  };
};

export const toGroupWorkFilterOptions = (facets: GroupWorkFacets): KkFilterOption[] => {
  const options: KkFilterOption[] = [
    { id: ALL_GROUPS_FILTER_ID, label: ALL_GROUPS_LABEL, count: facets.total },
  ];

  if (facets.withoutAdmin > 0) {
    options.push({
      id: NO_ADMIN_GROUPS_FILTER_ID,
      label: NO_ADMIN_LABEL,
      count: facets.withoutAdmin,
    });
  }
  if (facets.withoutKind > 0) {
    options.push({
      id: NO_KIND_GROUPS_FILTER_ID,
      label: NO_KIND_LABEL,
      count: facets.withoutKind,
    });
  }
  if (facets.withoutPeople > 0) {
    options.push({
      id: NO_PEOPLE_GROUPS_FILTER_ID,
      label: NO_PEOPLE_LABEL,
      count: facets.withoutPeople,
    });
  }
  if (facets.archived > 0) {
    options.push({
      id: ARCHIVED_GROUPS_FILTER_ID,
      label: ARCHIVED_LABEL,
      count: facets.archived,
    });
  }

  return options;
};

export const toGroupWorkFilterId = (raw: string): GroupWorkFilterId => {
  if (
    raw === NO_ADMIN_GROUPS_FILTER_ID ||
    raw === NO_KIND_GROUPS_FILTER_ID ||
    raw === NO_PEOPLE_GROUPS_FILTER_ID ||
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
  if (requested === NO_PEOPLE_GROUPS_FILTER_ID && facets.withoutPeople === 0) {
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
  if (filter === NO_PEOPLE_GROUPS_FILTER_ID) {
    return lacksPeople(group);
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

export const MANAGE_GROUPS_LEAD = 'Gruppen anlegen, einordnen und archivieren.';
const FACET_META: Record<GroupWorkFilterId, (count: number) => string> = {
  [ALL_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe im Verzeichnis' : `${count} Gruppen im Verzeichnis`,
  [NO_ADMIN_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe ohne Gruppen-Admin' : `${count} Gruppen ohne Gruppen-Admin`,
  [NO_KIND_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe ohne Gruppenart' : `${count} Gruppen ohne Gruppenart`,
  [NO_PEOPLE_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine Gruppe ohne Personen' : `${count} Gruppen ohne Personen`,
  [ARCHIVED_GROUPS_FILTER_ID]: (count) =>
    count === 1 ? 'Eine archivierte Gruppe' : `${count} archivierte Gruppen`,
};

const NO_MATCH_META = 'Keine Gruppe passt';

export const toRegisterMeta = (
  filter: GroupWorkFilterId,
  bands: GroupRegisterBands,
): string | undefined => {
  const shown = countBandedGroups(bands);

  if (shown === 0) {
    return NO_MATCH_META;
  }
  if (filter === ALL_GROUPS_FILTER_ID) {
    return undefined;
  }

  return FACET_META[filter](shown);
};
