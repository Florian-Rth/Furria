import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/reads';
import { isForbiddenError } from '@/lib/query-error';

export const refreshPermissionsWhenForbidden = (queryClient: QueryClient, error: Error): void => {
  if (isForbiddenError(error)) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.me, exact: true });
  }
};
