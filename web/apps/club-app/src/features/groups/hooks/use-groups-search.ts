import type { KkFilterOption } from '@furria/ui';
import { useState } from 'react';
import { useSearchQuery } from '@/features/session';
import {
  ALL_GROUPS_FILTER_ID,
  filterGroups,
  toNoGroupMatchLine,
  toRecruitingFilterOptions,
} from '../groups-labels';
import type { GroupSummary } from '../schemas';

export interface GroupsSearch {
  query: string;
  status: string;
  selectStatus: (id: string) => void;
  filterOptions: KkFilterOption[];
  visible: readonly GroupSummary[];
  emptyDescription: string;
}

export const useGroupsSearch = (groups: readonly GroupSummary[]): GroupsSearch => {
  const query = useSearchQuery();
  const [status, setStatus] = useState<string>(ALL_GROUPS_FILTER_ID);

  return {
    query,
    status,
    selectStatus: setStatus,
    filterOptions: toRecruitingFilterOptions(groups),
    visible: filterGroups(groups, { query, status }),
    emptyDescription: toNoGroupMatchLine(query, status),
  };
};
