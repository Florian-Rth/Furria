import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useSessionRecordsQuery } from '../api';
import { findSessionRecord, toSessionRecordId } from '../manage-sessions-labels';
import { SessionEditor } from './SessionEditor';
import { SessionEditorDenied } from './SessionEditorDenied';
import { SessionEditorNotFound } from './SessionEditorNotFound';
import { SessionEditorSkeleton } from './SessionEditorSkeleton';

const ROUTE_ID = '/_app/manage/sessions_/$sessionId/edit';
const TITLE = 'Sessionseintrag bearbeiten';

export const SessionEditScreen: FC = () => {
  const { sessionId } = useParams({ from: ROUTE_ID });
  const id = toSessionRecordId(sessionId);
  const sessions = useSessionRecordsQuery();
  const permissions = usePermissions();

  if (sessions.data === undefined) {
    return sessions.isLoading ? <SessionEditorSkeleton /> : <SessionEditorNotFound />;
  }

  const record = findSessionRecord(sessions.data.sessions, id);

  if (record === null) {
    return <SessionEditorNotFound />;
  }
  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.clubManage)) {
    return <SessionEditorDenied title={TITLE} />;
  }

  return <SessionEditor record={record} />;
};
