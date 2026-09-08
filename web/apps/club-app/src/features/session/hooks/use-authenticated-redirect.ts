import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSessionSnapshot } from './use-session-snapshot';

export const useAuthenticatedRedirect = (target: string): boolean => {
  const { status } = useSessionSnapshot();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (isAuthenticated) {
      void router.navigate({ href: target, replace: true });
    }
  }, [isAuthenticated, router, target]);

  return isAuthenticated;
};
