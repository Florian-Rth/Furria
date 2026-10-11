import { useRouter } from '@tanstack/react-router';

export const useRouteRetry = (): (() => void) => {
  const router = useRouter();

  return (): void => {
    void router.invalidate();
  };
};
