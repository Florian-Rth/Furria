import type { FC } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useMyGroupQuery } from '../api';
import { toHubErrorMessage } from '../group-hub-messages';
import { HubError } from './HubError';
import { HubNotFound } from './HubNotFound';
import { HubSkeleton } from './HubSkeleton';
import { HubView } from './HubView';

interface HubBodyProps {
  groupId: number | null;
}

export const HubBody: FC<HubBodyProps> = ({ groupId }) => {
  const hub = useMyGroupQuery(groupId);
  const errorMessage = toHubErrorMessage(hub.error);
  const missing = groupId === null || isNotFoundError(hub.error);

  const reload = (): void => {
    void hub.refetch();
  };

  if (hub.data !== undefined) {
    return <HubView hub={hub.data} />;
  }
  if (missing) {
    return <HubNotFound />;
  }
  if (errorMessage !== null) {
    return <HubError message={errorMessage} onRetry={reload} />;
  }

  return <HubSkeleton />;
};
