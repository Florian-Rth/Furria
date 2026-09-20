import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useGroupHubQuery } from '../api';
import { HUB_DENIED_MESSAGE } from '../group-hub-labels';
import { toHubErrorMessage } from '../group-hub-messages';
import { HubError } from './HubError';
import { HubNotFound } from './HubNotFound';
import { HubSkeleton } from './HubSkeleton';
import { HubView } from './HubView';

interface HubBodyProps {
  groupId: number | null;
}

export const HubBody: FC<HubBodyProps> = ({ groupId }) => {
  const hub = useGroupHubQuery(groupId);
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
  if (isForbiddenError(hub.error)) {
    return <AccessDenied message={HUB_DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <HubError message={errorMessage} onRetry={reload} />;
  }

  return <HubSkeleton />;
};
