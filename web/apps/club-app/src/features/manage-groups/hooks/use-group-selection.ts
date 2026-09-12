import { useNavigate, useSearch } from '@tanstack/react-router';
import type { ManagedGroupsSearch } from '../schemas';

const MANAGE_GROUPS_ROUTE_ID = '/_app/manage/groups';
const MANAGE_GROUPS_PATH = '/manage/groups';

export interface GroupSelection {
  groupId: number | null;
  select: (groupId: number) => void;
  clear: () => void;
}

export const useGroupSelection = (): GroupSelection => {
  const search = useSearch({ from: MANAGE_GROUPS_ROUTE_ID });
  const navigate = useNavigate();

  const go = (next: ManagedGroupsSearch): void => {
    void navigate({ to: MANAGE_GROUPS_PATH, search: next });
  };

  const select = (groupId: number): void => {
    go({ group: groupId });
  };

  const clear = (): void => {
    go({ group: undefined });
  };

  return { groupId: search.group ?? null, select, clear };
};
