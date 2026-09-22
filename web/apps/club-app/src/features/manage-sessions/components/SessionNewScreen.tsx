import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { SessionEditor } from './SessionEditor';
import { SessionEditorDenied } from './SessionEditorDenied';

const TITLE = 'Session hinzufügen';

export const SessionNewScreen: FC = () => {
  const permissions = usePermissions();

  if (!permissions.isUndecided && !permissions.has(PERMISSION_KEYS.clubManage)) {
    return <SessionEditorDenied title={TITLE} />;
  }

  return <SessionEditor record={null} />;
};
