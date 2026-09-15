import { useNavigate, useSearch } from '@tanstack/react-router';

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

  const go = (next: number | undefined): void => {
    void navigate({
      to: MANAGE_GROUPS_PATH,
      search: (previous) => ({ ...previous, group: next }),
      resetScroll: false,
    });
  };

  const select = (groupId: number): void => {
    go(groupId);
  };

  const clear = (): void => {
    go(undefined);
  };

  return { groupId: search.group ?? null, select, clear };
};
