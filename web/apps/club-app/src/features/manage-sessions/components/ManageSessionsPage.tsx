import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
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
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManageSessionsBody today={today} />
      </RequirePermission>
    </KkScreen>
  );
};
