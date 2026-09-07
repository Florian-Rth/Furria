import { QueryClient } from '@tanstack/react-query';
import { shouldRetryRequest } from '@/lib/api/retry-policy';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: shouldRetryRequest,
      refetchOnWindowFocus: false,
    },
  },
});
