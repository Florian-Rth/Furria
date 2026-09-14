import type { KkFilterOption } from '@furria/ui';
import { useState } from 'react';
import type { GroupStatusFilterId } from '../manage-groups-labels';
import {
  ALL_GROUPS_FILTER_ID,
  filterManagedGroups,
  toGroupStatusFilterId,
  toGroupStatusFilterOptions,
} from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

export interface ManagedGroupsView {
  query: string;
  setQuery: (value: string) => void;
  status: GroupStatusFilterId;
  selectStatus: (id: string) => void;
  filterOptions: KkFilterOption[];
  visible: readonly ManagedGroupSummary[];
  isFiltered: boolean;
}

export const useManagedGroupsView = (groups: readonly ManagedGroupSummary[]): ManagedGroupsView => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<GroupStatusFilterId>(ALL_GROUPS_FILTER_ID);

  const selectStatus = (id: string): void => {
    setStatus(toGroupStatusFilterId(id));
  };

  return {
    query,
    setQuery,
    status,
    selectStatus,
    filterOptions: toGroupStatusFilterOptions(groups),
    visible: filterManagedGroups(groups, query, status),
    isFiltered: query.trim() !== '' || status !== ALL_GROUPS_FILTER_ID,
  };
};
