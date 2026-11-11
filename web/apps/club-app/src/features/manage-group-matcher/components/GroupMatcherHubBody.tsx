import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { LOADING_LABEL, RETRY_LABEL } from '../group-matcher-hub-copy';
import { useGroupMatcherHub } from '../hooks/use-group-matcher-hub';
import { GroupMatcherHubReady } from './GroupMatcherHubReady';

export const GroupMatcherHubBody: FC = () => {
  const hub = useGroupMatcherHub();

  switch (hub.kind) {
    case 'loading':
      return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
    case 'failed':
      return (
        <KkRetryAlert
          message={hub.message}
          retrying={hub.isRetrying}
          onRetry={hub.retry}
          retryLabel={RETRY_LABEL}
        />
      );
    case 'ready':
      return <GroupMatcherHubReady view={hub.view} />;
  }
};
