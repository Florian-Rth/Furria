import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useGroupsQuery } from '../api';
import { toGroupsErrorMessage } from '../groups-messages';
import type { GroupsSearch } from '../hooks/use-groups-search';
import { GroupsError } from './GroupsError';
import { GroupsView } from './GroupsView';

const LOADING_LABEL = 'Gruppen werden geladen';

interface GroupsBodyProps {
  search: GroupsSearch;
}

export const GroupsBody: FC<GroupsBodyProps> = ({ search }) => {
  const groups = useGroupsQuery();
  const errorMessage = toGroupsErrorMessage(groups.error);

  const reload = (): void => {
    void groups.refetch();
  };

  if (groups.data !== undefined) {
    return <GroupsView groups={groups.data.groups} search={search} />;
  }
  if (errorMessage !== null) {
    return <GroupsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="cards" />;
};
