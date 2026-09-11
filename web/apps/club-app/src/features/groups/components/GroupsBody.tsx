import type { FC } from 'react';
import { useGroupsQuery } from '../api';
import { toGroupsErrorMessage } from '../groups-messages';
import { GroupsError } from './GroupsError';
import { GroupsSkeleton } from './GroupsSkeleton';
import { GroupsView } from './GroupsView';

export const GroupsBody: FC = () => {
  const groups = useGroupsQuery();
  const errorMessage = toGroupsErrorMessage(groups.error);

  const reload = (): void => {
    void groups.refetch();
  };

  if (groups.data !== undefined) {
    return <GroupsView groups={groups.data.groups} />;
  }
  if (errorMessage !== null) {
    return <GroupsError message={errorMessage} onRetry={reload} />;
  }

  return <GroupsSkeleton />;
};
