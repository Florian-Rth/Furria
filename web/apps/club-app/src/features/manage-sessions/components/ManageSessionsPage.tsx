import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { MANAGE_SESSIONS_TITLE, SESSIONS_LEAD } from '../manage-sessions-labels';
import { ManageSessionsBody } from './ManageSessionsBody';

export const ManageSessionsPage: FC = () => {
  const today = new Date();

  return (
    <KkScreen
      kind="list"
      title={MANAGE_SESSIONS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_SESSIONS_TITLE} lead={SESSIONS_LEAD} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManageSessionsBody today={today} />
      </RequirePermission>
    </KkScreen>
  );
};
