import type { KkFilterOption } from '@furria/ui';
import { useState } from 'react';
import { useSearchQuery } from '@/features/session';
import type { GroupsSection } from '../groups-labels';
import {
  ALL_GROUPS_FILTER_ID,
  filterGroups,
  toGroupsSections,
  toNoGroupMatchLine,
  toRecruitingFilterOptions,
} from '../groups-labels';
import type { GroupSummary } from '../schemas';

export interface GroupsSearch {
  query: string;
  status: string;
  selectStatus: (id: string) => void;
  filterOptions: KkFilterOption[];
  sections: readonly GroupsSection[];
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
    sections: toGroupsSections(filterGroups(groups, { query, status })),
    emptyDescription: toNoGroupMatchLine(query, status),
  };
};
