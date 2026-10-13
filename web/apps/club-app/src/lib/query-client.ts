import { shouldRetryRequest } from '@furria/api-client';
import { hashKey, QueryCache, QueryClient } from '@tanstack/react-query';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { createWriteCache } from '@/lib/query/refresh-after';
import { isForbiddenError } from '@/lib/query-error';

const ME_HASH = hashKey(queryKeys.me);

const refreshPermissionsWhenForbidden = (error: Error): void => {
  if (isForbiddenError(error)) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.me, exact: true });
  }
};

const refreshPermissionsWhenReadForbidden = (error: Error, query: { queryHash: string }): void => {
  if (query.queryHash !== ME_HASH) {
    refreshPermissionsWhenForbidden(error);
  }
};

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: refreshPermissionsWhenReadForbidden }),
  mutationCache: createWriteCache(refreshPermissionsWhenForbidden),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: shouldRetryRequest,
      refetchOnWindowFocus: false,
    },
  },
});

subscribeToSessionEnd(() => {
  queryClient.clear();
});
