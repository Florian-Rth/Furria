import { KkSwitchRow } from '@furria/ui';
import type { FC } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import type { RolePermissionEntry } from '../manage-roles-labels';

interface RolePermissionRowProps {
  entry: RolePermissionEntry;
  busy: boolean;
  disabled: boolean;
  onToggle: (key: PermissionKey, enabled: boolean) => void;
}

export const RolePermissionRow: FC<RolePermissionRowProps> = ({
  entry,
  busy,
  disabled,
  onToggle,
}) => {
  const change = (enabled: boolean): void => {
    onToggle(entry.key, enabled);
  };

  return (
    <KkSwitchRow
      label={entry.title}
      description={entry.line}
      checked={entry.enabled}
      onChange={change}
      stateLabel={SWITCH_STATE_LABELS}
      stateChip={false}
      busy={busy}
      disabled={disabled}
    />
  );
};
