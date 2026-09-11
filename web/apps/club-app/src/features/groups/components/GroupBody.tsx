import type { FC } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useGroupQuery } from '../api';
import { toGroupErrorMessage } from '../groups-messages';
import { GroupError } from './GroupError';
import { GroupNotFound } from './GroupNotFound';
import { GroupSkeleton } from './GroupSkeleton';
import { GroupView } from './GroupView';

interface GroupBodyProps {
  groupId: number | null;
}

export const GroupBody: FC<GroupBodyProps> = ({ groupId }) => {
  const group = useGroupQuery(groupId);
  const errorMessage = toGroupErrorMessage(group.error);
  const missing = groupId === null || isNotFoundError(group.error);

  const reload = (): void => {
    void group.refetch();
  };

  if (group.data !== undefined) {
    return <GroupView group={group.data} />;
  }
  if (missing) {
    return <GroupNotFound />;
  }
  if (errorMessage !== null) {
    return <GroupError message={errorMessage} onRetry={reload} />;
  }

  return <GroupSkeleton />;
};
