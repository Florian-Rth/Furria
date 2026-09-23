import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { MANAGE_KEYS_LEAD, MANAGE_KEYS_TITLE } from '../manage-keys-labels';
import { ManagedKeysBody } from './ManagedKeysBody';

export const ManagedKeysPage: FC = () => {
  return (
    <KkScreen
      kind="list"
      title={MANAGE_KEYS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_KEYS_TITLE} lead={MANAGE_KEYS_LEAD} />}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.keyHoldingsManage}>
        <ManagedKeysBody />
      </RequirePermission>
    </KkScreen>
  );
};
