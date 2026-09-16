import type { KkFilterOption } from '@furria/ui';
import { useState } from 'react';
import { useSearchQuery } from '@/features/session';
import type { GroupStatusFilterId } from '../manage-groups-labels';
import {
  ALL_GROUPS_FILTER_ID,
  filterManagedGroups,
  toGroupStatusFilterId,
  toGroupStatusFilterOptions,
} from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

export interface ManagedGroupsListing {
  query: string;
  status: GroupStatusFilterId;
  selectStatus: (id: string) => void;
  filterOptions: KkFilterOption[];
  visible: readonly ManagedGroupSummary[];
  isFiltered: boolean;
}

export const useManagedGroupsListing = (
  groups: readonly ManagedGroupSummary[],
): ManagedGroupsListing => {
  const query = useSearchQuery();
  const [status, setStatus] = useState<GroupStatusFilterId>(ALL_GROUPS_FILTER_ID);

  const selectStatus = (id: string): void => {
    setStatus(toGroupStatusFilterId(id));
  };

  return {
    query,
    status,
    selectStatus,
    filterOptions: toGroupStatusFilterOptions(groups),
    visible: filterManagedGroups(groups, query, status),
    isFiltered: query.trim() !== '' || status !== ALL_GROUPS_FILTER_ID,
  };
};
