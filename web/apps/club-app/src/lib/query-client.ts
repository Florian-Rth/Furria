import { shouldRetryRequest } from '@furria/api-client';
import { QueryClient } from '@tanstack/react-query';
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
