import { KkSelectRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { RoleStateChips } from './RoleStateChips';

const ROLES_PATH = '/manage/roles';

interface RolesMasterRowProps {
  entry: RoleMasterEntry;
  selected: boolean;
}

export const RolesMasterRow: FC<RolesMasterRowProps> = ({ entry, selected }) => {
  const search = { role: entry.roleId };

  return (
    <KkSelectRow
      title={entry.name}
      meta={entry.meta ?? undefined}
      trailing={<RoleStateChips isArchived={entry.isArchived} isUnheld={entry.isUnheld} />}
      selected={selected}
      dimmed={entry.isArchived && !selected}
      component={Link}
      to={ROLES_PATH}
      search={search}
    />
  );
};
