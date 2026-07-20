import { QueryClient } from '@tanstack/react-query';

// Marketing-site defaults: public content changes rarely, so queries stay
// fresh for minutes, a failed request is retried once instead of three times,
// and tab focus does not trigger refetch churn.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
