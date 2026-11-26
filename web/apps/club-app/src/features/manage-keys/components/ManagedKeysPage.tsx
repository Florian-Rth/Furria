import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { MANAGE_KEYS_TITLE } from '../manage-keys-labels';
import { KeysHelp } from './KeysHelp';
import { ManagedKeysBody } from './ManagedKeysBody';

const help = toScreenHelp(<KeysHelp />);

export const ManagedKeysPage: FC = () => {
  return (
    <KkScreen
      kind="list"
      title={MANAGE_KEYS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_KEYS_TITLE} />}
      handover={AREA_HANDOVERS.manage}
      help={help}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.keyHoldingsManage}>
        <ManagedKeysBody />
      </RequirePermission>
    </KkScreen>
  );
};
