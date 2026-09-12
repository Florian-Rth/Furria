import { KkChip, KkSelectRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';

const ARCHIVED_LABEL = 'archiviert';

interface RolesMasterRowProps {
  entry: RoleMasterEntry;
  selected: boolean;
  onSelect: (roleId: number) => void;
}

export const RolesMasterRow: FC<RolesMasterRowProps> = ({ entry, selected, onSelect }) => {
  const select = (): void => {
    onSelect(entry.roleId);
  };

  const trailing = entry.isArchived ? <KkChip size="small">{ARCHIVED_LABEL}</KkChip> : null;

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
