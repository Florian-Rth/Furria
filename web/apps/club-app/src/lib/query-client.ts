import { shouldRetryRequest } from '@furria/api-client';
import { hashKey, QueryCache, QueryClient } from '@tanstack/react-query';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { refreshPermissionsWhenForbidden } from '@/lib/query/permission-refresh';
import { queryKeys } from '@/lib/query/reads';
import { createWriteCache } from '@/lib/query/refresh-after';

const ME_HASH = hashKey(queryKeys.me);
const SHOWN_FRESH_MS = 30_000;

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
      staleTime: SHOWN_FRESH_MS,
      retry: shouldRetryRequest,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
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
