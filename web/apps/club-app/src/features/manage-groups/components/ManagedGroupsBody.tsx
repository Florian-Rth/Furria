import type { FC } from 'react';
import { useManagedGroupsQuery } from '../api';
import { toManagedGroupsErrorMessage } from '../manage-groups-messages';
import { ManagedGroupsError } from './ManagedGroupsError';
import { ManagedGroupsSkeleton } from './ManagedGroupsSkeleton';
import { ManagedGroupsView } from './ManagedGroupsView';

export const ManagedGroupsBody: FC = () => {
  const groups = useManagedGroupsQuery();
  const errorMessage = toManagedGroupsErrorMessage(groups.error);

  const reload = (): void => {
    void groups.refetch();
  };

  if (groups.data !== undefined) {
    return <ManagedGroupsView groups={groups.data.groups} />;
  }
  if (errorMessage !== null) {
    return <ManagedGroupsError message={errorMessage} onRetry={reload} />;
  }

  return <ManagedGroupsSkeleton />;
};
