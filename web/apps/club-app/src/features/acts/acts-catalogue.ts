import type { ActGroup, CatalogueAct } from '@/features/running-order/schemas';
import { normalizeForSearch } from '@/lib/text';
import type { ActsFilter } from './schemas';

export type ActsScope = { kind: 'club' } | { kind: 'group'; groupId: number };

export interface ActSection {
  id: string;
  group: ActGroup | null;
  acts: CatalogueAct[];
}

const COLLATOR = new Intl.Collator('de-DE');
const POINTS_SECTION_ID = 'points';

export const scopedActsOf = (acts: readonly CatalogueAct[], scope: ActsScope): CatalogueAct[] =>
  scope.kind === 'club' ? [...acts] : acts.filter((act) => act.group?.groupId === scope.groupId);

export const matchesFilter = (act: CatalogueAct, filter: ActsFilter): boolean => {
  if (filter === 'archive') {
    return act.archived;
  }
  if (act.archived) {
    return false;
  }

  switch (filter) {
    case 'all':
      return true;
    case 'points':
      return act.group === null;
    default:
      return act.kind === filter;
  }
};

export const filterCountsOf = (acts: readonly CatalogueAct[]): Record<ActsFilter, number> => {
  const countOf = (filter: ActsFilter): number =>
    acts.filter((act) => matchesFilter(act, filter)).length;

  return {
    all: countOf('all'),
    dance: countOf('dance'),
    speech: countOf('speech'),
    music: countOf('music'),
    show: countOf('show'),
    points: countOf('points'),
    archive: countOf('archive'),
  };
};

const searchTermOf = (query: string | null): string | null => {
  const term = normalizeForSearch(query?.trim() ?? '');

  return term === '' ? null : term;
};

export const matchesQuery = (act: CatalogueAct, query: string | null): boolean => {
  const term = searchTermOf(query);

  if (term === null) {
    return true;
  }

  const haystack = [
    act.name,
    act.group?.name ?? '',
    ...act.cast.map((person) => `${person.firstName} ${person.lastName}`),
  ];

  return haystack.some((text) => normalizeForSearch(text).includes(term));
};

const byName = (left: CatalogueAct, right: CatalogueAct): number =>
  COLLATOR.compare(left.name, right.name);

export const actSectionsOf = (acts: readonly CatalogueAct[]): ActSection[] => {
  const groups = new Map<number, ActSection>();
  const points: CatalogueAct[] = [];

  for (const act of acts) {
    if (act.group === null) {
      points.push(act);
      continue;
    }

    const section = groups.get(act.group.groupId);

    if (section === undefined) {
      groups.set(act.group.groupId, {
        id: `group:${act.group.groupId}`,
        group: act.group,
        acts: [act],
      });
    } else {
      section.acts.push(act);
    }
  }

  const grouped = [...groups.values()]
    .map((section) => ({ ...section, acts: section.acts.sort(byName) }))
    .sort((left, right) => COLLATOR.compare(left.group?.name ?? '', right.group?.name ?? ''));

  return points.length === 0
    ? grouped
    : [...grouped, { id: POINTS_SECTION_ID, group: null, acts: points.sort(byName) }];
};

export const visibleSectionsOf = (
  acts: readonly CatalogueAct[],
  filter: ActsFilter,
  query: string | null,
): ActSection[] =>
  actSectionsOf(acts.filter((act) => matchesFilter(act, filter) && matchesQuery(act, query)));

export const knownGroupsOf = (
  listed: readonly ActGroup[],
  acts: readonly CatalogueAct[],
): ActGroup[] => {
  const groups = new Map<number, ActGroup>();

  for (const group of [
    ...listed,
    ...acts.flatMap((act) => (act.group === null ? [] : [act.group])),
  ]) {
    if (!groups.has(group.groupId)) {
      groups.set(group.groupId, group);
    }
  }

  return [...groups.values()].sort((left, right) => COLLATOR.compare(left.name, right.name));
};
