import { usePublicGroupsQuery } from '@/lib/public-groups/api';
import type { PublicGroup } from '@/lib/public-groups/schemas';

export type GroupsSource =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; groups: PublicGroup[] };

export const resolveGroupsSource = (
  groups: PublicGroup[] | undefined,
  hasFailed: boolean,
): GroupsSource => {
  if (groups !== undefined) {
    return { status: 'ready', groups };
  }

  return hasFailed ? { status: 'error' } : { status: 'loading' };
};

export const selectLoadedGroups = (source: GroupsSource): PublicGroup[] =>
  source.status === 'ready' ? source.groups : [];

export const useGroupsSource = (): GroupsSource => {
  const { data, isError } = usePublicGroupsQuery();

  return resolveGroupsSource(data, isError);
};
