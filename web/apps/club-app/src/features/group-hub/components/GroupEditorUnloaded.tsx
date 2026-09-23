import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied, GROUPS_ORIGIN } from '@/features/session';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useGroupHubQuery } from '../api';
import { HUB_DENIED_MESSAGE } from '../group-hub-labels';
import { toHubErrorMessage } from '../group-hub-messages';
import { GroupEditorError } from './GroupEditorError';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';

const FALLBACK_TITLE = 'Gruppe';

interface GroupEditorUnloadedProps {
  groupId: number | null;
}

export const GroupEditorUnloaded: FC<GroupEditorUnloadedProps> = ({ groupId }) => {
  const hub = useGroupHubQuery(groupId);
  const errorMessage = toHubErrorMessage(hub.error);

  const reload = (): void => {
    void hub.refetch();
  };

  if (groupId === null || isNotFoundError(hub.error)) {
    return <GroupEditorNotFound />;
  }
  if (isForbiddenError(hub.error)) {
    return (
      <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={GROUPS_ORIGIN}>
        <AccessDenied message={HUB_DENIED_MESSAGE} />
      </KkScreen>
    );
  }
  if (errorMessage !== null) {
    return (
      <GroupEditorError
        title={FALLBACK_TITLE}
        origin={GROUPS_ORIGIN}
        message={errorMessage}
        onRetry={reload}
      />
    );
  }

  return <GroupEditorSkeleton />;
};
