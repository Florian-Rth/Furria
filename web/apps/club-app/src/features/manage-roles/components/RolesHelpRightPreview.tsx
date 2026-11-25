import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { toPermissionCopy } from '../role-permission-copy';

const SAMPLE_RIGHT = toPermissionCopy(PERMISSION_KEYS.groupsManage);

const keep = (): void => {};

export const RolesHelpRightPreview: FC = () => (
  <KkSwitchRow
    label={SAMPLE_RIGHT.title}
    description={SAMPLE_RIGHT.line}
    checked
    onChange={keep}
    stateLabel={SWITCH_STATE_LABELS}
    stateChip={false}
  />
);
