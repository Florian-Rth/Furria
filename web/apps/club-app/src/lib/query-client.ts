import { MutationCache, QueryClient } from '@tanstack/react-query';
import { shouldRetryRequest } from '@/lib/api/retry-policy';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { refreshAfterWrite } from '@/lib/query/refresh-after';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSettled: (_data, _error, _variables, _result, _mutation, context) =>
      refreshAfterWrite(context),
  }),
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
