import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { useSessionRecordsQuery } from '../api';
import { useDevelopingSessionLogos } from '../hooks/use-developing-session-logos';
import { findSessionRecord } from '../manage-sessions-labels';
import { toSessionRecordsErrorMessage } from '../manage-sessions-messages';
import { SessionEditor } from './SessionEditor';
import { SessionEditorDenied } from './SessionEditorDenied';
import { SessionEditorError } from './SessionEditorError';
import { SessionEditorNotFound } from './SessionEditorNotFound';
import { SessionEditorSkeleton } from './SessionEditorSkeleton';

const ROUTE_ID = '/_app/manage/sessions_/$sessionId/edit';
const TITLE = 'Sessionseintrag bearbeiten';

export const SessionEditScreen: FC = () => {
  const { sessionId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(sessionId);
  const permissions = usePermissions();
  const sessions = useSessionRecordsQuery(permissions.has(PERMISSION_KEYS.clubManage));
  const me = useMeQuery();
  const errorMessage = toSessionRecordsErrorMessage(sessions.error ?? me.error);
  const refreshRecords = (): void => {
    void sessions.refetch();
  };
  useDevelopingSessionLogos(sessions.data?.sessions, refreshRecords);

  const reload = (): void => {
    if (sessions.isError) {
      void sessions.refetch();
    }
    if (me.isError) {
      void me.refetch();
    }
  };

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.clubManage)) {
    return <SessionEditorDenied title={TITLE} />;
  }
  if (sessions.data === undefined || permissions.isUndecided) {
    if (errorMessage !== null) {
      return <SessionEditorError message={errorMessage} onRetry={reload} />;
    }

    return <SessionEditorSkeleton title={TITLE} />;
  }

  const record = findSessionRecord(sessions.data.sessions, id);

  if (record === null) {
    return <SessionEditorNotFound />;
  }

  return <SessionEditor record={record} />;
};
