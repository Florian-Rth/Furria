import { KkChip, KkSelectRow } from '@furria/ui';
import type { FC } from 'react';
import { ARCHIVED_CHIP } from '@/lib/state-chips';
import type { RoleMasterEntry } from '../manage-roles-labels';

interface RolesMasterRowProps {
  entry: RoleMasterEntry;
  selected: boolean;
  onSelect: (roleId: number) => void;
}

export const RolesMasterRow: FC<RolesMasterRowProps> = ({ entry, selected, onSelect }) => {
  const select = (): void => {
    onSelect(entry.roleId);
  };

  const trailing = entry.isArchived ? (
    <KkChip tone={ARCHIVED_CHIP.tone} dot={ARCHIVED_CHIP.dot} size="small">
      {ARCHIVED_CHIP.label}
    </KkChip>
  ) : null;

  return (
    <KkSelectRow
      title={entry.name}
      meta={entry.meta}
      trailing={trailing}
      selected={selected}
      dimmed={entry.isArchived && !selected}
      onClick={select}
    />
  );
};
