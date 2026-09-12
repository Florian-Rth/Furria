import { KkSelectRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { RoleStateChips } from './RoleStateChips';

interface RolesMasterRowProps {
  entry: RoleMasterEntry;
  selected: boolean;
  onSelect: (roleId: number) => void;
}

export const RolesMasterRow: FC<RolesMasterRowProps> = ({ entry, selected, onSelect }) => {
  const select = (): void => {
    onSelect(entry.roleId);
  };

  return (
    <KkSelectRow
      title={entry.name}
      meta={entry.meta ?? undefined}
      trailing={<RoleStateChips isArchived={entry.isArchived} isUnheld={entry.isUnheld} />}
      selected={selected}
      dimmed={entry.isArchived && !selected}
      onClick={select}
    />
  );
};
