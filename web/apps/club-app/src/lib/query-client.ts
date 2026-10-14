import { shouldRetryRequest } from '@furria/api-client';
import { hashKey, QueryCache, QueryClient } from '@tanstack/react-query';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { refreshPermissionsWhenForbidden } from '@/lib/query/permission-refresh';
import { queryKeys } from '@/lib/query/reads';
import { createWriteCache } from '@/lib/query/refresh-after';

const ME_HASH = hashKey(queryKeys.me);

const refreshPermissionsOnWriteForbidden = (error: Error): void => {
  refreshPermissionsWhenForbidden(queryClient, error);
};

const refreshPermissionsWhenReadForbidden = (error: Error, query: { queryHash: string }): void => {
  if (query.queryHash !== ME_HASH) {
    refreshPermissionsWhenForbidden(queryClient, error);
  }
};

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: refreshPermissionsWhenReadForbidden }),
  mutationCache: createWriteCache(refreshPermissionsOnWriteForbidden),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: shouldRetryRequest,
      refetchOnWindowFocus: false,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

subscribeToSessionEnd(() => {
  queryClient.clear();
});
