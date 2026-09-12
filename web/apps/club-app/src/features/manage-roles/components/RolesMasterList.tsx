import { KkMeta, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { toNoRoleSearchResultLine } from '../manage-roles-labels';
import { RolesMasterRow } from './RolesMasterRow';

interface RolesMasterListProps {
  entries: readonly RoleMasterEntry[];
  term: string | null;
  selectedRoleId: number | null;
  onSelect: (roleId: number) => void;
}

export const RolesMasterList: FC<RolesMasterListProps> = ({
  entries,
  term,
  selectedRoleId,
  onSelect,
}) => {
  if (entries.length === 0) {
    return <KkMeta italic>{toNoRoleSearchResultLine(term ?? '')}</KkMeta>;
  }

  const rows = entries.map((entry) => (
    <RolesMasterRow
      key={entry.roleId}
      entry={entry}
      selected={entry.roleId === selectedRoleId}
      onSelect={onSelect}
    />
  ));

  return (
    <KkPanel variant="list" sx={{ p: 0.75 }}>
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>{rows}</Stack>
    </KkPanel>
  );
};
