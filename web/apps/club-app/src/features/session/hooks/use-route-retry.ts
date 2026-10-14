import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

interface RouteRetry {
  retry: () => void;
  isRetrying: boolean;
}

export const useRouteRetry = (reset: () => void): RouteRetry => {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = (): void => {
    setIsRetrying(true);
    reset();
    void router.invalidate().finally(() => {
      setIsRetrying(false);
    });
  };

  return { retry, isRetrying };
};
