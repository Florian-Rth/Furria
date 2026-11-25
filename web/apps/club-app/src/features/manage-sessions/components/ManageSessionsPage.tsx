import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { MANAGE_SESSIONS_TITLE } from '../manage-sessions-labels';
import { ManageSessionsBody } from './ManageSessionsBody';
import { SessionsHelp } from './SessionsHelp';

export const ManageSessionsPage: FC = () => {
  const today = new Date();
  const help = toScreenHelp(<SessionsHelp />);

  return (
    <KkScreen
      kind="list"
      title={MANAGE_SESSIONS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_SESSIONS_TITLE} />}
      handover={AREA_HANDOVERS.manage}
      help={help}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManageSessionsBody today={today} />
      </RequirePermission>
    </KkScreen>
  );
};
