import type { KkFilterOption } from '@furria/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSearchQuery } from '@/features/session';
import type { GroupRegisterBands, GroupWorkFacets, GroupWorkFilterId } from '../manage-groups-work';
import {
  ALL_GROUPS_FILTER_ID,
  resolveGroupWorkFilter,
  toGroupRegisterBands,
  toGroupWorkFacets,
  toGroupWorkFilterId,
  toGroupWorkFilterOptions,
} from '../manage-groups-work';
import type { ManagedGroupSummary } from '../schemas';

const MANAGE_GROUPS_ROUTE_ID = '/_app/manage/groups';
const MANAGE_GROUPS_PATH = '/manage/groups';

export interface ManagedGroupsListing {
  query: string;
  filter: GroupWorkFilterId;
  selectFilter: (id: string) => void;
  facets: GroupWorkFacets;
  filterOptions: KkFilterOption[];
  bands: GroupRegisterBands;
  isFiltered: boolean;
}

const NO_GROUPS: readonly ManagedGroupSummary[] = [];

const toSearchValue = (filter: GroupWorkFilterId): string | undefined =>
  filter === ALL_GROUPS_FILTER_ID ? undefined : filter;

export const useManagedGroupsListing = (
  loadedGroups: readonly ManagedGroupSummary[] | undefined,
): ManagedGroupsListing => {
  const query = useSearchQuery();
  const search = useSearch({ from: MANAGE_GROUPS_ROUTE_ID });
  const navigate = useNavigate();
  const requested = toGroupWorkFilterId(search.work ?? ALL_GROUPS_FILTER_ID);
  const groups = loadedGroups ?? NO_GROUPS;
  const facets = toGroupWorkFacets(groups);
  const filter = loadedGroups === undefined ? requested : resolveGroupWorkFilter(requested, facets);

  const go = (next: GroupWorkFilterId, replace: boolean): void => {
    void navigate({
      to: MANAGE_GROUPS_PATH,
      search: (previous) => ({ ...previous, work: toSearchValue(next) }),
      replace,
      resetScroll: false,
    });
  };

  useEffect(() => {
    if (filter === requested) {
      return;
    }

    void navigate({
      to: MANAGE_GROUPS_PATH,
      search: (previous) => ({ ...previous, work: toSearchValue(filter) }),
      replace: true,
      resetScroll: false,
    });
  }, [filter, requested, navigate]);

  const selectFilter = (id: string): void => {
    go(toGroupWorkFilterId(id), false);
  };

  return {
    query,
    filter,
    selectFilter,
    facets,
    filterOptions: toGroupWorkFilterOptions(facets),
    bands: toGroupRegisterBands(groups, query, filter),
    isFiltered: query.trim() !== '' || filter !== ALL_GROUPS_FILTER_ID,
  };
};
