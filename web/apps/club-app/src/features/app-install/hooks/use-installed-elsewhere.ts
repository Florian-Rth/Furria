import { useQuery } from '@tanstack/react-query';

const INSTALLED_ELSEWHERE_KEY = ['app-install', 'installed-elsewhere'] as const;

const readInstalledElsewhere = async (): Promise<boolean> => {
  if (navigator.getInstalledRelatedApps === undefined) {
    return false;
  }
  const apps = await navigator.getInstalledRelatedApps();
  return apps.length > 0;
};

export const useInstalledElsewhere = (): boolean =>
  useQuery({
    queryKey: INSTALLED_ELSEWHERE_KEY,
    queryFn: readInstalledElsewhere,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  }).data ?? false;
