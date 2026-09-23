import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { MANAGE_VENUES_LEAD, MANAGE_VENUES_TITLE } from '../manage-venues-labels';
import { ManagedVenuesBody } from './ManagedVenuesBody';

export const ManagedVenuesPage: FC = () => {
  return (
    <KkScreen
      kind="list"
      title={MANAGE_VENUES_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_VENUES_TITLE} lead={MANAGE_VENUES_LEAD} />}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManagedVenuesBody />
      </RequirePermission>
    </KkScreen>
  );
};
