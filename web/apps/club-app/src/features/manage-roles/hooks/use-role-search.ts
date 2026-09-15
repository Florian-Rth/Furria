import type { KkFilterOption } from '@furria/ui';
import { useState } from 'react';
import { useSearchQuery } from '@/features/session';
import type { RoleMasterEntry } from '../manage-roles-labels';
import {
  ALL_ROLES_FILTER_ID,
  toMasterEntries,
  toNoRoleMatchLine,
  toRoleStatusFilterOptions,
} from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';

export interface RoleSearchControl {
  query: string;
  status: string;
  selectStatus: (id: string) => void;
  filterOptions: KkFilterOption[];
  entries: readonly RoleMasterEntry[];
  emptyDescription: string;
}

export const useRoleSearch = (roles: readonly RoleSummary[]): RoleSearchControl => {
  const query = useSearchQuery();
  const [status, setStatus] = useState<string>(ALL_ROLES_FILTER_ID);

  return {
    query,
    status,
    selectStatus: setStatus,
    filterOptions: toRoleStatusFilterOptions(roles),
    entries: toMasterEntries(roles, query, status),
    emptyDescription: toNoRoleMatchLine(query, status),
  };
};
