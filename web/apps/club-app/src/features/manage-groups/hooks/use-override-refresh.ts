import { useQueryClient } from '@tanstack/react-query';
import { MANAGED_GROUPS_QUERY_KEY, managedGroupQueryKey } from '../api';

export const useOverrideRefresh = (groupId: number): (() => void) => {
  const queryClient = useQueryClient();

  return (): void => {
    void queryClient.invalidateQueries({ queryKey: managedGroupQueryKey(groupId) });
    void queryClient.invalidateQueries({ queryKey: MANAGED_GROUPS_QUERY_KEY });
  };
};
