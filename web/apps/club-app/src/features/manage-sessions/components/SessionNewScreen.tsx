import { useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMeQuery, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toSessionRecordsErrorMessage } from '../manage-sessions-messages';
import { SessionEditor } from './SessionEditor';
import { SessionEditorDenied } from './SessionEditorDenied';
import { SessionEditorError } from './SessionEditorError';
import { SessionEditorSkeleton } from './SessionEditorSkeleton';

const TITLE = 'Session hinzufügen';
const NEW_ROUTE_ID = '/_app/manage/sessions_/new';

export const SessionNewScreen: FC = () => {
  const me = useMeQuery();
  const permissions = usePermissions();
  const { startYear } = useSearch({ from: NEW_ROUTE_ID });
  const draftYear = startYear ?? null;
  const errorMessage = toSessionRecordsErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (permissions.isUndecided) {
    if (errorMessage !== null) {
      return <SessionEditorError message={errorMessage} onRetry={reload} />;
    }

    return <SessionEditorSkeleton title={TITLE} />;
  }
  if (!permissions.has(PERMISSION_KEYS.clubManage)) {
    return <SessionEditorDenied title={TITLE} />;
  }

  return <SessionEditor record={null} draftYear={draftYear} />;
};
