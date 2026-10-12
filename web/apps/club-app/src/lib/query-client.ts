import { shouldRetryRequest } from '@furria/api-client';
import { QueryClient } from '@tanstack/react-query';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { createWriteCache } from '@/lib/query/refresh-after';

export const queryClient = new QueryClient({
  mutationCache: createWriteCache(),
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
