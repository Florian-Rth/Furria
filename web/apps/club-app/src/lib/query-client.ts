import { QueryClient } from '@tanstack/react-query';
import { shouldRetryRequest } from '@/lib/api/retry-policy';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';

export const queryClient = new QueryClient({
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
