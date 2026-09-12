import { useState } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { toMasterEntries, toRoleSearchTerm } from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';

export interface RoleSearchControl {
  query: string;
  setQuery: (value: string) => void;
  term: string | null;
  entries: readonly RoleMasterEntry[];
}

export const useRoleSearch = (roles: readonly RoleSummary[]): RoleSearchControl => {
  const [query, setQuery] = useState('');

  return {
    query,
    setQuery,
    term: toRoleSearchTerm(query),
    entries: toMasterEntries(roles, query),
  };
};
