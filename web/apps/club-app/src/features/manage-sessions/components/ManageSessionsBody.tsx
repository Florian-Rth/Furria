import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useSessionRecordsQuery } from '../api';
import { MANAGE_SESSIONS_LOADING_LABEL } from '../manage-sessions-labels';
import { toSessionRecordsErrorMessage } from '../manage-sessions-messages';
import { ManageSessionsError } from './ManageSessionsError';
import { ManageSessionsView } from './ManageSessionsView';

interface ManageSessionsBodyProps {
  today: Date;
}

export const ManageSessionsBody: FC<ManageSessionsBodyProps> = ({ today }) => {
  const sessions = useSessionRecordsQuery();
  const errorMessage = toSessionRecordsErrorMessage(sessions.error);

  const reload = (): void => {
    void sessions.refetch();
  };

  if (sessions.data !== undefined) {
    return <ManageSessionsView records={sessions.data.sessions} today={today} />;
  }
  if (errorMessage !== null) {
    return <ManageSessionsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={MANAGE_SESSIONS_LOADING_LABEL} listShape="rows" />;
};
