import { usePublicGroupsQuery } from '@/lib/public-groups/api';
import type { PublicGroupsSource } from './public-groups-source';
import { resolvePublicGroupsSource } from './public-groups-source';

export const usePublicGroupsSource = (): PublicGroupsSource => {
  const { data, isError, refetch } = usePublicGroupsQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolvePublicGroupsSource(data, isError, retry);
};
