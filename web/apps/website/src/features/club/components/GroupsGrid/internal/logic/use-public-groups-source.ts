import { usePublicGroupsQuery } from '@/features/club/api';
import type { PublicGroup } from '@/features/club/schemas';

export type PublicGroupsSource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; groups: PublicGroup[] };

export const resolvePublicGroupsSource = (
  groups: PublicGroup[] | undefined,
  hasFailed: boolean,
  retry: () => void,
): PublicGroupsSource => {
  if (groups !== undefined) {
    return { status: 'ready', groups };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};

export const usePublicGroupsSource = (): PublicGroupsSource => {
  const { data, isError, refetch } = usePublicGroupsQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolvePublicGroupsSource(data, isError, retry);
};
