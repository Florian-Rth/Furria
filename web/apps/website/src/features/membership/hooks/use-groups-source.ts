import type { Group } from '@/lib/seed/groups';
import { useGroupsQuery } from '../api';

export type GroupsSource =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; groups: Group[] };

export const resolveGroupsSource = (
  groups: Group[] | undefined,
  hasFailed: boolean,
): GroupsSource => {
  if (groups !== undefined) {
    return { status: 'ready', groups };
  }

  return hasFailed ? { status: 'error' } : { status: 'loading' };
};

export const selectLoadedGroups = (source: GroupsSource): Group[] =>
  source.status === 'ready' ? source.groups : [];

export const useGroupsSource = (): GroupsSource => {
  const { data, isError } = useGroupsQuery();

  return resolveGroupsSource(data, isError);
};
