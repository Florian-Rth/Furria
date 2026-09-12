import type { FC } from 'react';
import { useManagedGroupQuery } from '../api';
import { toManagedGroupErrorMessage } from '../manage-groups-messages';
import { GroupOverrideDetails } from './GroupOverrideDetails';
import { GroupOverrideSkeleton } from './GroupOverrideSkeleton';
import { ManagedGroupsError } from './ManagedGroupsError';

interface GroupOverrideBodyProps {
  groupId: number;
}

export const GroupOverrideBody: FC<GroupOverrideBodyProps> = ({ groupId }) => {
  const details = useManagedGroupQuery(groupId);
  const errorMessage = toManagedGroupErrorMessage(details.error);

  const reload = (): void => {
    void details.refetch();
  };

  if (details.data !== undefined) {
    return <GroupOverrideDetails group={details.data} />;
  }
  if (errorMessage !== null) {
    return <ManagedGroupsError message={errorMessage} onRetry={reload} />;
  }

  return <GroupOverrideSkeleton />;
};
