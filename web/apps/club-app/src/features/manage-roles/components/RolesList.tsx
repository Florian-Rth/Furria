import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { ROSTER_LABEL } from '../roles-hub-copy';
import type { RolePaneTab, RoleSummary } from '../schemas';
import { RoleRosterLine } from './RoleRosterLine';

interface RolesListProps {
  roles: readonly RoleSummary[];
  totalKeys: number;
  compact: boolean;
  selectedId: number | null;
  highlightedKey: string | null;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RolesList: FC<RolesListProps> = ({
  roles,
  totalKeys,
  compact,
  selectedId,
  highlightedKey,
  onOpen,
}) => {
  const lines = roles.map((role) => (
    <RoleRosterLine
      highlightedKey={highlightedKey}
      key={role.roleId}
      role={role}
      totalKeys={totalKeys}
      compact={compact}
      selected={selectedId === role.roleId}
      onOpen={onOpen}
    />
  ));

  if (lines.length === 0) {
    return null;
  }

  return (
    <KkRoster label={ROSTER_LABEL} compact={compact}>
      {lines}
    </KkRoster>
  );
};
